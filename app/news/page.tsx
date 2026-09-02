import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import SocialFeeds from '../components/SocialFeeds';
import { getSiteContent, visibleItems } from '../../db/site-content';
import { formatClubDate } from '../club-date-format';
import { displayNewsDate, getClubNews } from '../../lib/club-news';

export const metadata: Metadata = {
  title: 'News & Media | St. Mochtas GFC',
  description: 'The latest St. Mochtas GFC news, club notices, reports, videos and podcasts.',
  alternates: { canonical: '/news' },
};

export const revalidate = 86400;

type NewsItem = {
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
    return {
      title,
      url: tag(block, 'link') || tag(block, 'guid'),
      date: tag(block, 'pubDate') || tag(block, 'dc:date'),
      source,
      summary: excerpt(body, `Coverage mentioning St. Mochtas GFC from ${source}.`),
      format: 'Read' as const,
      body,
      allowBodyMatch,
      trustedQueryMatch,
    };
  });
}

function parseYouTube(xml: string): NewsItem[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const block = match[1];
    const body = tag(block, 'media:description');
    return {
      title: tag(block, 'title'),
      url: attribute(block, 'link', 'href'),
      date: tag(block, 'published'),
      source: 'Louth and Proud',
      summary: excerpt(body, 'Watch the latest Louth Gaelic games coverage from Louth and Proud.'),
      format: 'Watch' as const,
      body,
      allowBodyMatch: true,
    };
  });
}

type LouthGaaPost = {
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
};

function parseLouthGaaPosts(posts: LouthGaaPost[]): NewsItem[] {
  return posts.map((post) => {
    const title = cleanText(post.title?.rendered ?? '');
    const body = cleanText(post.content?.rendered || post.excerpt?.rendered || '');
    return {
      title,
      url: post.link ?? '',
      date: post.date ?? '',
      source: 'Louth GAA',
      summary: excerpt(body, 'Official Louth GAA coverage mentioning St. Mochtas GFC.'),
      format: 'Read' as const,
      body,
      allowBodyMatch: true,
    };
  });
}

async function loadFeed(url: string, parser: (xml: string) => NewsItem[]) {
  const response = await fetch(url, {
    headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`Feed unavailable: ${response.status}`);
  return parser(await response.text());
}

async function loadLouthGaaArchive() {
  const response = await fetch(LOUTH_GAA_SEARCH, {
    headers: { accept: 'application/json' },
    next: { revalidate: 86400 },
  });
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

async function getNews() {
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
    if (!item.title || !item.url) return [];
    if (!isGaelicCoverage(item)) return [];
    if (CLUB_TERMS.test(item.title)) {
      return [{ ...item, matchLabel: 'Club headline' as const }];
    }
    if (item.allowBodyMatch && CLUB_TERMS.test(item.body)) {
      return [{
        ...item,
        summary: clubExcerpt(item.body, `This report includes an update on St. Mochtas GFC.`),
        matchLabel: 'Includes St. Mochtas' as const,
      }];
    }
    if (item.trustedQueryMatch) {
      return [{
        ...item,
        summary: excerpt(item.body, `This ${item.source} report includes St. Mochtas GFC.`),
        matchLabel: 'Includes St. Mochtas' as const,
      }];
    }
    return [];
  });
  const seen = new Set<string>();

  return relevant
    .filter((item) => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 12);
}

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Latest' : new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default async function NewsPage() {
  const [news, siteContent] = await Promise.all([getClubNews(), getSiteContent()]);
  const clubUpdates = visibleItems(siteContent.updates);

  return (
    <main className="archive-page news-page">
      <SiteNavigation variant="sub" current="news" />

      <section className="page-hero news-hero">
        <div className="shell">
          <p className="eyebrow">News & media</p>
          <h1>From the club<br /><em>and around Louth.</em></h1>
          <p>Club notices first, followed by reports, interviews, videos and podcasts mentioning St. Mochtas.</p>
        </div>
      </section>

      <section className="news-source-strip">
        <div className="shell">
          <p>Monitored daily</p>
          <a href={siteContent.links.facebook} target="_blank" rel="noreferrer">Club Facebook</a>
          <a href={siteContent.links.instagram} target="_blank" rel="noreferrer">Club Instagram</a>
          <a href={siteContent.links.louthGaa} target="_blank" rel="noreferrer">Louth GAA</a>
          <a href="https://www.lmfm.ie/news/sport/" target="_blank" rel="noreferrer">LMFM Sport</a>
          <a href="https://hoganstand.com/Louth" target="_blank" rel="noreferrer">HoganStand</a>
          <a href="https://www.dundalkdemocrat.ie/news/louth-sport/" target="_blank" rel="noreferrer">Dundalk Democrat</a>
          <a href="https://www.independent.ie/regionals/louth/sport/gaa/" target="_blank" rel="noreferrer">The Argus</a>
          <a href="https://www.youtube.com/@LouthandProudable" target="_blank" rel="noreferrer">Louth and Proud</a>
          <a href="https://x.com/search?q=%22St%20Mochtas%22%20OR%20%40StMochtas1934&src=typed_query&f=live" target="_blank" rel="noreferrer">X mentions</a>
          <span>Original sources always linked</span>
        </div>
      </section>

      <SocialFeeds priorityOnly facebookUrl={siteContent.links.facebook} instagramUrl={siteContent.links.instagram} xUrl={siteContent.links.x} />

      {clubUpdates.length > 0 && <section className="club-authored-updates shell">
        <div className="automated-news-heading"><div><p className="eyebrow blue">From the committee</p><h2>Club updates.</h2></div><p>News published directly by authorised St. Mochtas website administrators.</p></div>
        <div className="automated-news-grid">{clubUpdates.map((item, index) => <article key={`${item.title}-${index}`}>{item.image && <img className="club-news-image" src={item.image} alt={item.imageAlt || ''} />}<div className="news-card-meta"><span>St. Mochtas GFC</span><time>{item.date ? formatClubDate(item.date) : 'Latest'}</time></div><h3>{item.title}</h3><p>{item.body || item.summary}</p>{item.href && <a href={item.href}>{item.action || 'Read more'} <b>→</b></a>}</article>)}</div>
      </section>}

      <section className="automated-news shell">
        <div className="automated-news-heading">
          <div>
            <p className="eyebrow blue">Across the county</p>
            <h2>St. Mochtas in the news.</h2>
          </div>
          <p>This section checks its approved public sources each day. Headlines remain the property of their publishers and every card links to the original item.</p>
        </div>

        {news.length > 0 ? (
          <div className="automated-news-grid">
            {news.map((item, index) => (
              <article key={`${item.url}-${index}`}>
                <div className="news-card-meta"><span>{item.source} · {item.matchLabel}</span><time>{displayNewsDate(item.date)}</time></div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">{item.format} original <b>↗</b></a>
              </article>
            ))}
          </div>
        ) : (
          <div className="news-empty">
            <h3>No new St. Mochtas coverage found today.</h3>
            <p>The monitored feeds will be checked again automatically. Club notices remain available above through Facebook and Instagram.</p>
          </div>
        )}
      </section>

      <section className="news-media-band">
        <div className="shell">
          <div className="news-media-heading">
            <div>
              <p className="eyebrow">Follow the action</p>
              <h2>Listen in.<br /><em>Watch St. Mochtas.</em></h2>
            </div>
            <p>Hear the interviews, follow the local conversation and watch available Louth club games live or on demand.</p>
          </div>

          <div className="media-platform-grid">
            <a className="media-platform-card media-lmfm" href="https://www.lmfm.ie/news/sport/" target="_blank" rel="noreferrer">
              <span className="media-logo"><img src="https://mm.aiircdn.com/616/5d5138dc14031.png" alt="LMFM" /></span>
              <span className="media-copy"><small>Local radio &amp; sport</small><strong>Reports, interviews and live coverage.</strong></span>
              <b>Open LMFM Sport <i>↗</i></b>
            </a>

            <a className="media-platform-card media-louth-proud" href="https://www.patreon.com/cw/Louthandproud" target="_blank" rel="noreferrer">
              <span className="media-logo"><img src="https://www.louthandproud.com/wp-content/uploads/2019/07/LP_-Logotype-Artwork-01.png" alt="Louth and Proud" /></span>
              <span className="media-copy"><small>County conversation</small><strong>Podcasts, interviews and shows.</strong></span>
              <b>Visit Louth and Proud <i>↗</i></b>
            </a>

            <a className="media-platform-card media-clubber" href="https://www.clubber.ie/" target="_blank" rel="noreferrer">
              <span className="media-logo"><img src="https://www.clubber.ie/assets/logos/Clubber-tv.svg" alt="Clubber TV" /></span>
              <span className="media-copy"><small>Live &amp; on demand</small><strong>Watch available Louth club games.</strong></span>
              <b>Watch on Clubber <i>↗</i></b>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
