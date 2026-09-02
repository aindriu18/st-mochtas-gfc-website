import { headers } from 'next/headers';

export type ChatGPTUser = { id: string; email: string; name: string | null };

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const id = requestHeaders.get('oai-authenticated-user-id');
  const email = requestHeaders.get('oai-authenticated-user-email');
  if (!id || !email) return null;

  const encodedName = requestHeaders.get('oai-authenticated-user-full-name');
  const encoding = requestHeaders.get('oai-authenticated-user-full-name-encoding');
  let name: string | null = null;
  if (encodedName && encoding === 'percent-encoded-utf-8') {
    try { name = decodeURIComponent(encodedName); } catch { name = null; }
  }
  return { id, email: email.toLowerCase(), name };
}
