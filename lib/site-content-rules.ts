import type { ContentSection, Honour, SiteContent, Sponsor } from '../db/site-content';

const honourCategories: Honour['category'][] = ['men', 'ladies', 'underage'];
const sponsorStyles: Sponsor['style'][] = ['standard', 'cti', 'mcardle', 'lynch'];

function cleanStrings<T>(value: T): T {
  if (typeof value === 'string') return value.trim().replace(/[ \t]{2,}/g, ' ') as T;
  if (Array.isArray(value)) return value.map((item) => cleanStrings(item)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanStrings(item)])) as T;
  return value;
}

function positioned<T extends { sortOrder: string }>(items: T[]) {
  return [...items]
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((item, index) => ({ ...item, sortOrder: String(index + 1) }));
}

export function normaliseHonours(items: Honour[]) {
  return honourCategories.flatMap((category) => positioned(items
    .filter((item) => item?.category === category)
    .map((item) => {
      const years = Array.from(new Set((item.years ?? '').match(/\b(?:18|19|20|21)\d{2}\b/g) ?? [])).sort((a, b) => Number(a) - Number(b));
      return { ...item, years: years.length ? years.join(' · ') : (item.years ?? '').trim() };
    })));
}

export function normaliseSection<K extends ContentSection>(section: K, value: SiteContent[K]): SiteContent[K] {
  const cleaned = cleanStrings(value);
  if (section === 'honours') return normaliseHonours(cleaned as SiteContent['honours']) as SiteContent[K];
  if (section === 'sponsors') return positioned((cleaned as SiteContent['sponsors']).map((item) => ({ ...item, style: sponsorStyles.includes(item.style) ? item.style : 'standard' }))) as SiteContent[K];
  if (section === 'shops') return positioned(cleaned as SiteContent['shops']) as SiteContent[K];
  if (section === 'fixtures') return (cleaned as SiteContent['fixtures']).map((item) => ({ ...item, timeTbc: item.timeTbc === 'true' ? 'true' : 'false' })) as SiteContent[K];
  if (section === 'officers') return (cleaned as SiteContent['officers']).map((item) => ({ ...item, email: (item.email ?? '').toLowerCase() })) as SiteContent[K];
  if (section === 'contact') { const item = cleaned as SiteContent['contact']; return { email: (item.email ?? '').toLowerCase(), address: item.address ?? '', eircode: (item.eircode ?? '').toUpperCase(), mapUrl: item.mapUrl ?? '', directionsUrl: item.directionsUrl ?? '' } as SiteContent[K]; }
  if (section === 'links') { const item = cleaned as SiteContent['links']; return { membership: item.membership ?? '', facebook: item.facebook ?? '', instagram: item.instagram ?? '', x: item.x ?? '', louthGaa: item.louthGaa ?? '', louthLgfa: item.louthLgfa ?? '' } as SiteContent[K]; }
  return cleaned;
}

export function normaliseSiteContent(content: SiteContent): SiteContent {
  return {
    notices: normaliseSection('notices', content.notices),
    fixtures: normaliseSection('fixtures', content.fixtures),
    results: normaliseSection('results', content.results),
    updates: normaliseSection('updates', content.updates),
    sponsors: normaliseSection('sponsors', content.sponsors),
    shops: normaliseSection('shops', content.shops),
    officers: normaliseSection('officers', content.officers),
    gallery: normaliseSection('gallery', content.gallery),
    history: normaliseSection('history', content.history),
    honours: normaliseSection('honours', content.honours),
    contact: normaliseSection('contact', content.contact),
    links: normaliseSection('links', content.links),
  };
}

const text = (item: Record<string, unknown>, key: string) => String(item[key] ?? '').trim();
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
const validTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } };
const validLink = (value: string) => value.startsWith('/') || validHttpUrl(value) || value.startsWith('mailto:');
const validAsset = (value: string) => value.startsWith('/') || validHttpUrl(value);
const optionalLink = (value: string) => !value || validLink(value);

export function validateSectionForPublish(section: ContentSection, data: unknown): string | null {
  const items = Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
  const missing = (fields: string[]) => items.some((item) => fields.some((field) => !text(item, field)));
  const invalidSchedule = items.some((item) => {
    const start = text(item, 'publishAt'); const end = text(item, 'expiresAt');
    const startTime = start ? Date.parse(start) : NaN; const endTime = end ? Date.parse(end) : NaN;
    return (!!start && Number.isNaN(startTime)) || (!!end && Number.isNaN(endTime)) || (!Number.isNaN(startTime) && !Number.isNaN(endTime) && startTime >= endTime);
  });
  if (invalidSchedule) return 'Scheduled visibility dates must be valid, and “Remove after” must be later than “Show from”.';
  switch (section) {
    case 'notices':
      if (missing(['label', 'category', 'title', 'copy', 'action', 'href']) || items.some((item) => !validLink(text(item, 'href')))) return 'Each notice needs its labels, heading, notice text and a valid button link.';
      break;
    case 'fixtures':
      if (missing(['day', 'team', 'game', 'venue', 'tag']) || items.some((item) => !validDate(text(item, 'day')) || (text(item, 'timeTbc') !== 'true' && !validTime(text(item, 'time'))))) return 'Each fixture needs a valid match date, team, competition, fixture and venue. Add a throw-in time or select “Time not confirmed”.';
      break;
    case 'results':
      if (missing(['date', 'team', 'competition', 'home', 'homeScore', 'away', 'awayScore']) || items.some((item) => !validDate(text(item, 'date')) || !optionalLink(text(item, 'reportUrl')))) return 'Each result needs a valid date, team, competition, both teams and both scores. Match report links must be valid web addresses.';
      break;
    case 'updates':
      if (missing(['date', 'title']) || items.some((item) => !validDate(text(item, 'date')) || (!text(item, 'summary') && !text(item, 'body')) || (text(item, 'image') && (!validAsset(text(item, 'image')) || !text(item, 'imageAlt'))) || !optionalLink(text(item, 'href')))) return 'Each news story needs a valid date, headline and summary or article text. Images need a valid address and description; links must also be valid.';
      break;
    case 'sponsors':
      if (missing(['name', 'tier', 'href', 'image']) || items.some((item) => !validHttpUrl(text(item, 'href')) || !validAsset(text(item, 'image')) || !sponsorStyles.includes(text(item, 'style') as Sponsor['style']))) return 'Each sponsor needs a business name, tier, website, logo and one of the available colour treatments.';
      break;
    case 'shops':
      if (missing(['name', 'description', 'href']) || items.some((item) => !validHttpUrl(text(item, 'href')) || (text(item, 'image') && !validAsset(text(item, 'image'))))) return 'Each shop provider needs a name, description and valid shop address. Optional logo addresses must also be valid.';
      break;
    case 'officers':
      if (missing(['role', 'name']) || items.some((item) => text(item, 'email') && !validEmail(text(item, 'email')))) return 'Each committee entry needs a role and name. Any public email entered must be valid.';
      break;
    case 'gallery':
      if (missing(['image', 'alt', 'caption']) || items.some((item) => !validAsset(text(item, 'image')))) return 'Each homepage photograph needs a valid image address, accessible description and caption.';
      break;
    case 'history':
      if (missing(['period', 'title', 'text'])) return 'Each history chapter needs a period, chapter heading and history text.';
      break;
    case 'honours': {
      const validCategories = new Set(honourCategories);
      if (items.some((item) => !validCategories.has(text(item, 'category') as Honour['category']) || !text(item, 'competition') || !/\b(?:18|19|20|21)\d{2}\b/.test(text(item, 'years')))) return 'Each honour needs a section, competition name and at least one valid winning year.';
      break;
    }
    case 'contact': {
      const item = data as Record<string, unknown>;
      if (!validEmail(text(item, 'email')) || !text(item, 'address') || !text(item, 'eircode') || !validHttpUrl(text(item, 'mapUrl')) || !validHttpUrl(text(item, 'directionsUrl'))) return 'Contact details need a valid club email, postal address, Eircode, map address and directions link.';
      break;
    }
    case 'links': {
      const item = data as Record<string, unknown>;
      if (['membership', 'facebook', 'instagram', 'x', 'louthGaa', 'louthLgfa'].some((field) => !validHttpUrl(text(item, field)))) return 'Membership, social media and county links must all be complete web addresses beginning with https://.';
      break;
    }
  }
  return null;
}
