import type { Metadata } from 'next';
import Link from '../components/SafeLink';
import SiteNavigation from '../components/SiteNavigation';
import { getSiteContent } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Roll of Honour | St. Mochtas GFC',
  description: 'Recorded men’s, ladies’ and underage honours for St. Mochtas GFC.',
  alternates: { canonical: '/honours' },
};

const sources = [
  ['Louth club title records', 'https://hoganstand.com/Louth/ClubTitles'],
  ['St. Mochtas club report, 2007', 'https://www.hoganstand.com/county/louth/article/index/91109'],
  ['Under-15 All-County League, 2007', 'https://www.hoganstand.com/county/louth/article/index/91078'],
  ['All-Ireland Junior 7s Shield, 2005', 'https://www.independent.ie/news/all-ireland-7s-shield-win-for-st-mochtas/26901692.html'],
  ['All-Ireland Junior 7s Shield, 2010', 'https://www.independent.ie/news/second-half-hat-trick-seals-st-mochtas-win/27149788.html'],
  ['Ladies Intermediate title, 2010', 'https://www.independent.ie/regionals/louth/dundalk-news/localnotes/players-head-to-darver-castle-for-presentation-night/26951371.html'],
  ['Ladies Under-16 B League, 2011', 'https://www.independent.ie/news/st-mochtas-ladies-agm/27162808.html'],
  ['Ladies nine-a-side title, 2012', 'https://www.dundalkdemocrat.ie/news/gaelic-games/49346/Stabannon-face-multiple-threats-.html'],
  ['Intermediate Championship, 2018', 'https://hoganstand.com/Louth/Article/Index/291407'],
  ['Cardinal O’Donnell Cup, 2023', 'https://louthgaa.ie/mochtas-claim-the-cardinal-odonnell/'],
  ['Ladies Division 2 League, 2025', 'https://www.dundalkdemocrat.ie/news/1854149/louth-lgfa-club-division-2-and-division-3-finals-round-up.html'],
  ['Cardinal O’Donnell Cup, 2025', 'https://www.dundalkdemocrat.ie/news/louth-sport/1867313/louth-gaa-club-clinical-mochtas-crowned-cardinal-o-donnell-cup-champions.html'],
  ['Ladies Intermediate title, 2025', 'https://www.independent.ie/regionals/louth/sport/gaa/louth-lgfa-ifc-late-aoife-byrne-point-enough-as-st-mochtas-hold-on-to-edge-out-glen-emmets/a654186422.html'],
];

export default async function HonoursPage() {
  const { honours } = await getSiteContent();
  const sorted = (category: 'men' | 'ladies' | 'underage') => honours.filter((item) => item.category === category).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const editableMens = sorted('men');
  const editableLadies = sorted('ladies');
  const editableUnderage = sorted('underage');
  return (
    <main className="archive-page honours-record-page">
      <SiteNavigation variant="sub" current="honours" />
      <section className="page-hero honours-hero"><div className="shell"><p className="eyebrow">Roll of honour</p><h1>St. Mochtas<br /><em>club honours.</em></h1><p>Recorded honours for the men’s, ladies’ and underage teams, from the club’s early years to the present day.</p></div></section>

      <section className="honours-adult shell">
        <article className="honours-record-card mens-record"><header><p className="eyebrow blue">Men’s football</p><h2>Adult honours</h2></header><div className="honours-record-list">{editableMens.map((honour) => <div key={honour.competition}><div><h3>{honour.competition}</h3>{honour.detail && <p>{honour.detail}</p>}</div><strong>{honour.years}</strong></div>)}</div></article>
        <article className="honours-record-card ladies-record-card" id="ladies-football"><header><p className="eyebrow blue">Ladies football</p><h2>Adult honours</h2></header><div className="honours-record-list">{editableLadies.map((honour) => <div key={honour.competition}><div><h3>{honour.competition}</h3>{honour.detail && <p>{honour.detail}</p>}</div><strong>{honour.years}</strong></div>)}</div></article>
      </section>

      <section className="honours-underage shell">
        <article className="honours-record-card underage-record-card"><header><p className="eyebrow blue">Underage football</p><h2>Underage honours</h2><p>Confirmed titles for St. Mochtas, St. Vincent’s and amalgamated teams.</p></header><div className="honours-record-list">{editableUnderage.map((honour) => <div key={`${honour.years}-${honour.competition}`}><div><h3>{honour.competition}</h3><p>{honour.team}</p>{honour.note && <p className="underage-row-note">{honour.note}</p>}</div><strong>{honour.years}</strong></div>)}</div><p className="honours-card-note">St. Vincent’s was the Louth Village underage identity linked to St. Mochtas. St. Bride’s combinations are identified separately, using the team names found in the contemporary record.</p></article>
      </section>

      <section className="honours-sources shell"><div><p className="eyebrow blue">Archive record</p><h2>Sources and<br />further reading.</h2><p>If you have an old team photograph, programme or result that fills a gap in this record, the club archive can add it after checking the competition and year.</p><Link className="button button-blue" href="/contact">Contact the club</Link></div><aside>{sources.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer"><span>{label}</span><b>↗</b></a>)}</aside></section>
    </main>
  );
}
