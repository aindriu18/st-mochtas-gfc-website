import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { getChatGPTUser } from './chatgpt-auth';
import { isArchiveAdmin } from '../db/archive';

const SESSION_COOKIE = '__Host-st-mochtas-admin';
const SESSION_SECONDS = 7 * 24 * 60 * 60;

type AuthEnvironment = Cloudflare.Env & {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  ADMIN_SESSION_SECRET?: string;
};

export type ClubAdminUser = {
  email: string;
  name: string | null;
  method: 'club' | 'chatgpt';
};

export type AdminAuthFailure = {
  ok: false;
  error: string;
  code: string;
  status: number;
  reference: string;
  retryAfterSeconds?: number;
};

type AdminAuthResult = { ok: true } | AdminAuthFailure;

function authConfig() {
  const runtime = env as AuthEnvironment;
  const url = runtime.SUPABASE_URL?.replace(/\/$/, '');
  const key = runtime.SUPABASE_PUBLISHABLE_KEY;
  const secret = runtime.ADMIN_SESSION_SECRET;
  return url && key && secret ? { url, key, secret } : null;
}

export function independentAdminLoginConfigured() {
  return authConfig() !== null;
}

function encode(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(value: string) {
  const normalised = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createClubAdminSession(email: string) {
  const config = authConfig();
  if (!config) throw new Error('Independent administrator login is not configured.');
  const payload = encode(JSON.stringify({
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    nonce: crypto.randomUUID(),
  }));
  const signature = new Uint8Array(await crypto.subtle.sign(
    'HMAC',
    await signingKey(config.secret),
    new TextEncoder().encode(payload),
  ));
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${payload}.${encode(signature)}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

async function getIndependentAdmin(): Promise<ClubAdminUser | null> {
  const config = authConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payload, encodedSignature] = token.split('.');
  if (!payload || !encodedSignature) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await signingKey(config.secret),
      decode(encodedSignature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(payload))) as { email?: string; exp?: number };
    if (!session.email || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!isArchiveAdmin(session.email)) return null;
    return { email: session.email.toLowerCase(), name: null, method: 'club' };
  } catch {
    return null;
  }
}

export async function getClubAdminUser(): Promise<ClubAdminUser | null> {
  const independent = await getIndependentAdmin();
  if (independent) return independent;

  const chatgpt = await getChatGPTUser();
  if (!chatgpt || !isArchiveAdmin(chatgpt.email)) return null;
  return { email: chatgpt.email, name: chatgpt.name, method: 'chatgpt' };
}

export async function clearClubAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function requestSupabaseMagicLink(email: string, redirectTo: string) {
  const config = authConfig();
  if (!config) return authFailure(
    'not_configured',
    'Club email sign-in has not been configured. Contact the website administrator.',
    503,
  );

  try {
    const response = await fetch(`${config.url}/auth/v1/otp`, {
      method: 'POST',
      headers: { apikey: config.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: true, redirect_to: redirectTo }),
    });
    if (response.ok) return { ok: true } satisfies AdminAuthResult;

    const details = await readSupabaseError(response);
    if (response.status === 429 && details.code === 'over_email_send_rate_limit') {
      return authFailure(
        details.code,
        'Too many sign-in emails have been requested. Wait about one hour before trying again. If you already have a recent email, use the newest link instead.',
        429,
        60 * 60,
      );
    }
    if (response.status === 429) {
      return authFailure(
        details.code || 'request_rate_limit',
        'A sign-in email was requested too recently. Wait at least one minute, then try once more.',
        429,
        60,
      );
    }
    if (response.status === 400 || response.status === 422) {
      return authFailure(
        details.code || 'email_rejected',
        'The email address could not be accepted. Check the address and try again.',
        400,
      );
    }
    if (response.status >= 500) {
      return authFailure(
        details.code || 'email_service_unavailable',
        'The sign-in email service is temporarily unavailable. Wait a few minutes and try again.',
        503,
      );
    }
    return authFailure(
      details.code || 'email_request_failed',
      'The sign-in email could not be sent. Contact the website administrator and quote the reference below.',
      503,
    );
  } catch {
    return authFailure(
      'email_service_unreachable',
      'The sign-in service could not be reached. Check your connection and try again in a few minutes.',
      503,
    );
  }
}

export async function exchangeSupabaseAccessToken(accessToken: string) {
  const config = authConfig();
  if (!config) return authFailure(
    'not_configured',
    'Club email sign-in has not been configured. Contact the website administrator.',
    503,
  );
  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.key, Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const details = await readSupabaseError(response);
      return authFailure(
        details.code || 'invalid_or_expired_link',
        'This sign-in link has expired or has already been used. Return to the admin page and request one new link.',
        response.status === 401 || response.status === 403 ? response.status : 400,
      );
    }
    const result = await response.json() as { email?: string };
    const verifiedEmail = result.email?.toLowerCase();
    if (!verifiedEmail || !isArchiveAdmin(verifiedEmail)) {
      return authFailure(
        'not_authorised',
        'This email is not approved for St. Mochtas website administration. Ask a club website owner to grant access.',
        403,
      );
    }
    await createClubAdminSession(verifiedEmail);
    return { ok: true } satisfies AdminAuthResult;
  } catch {
    return authFailure(
      'verification_service_unreachable',
      'Your sign-in could not be completed because the verification service could not be reached. Try the link again in a few minutes.',
      503,
    );
  }
}

async function readSupabaseError(response: Response) {
  try {
    const body = await response.json() as { code?: string; error_code?: string; msg?: string; message?: string };
    return { code: body.error_code ?? body.code ?? '', message: body.msg ?? body.message ?? '' };
  } catch {
    return { code: '', message: '' };
  }
}

function authFailure(code: string, error: string, status: number, retryAfterSeconds?: number): AdminAuthFailure {
  const reference = crypto.randomUUID().slice(0, 8).toUpperCase();
  console.warn(JSON.stringify({ event: 'club_admin_auth_failure', code, status, reference }));
  return { ok: false, code, error, status, reference, retryAfterSeconds };
}
