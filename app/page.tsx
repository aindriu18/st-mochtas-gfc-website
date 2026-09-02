import type { Metadata } from 'next';
import SiteNavigation from './components/SiteNavigation';
import SocialFeeds from './components/SocialFeeds';
import { getSiteContent, visibleItems } from '../db/site-content';
import { formatClubDate, formatClubTime } from './club-date-format';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const countyRepresentatives = [
  ['Craig Lennon', 'Louth senior football', 'Louth senior panellist · 2024 PwC All-Star · 2025 Leinster champion.', 'https://www.sportsfile.com/web/winshare/w540/Library/SF1524/2975660.jpg'],
  ['Eimear Byrne', 'Louth ladies football', 'Honoured on the TG4 Junior Team of the Championship.', 'https://www.sportsfile.com/web/winshare/w540/Library/SF1522/2969922.jpg'],
  ['Ciarán Byrne', 'Louth senior football', 'Louth senior panellist · 2025 Leinster champion · Man of the Match v Dublin.', 'https://louthgaa.ie/wp-content/uploads/2026/06/3473834-scaled.jpg'],
];

export default async function Home() {
  const content = await getSiteContent();
  const fixtures = visibleItems(content.fixtures);
  const results = visibleItems(content.results);
  const clubNotices = visibleItems(content.notices);
  const sponsors = visibleItems(content.sponsors).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const gallery = visibleItems(content.gallery);
  return (
    <main>
      <section className="hero" id="home">
        <SiteNavigation />
        <div className="hero-content shell">
          <p className="eyebrow">Louth Village · County Louth</p>
          <h1>St. Mochtas<br /><em>GFC.</em></h1>
          <p className="hero-copy">News, fixtures and club information from Louth Village.</p>
          <div className="hero-actions"><a className="button button-yellow" href="#fixtures">Fixtures & results</a><a className="text-link" href="/news">Club news & media <span>→</span></a></div>
        </div>
        <div className="hero-strip"><div className="shell"><span>ST. MOCHTAS GFC</span><span>•</span><span>Louth Village</span><span>•</span><span>Blue & yellow since 1934</span></div></div>
      </section>

      <section className="fixture-section shell" id="fixtures">
        <div className="section-heading"><div><p className="eyebrow blue">Fixtures & results</p><h2>Keep up with the teams.</h2></div><div className="fixture-source-links" aria-label="Official fixture sources"><a className="text-link blue-link" href="https://louthgaa.ie/fixtures-results/?clubID=2289&clubName=StMochtas">Men’s & boys’ fixtures <span>→</span></a><a className="text-link blue-link" href="https://louthlgfa.ie/">Ladies’ & girls’ fixtures <span>→</span></a></div></div>
        <div className="fixture-grid">
          {fixtures.map((fixture) => <article className="fixture-card" key={fixture.game}><div className="fixture-top"><span>{formatClubDate(fixture.day)}</span><span>{formatClubTime(fixture.time, fixture.timeTbc === 'true')}</span></div><p className="fixture-team">{fixture.team} <small>{fixture.tag}</small></p><h3>{fixture.game}</h3><p className="venue">{fixture.venue}</p><a href="https://louthgaa.ie/fixtures-results/?clubID=2289&clubName=StMochtas">Match details <span>→</span></a></article>)}
        </div>
        <p className="fixture-note">The cards above are a club summary and are updated manually. For the latest information, use the official calendars. On Louth LGFA, choose “Show Fixtures For My Club” and search for “St Mochtas”.</p>
      </section>

      {results.length > 0 && <section className="results-section shell" id="results">
        <div className="section-heading"><div><p className="eyebrow blue">Latest results</p><h2>Recent matches.</h2></div></div>
        <div className="results-grid">{results.map((result, index) => <article key={`${result.date}-${result.home}-${index}`}><header><span>{result.team}</span><small>{result.competition}</small></header><p>{formatClubDate(result.date)}</p><div><strong>{result.home}</strong><b>{result.homeScore}</b></div><div><strong>{result.away}</strong><b>{result.awayScore}</b></div>{result.reportUrl && <a href={result.reportUrl}>Match report <span>→</span></a>}</article>)}</div>
      </section>}

      <section className="updates club-noticeboard shell" id="community">
        <div className="section-heading noticeboard-heading">
          <div>
            <p className="eyebrow blue">From the committee</p>
            <h2>Club noticeboard.</h2>
            <p className="noticeboard-intro">Official notices, important dates and practical updates from St. Mochtas GFC.</p>
          </div>
          <a className="text-link blue-link" href="/news">Club news & media <span>→</span></a>
        </div>
        <div className="noticeboard-grid">
          {clubNotices.map((notice, index) => (
            <article className={`notice-card ${index === 0 ? 'notice-featured' : 'notice-compact'}`} key={notice.title}>
              <div className="notice-card-top"><span>{notice.label}</span><small>{notice.category}</small></div>
              <div className="notice-card-body">
                <h3>{notice.title}</h3>
                <p>{notice.copy}</p>
                <a href={notice.href} aria-label={`${notice.action}: ${notice.title}`}>{notice.action} <b>→</b></a>
              </div>
            </article>
          ))}
        </div>
      </section>


      <section className="county-section shell" aria-label="Louth representatives"><div className="section-heading"><div><p className="eyebrow blue">Louth representatives</p><h2>Proudly wearing<br />the red jersey.</h2></div><p className="county-intro">We are proud of every St. Mochtas player who has represented Louth at senior, ladies and underage level.</p></div><div className="county-grid">{countyRepresentatives.map(([name, level, note, image], index) => <article className="county-card" key={name}><div className="county-photo"><img src={image} alt={name} loading="lazy" decoding="async" /></div><span>0{index + 1}</span><h3>{name}</h3><p>{level}</p><small>{note}</small></article>)}<article className="county-card county-callout"><h3>Our roll of honour</h3><p>Senior · Ladies · Underage</p><small>We are building the full list of players to have represented the county.</small></article></div></section>

      <section className="sponsor-section" id="sponsors"><div className="shell"><div className="sponsor-heading"><div><p className="eyebrow">Our partners</p><h2>Backing the<br /><em>blue & yellow.</em></h2></div><p>Local businesses make a real difference to every team, every event and every young player at St. Mochtas.</p><a className="button button-outline" href="/sponsorship">Become a sponsor <span>→</span></a></div><div className="sponsor-grid">{sponsors.map((sponsor) => <a key={sponsor.name} className={`sponsor-logo ${sponsor.style}-logo`} href={sponsor.href} aria-label={`Visit ${sponsor.name}`}><img src={sponsor.image} alt={sponsor.name} /><small>Visit website ↗</small></a>)}<a className="sponsor-logo sponsor-open" href="/sponsorship">YOUR BUSINESS<br /><small>Become a partner ↗</small></a></div></div></section>

      <SocialFeeds facebookUrl={content.links.facebook} instagramUrl={content.links.instagram} xUrl={content.links.x} />

      <section className="gallery shell" id="gallery" aria-label="Club gallery"><div className="gallery-heading"><p className="eyebrow blue">Louth Village</p><h2>At home in<br />the parish.</h2><p>St. Mochta’s House and the old priory remain a lasting part of the village and the club’s name.</p></div><div className="gallery-grid">{gallery.slice(0, 2).map((item, index) => <figure key={`${item.image}-${index}`} className={index === 0 ? 'gallery-large' : 'gallery-small'}><img src={item.image} alt={item.alt} /><figcaption>{item.caption}</figcaption></figure>)}<aside className="gallery-note"><p>Club photographs, team pictures and match-day memories will live here.</p><a href={content.links.facebook}>Follow the club on Facebook <span>→</span></a></aside></div></section>

      <section className="join"><div className="shell join-inner"><div><p className="eyebrow">Support St. Mochtas</p><h2>Our club.<br /><em>Our community.</em></h2></div><div className="support-actions"><a className="button button-yellow" href={content.links.membership} target="_blank" rel="noreferrer">Support through Clubforce <span>→</span></a></div></div></section>
    </main>
  );
}
