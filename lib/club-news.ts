export type NewsItem = {
  title: string;
  url: string;
  date: string;
  source: string;
  summary: string;
  format: 'Read' | 'Watch' | 'Listen';
  body: string;
  allowBodyMatch: boolean;
  trustedQueryMatch?: boolean;
  matchLabel?: 'Club headline' | 'Includes St. Mochtas';
};

export type NewsCardItem = Pick<NewsItem, 'title' | 'url' | 'date' | 'source' | 'summary' | 'format' | 'matchLabel'>;

const CLUB_TERMS = /st[.\s-]*mochta(?:['’]?s)?|mochtas/i;
const GAELIC_TERMS = /\bGAA\b|\bGFC\b|Gaelic|Louth GAA|Louth LGFA|Cardinal O['’]Donnell|Senior Football Championship|\bSFC\b/i;
const SOCCER_TERMS = /\bFAI\b|Dundalk FC|Malahide United|Cobh Wanderers|Finglas United|Sofascore|live score|Premier Division|Leinster Senior Cup|St[.\s-]*Mochta['’]?s FC/i;
const GOOGLE_NEWS_QUERY = encodeURIComponent('("St Mochtas" OR "St Mochta\'s") (GAA OR GFC OR Gaelic OR Louth) -FAI -soccer');
const GOOGLE_NEWS_FEED = `https://news.google.com/rss/search?q=${GOOGLE_NEWS_QUERY}&hl=en-IE&gl=IE&ceid=IE%3Aen`;
const LMFM_NEWS_QUERY = encodeURIComponent('site:lmfm.ie/news/sport ("St Mochtas" OR "St. Mochtas" OR "Mochtas") GAA');
const LMFM_NEWS_FEED = `https://news.google.com/rss/search?q=${LMFM_NEWS_QUERY}&hl=en-IE&gl=IE&ceid=IE%3Aen`;
const HOGANSTAND_QUERY = encodeURIComponent('site:hoganstand.com/Louth ("St Mochtas" OR "St. Mochtas" OR "Mochtas")');
const HOGANSTAND_FEED = `https://news.google.com/rss/search?q=${HOGANSTAND_QUERY}&hl=en-IE&gl=IE&ceid=IE%3Aen`;
const DUNDALK_DEMOCRAT_QUERY = encodeURIComponent('(site:dundalkdemocrat.ie OR site:louthlive.ie) ("St Mochtas" OR "St. Mochtas" OR "Mochtas") GAA');
const DUNDALK_DEMOCRAT_FEED = `https://news.google.com/rss/search?q=${DUNDALK_DEMOCRAT_QUERY}&hl=en-IE&gl=IE&ceid=IE%3Aen`;
const ARGUS_QUERY = encodeURIComponent('site:independent.ie/regionals/louth ("St Mochtas" OR "St. Mochtas" OR "Mochtas") (GAA OR LGFA OR Gaelic)');
const ARGUS_FEED = `https://news.google.com/rss/search?q=${ARGUS_QUERY}&hl=en-IE&gl=IE&ceid=IE%3Aen`;
const LOUTH_GAA_SEARCH = 'https://louthgaa.ie/wp-json/wp/v2/posts?search=Mochta&per_page=30&_fields=date,link,title,excerpt,content';
const LOUTH_AND_PROUD_YOUTUBE = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCTHIx2hVGem-8P_YzqZS95w';

function decodeEntities(value: string) {
  const named: Record<string, string> = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ' };
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function cleanText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? cleanText(match[1]) : '';
}

function attribute(block: string, name: string, attributeName: string) {
  const match = block.match(new RegExp(`<${name}[^>]*${attributeName}=["']([^"']+)["'][^>]*>`, 'i'));
  return match ? decodeEntities(match[1]) : '';
}

function excerpt(value: string, fallback: string) {
  const cleaned = cleanText(value);
  if (cleaned.length < 45) return fallback;
  return cleaned.length > 190 ? `${cleaned.slice(0, 187).trim()}…` : cleaned;
}

function clubExcerpt(value: string, fallback: string) {
  const cleaned = cleanText(value);
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  const index = sentences.findIndex((sentence) => CLUB_TERMS.test(sentence));
  if (index === -1) return excerpt(cleaned, fallback);
  const selected = [sentences[index], sentences[index + 1]].filter(Boolean).join(' ').trim();
  return selected.length > 230 ? `${selected.slice(0, 227).trim()}…` : selected;
}

function parseRss(xml: string, defaultSource: string, allowBodyMatch = false, trustedQueryMatch = false): NewsItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const block = match[1];
    const title = tag(block, 'title');
    const source = tag(block, 'source') || defaultSource;
    const body = tag(block, 'content:encoded') || tag(block, 'description');
    return { title, url: tag(block, 'link') || tag(block, 'guid'), date: tag(block, 'pubDate') || tag(block, 'dc:date'), source, summary: excerpt(body, `Coverage mentioning St. Mochtas GFC from ${source}.`), format: 'Read' as const, body, allowBodyMatch, trustedQueryMatch };
  });
}

function parseYouTube(xml: string): NewsItem[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const block = match[1];
    const body = tag(block, 'media:description');
    return { title: tag(block, 'title'), url: attribute(block, 'link', 'href'), date: tag(block, 'published'), source: 'Louth and Proud', summary: excerpt(body, 'Watch the latest Louth Gaelic games coverage from Louth and Proud.'), format: 'Watch' as const, body, allowBodyMatch: true };
  });
}

type LouthGaaPost = { date?: string; link?: string; title?: { rendered?: string }; excerpt?: { rendered?: string }; content?: { rendered?: string } };

function parseLouthGaaPosts(posts: LouthGaaPost[]): NewsItem[] {
  return posts.map((post) => {
    const title = cleanText(post.title?.rendered ?? '');
    const body = cleanText(post.content?.rendered || post.excerpt?.rendered || '');
    return { title, url: post.link ?? '', date: post.date ?? '', source: 'Louth GAA', summary: excerpt(body, 'Official Louth GAA coverage mentioning St. Mochtas GFC.'), format: 'Read' as const, body, allowBodyMatch: true };
  });
}

async function loadFeed(url: string, parser: (xml: string) => NewsItem[]) {
  const response = await fetch(url, { headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' }, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Feed unavailable: ${response.status}`);
  return parser(await response.text());
}

async function loadLouthGaaArchive() {
  const response = await fetch(LOUTH_GAA_SEARCH, { headers: { accept: 'application/json' }, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Louth GAA archive unavailable: ${response.status}`);
  return parseLouthGaaPosts(await response.json() as LouthGaaPost[]);
}

function isGaelicCoverage(item: NewsItem) {
  if (item.source === 'Louth GAA' || item.source === 'Louth and Proud') return true;
  if (item.trustedQueryMatch) return !SOCCER_TERMS.test(`${item.title} ${item.body}`);
  const context = `${item.title} ${item.body} ${item.source}`;
  if (SOCCER_TERMS.test(context)) return false;
  return GAELIC_TERMS.test(context);
}

export async function getClubNews() {
  const results = await Promise.allSettled([
    loadFeed(GOOGLE_NEWS_FEED, (xml) => parseRss(xml, 'News coverage')),
    loadFeed(LMFM_NEWS_FEED, (xml) => parseRss(xml, 'LMFM', false, true)),
    loadFeed(HOGANSTAND_FEED, (xml) => parseRss(xml, 'HoganStand', false, true)),
    loadFeed(DUNDALK_DEMOCRAT_FEED, (xml) => parseRss(xml, 'Dundalk Democrat / Louth Live', false, true)),
    loadFeed(ARGUS_FEED, (xml) => parseRss(xml, 'The Argus', false, true)),
    loadLouthGaaArchive(),
    loadFeed(LOUTH_AND_PROUD_YOUTUBE, parseYouTube),
  ]);
  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const relevant: NewsItem[] = items.flatMap<NewsItem>((item): NewsItem[] => {
    if (!item.title || !item.url || !isGaelicCoverage(item)) return [];
    if (CLUB_TERMS.test(item.title)) return [{ ...item, matchLabel: 'Club headline' as const }];
    if (item.allowBodyMatch && CLUB_TERMS.test(item.body)) return [{ ...item, summary: clubExcerpt(item.body, 'This report includes an update on St. Mochtas GFC.'), matchLabel: 'Includes St. Mochtas' as const }];
    if (item.trustedQueryMatch) return [{ ...item, summary: excerpt(item.body, `This ${item.source} report includes St. Mochtas GFC.`), matchLabel: 'Includes St. Mochtas' as const }];
    return [];
  });
  const seen = new Set<string>();
  return relevant.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 12);
}

export function displayNewsDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Latest' : new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
