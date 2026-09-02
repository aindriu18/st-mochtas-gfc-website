import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import { getSiteContent } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Club History | St. Mochtas GFC',
  description: 'The history of St. Mochtas GFC, from Gaelic games in Louth Village and the club’s foundation in 1934 to the development of Páirc Mochta.',
  alternates: { canonical: '/history' },
};

const chapters = [
  { period: '1886 to 1934', title: 'Gaelic games in Louth Village', text: 'The history of Gaelic games in the village predates St. Mochtas. A 2009 anniversary account records GAA activity in Louth Village from 1886 and the first known match by a team representing the village in February 1887. That game was played against Knockbridge at Stonetrough. Contemporary club and newspaper records date the formation of St. Mochtas GFC to 1934.', note: 'Stonetrough is the earliest playing place named in the surviving newspaper record.' },
  { period: '1934 to 1944', title: 'The first honours', text: 'Success came quickly to the new club. St. Mochtas won the Junior 2A competition in 1935, the Junior A League in 1936 and the Louth Junior Football Championship in 1944. Those early teams established the club in county competition during its first decade.', note: 'The 1944 Junior Championship was the first of five won by the men.' },
  { period: '1950s and 1960s', title: 'A permanent home at Artoney', text: 'The club added another Junior 2A success in 1956 before a major step forward off the field. Páirc Mochta at Artoney gave St. Mochtas a home of its own. It was officially opened on 16 June 1961 with a match between Louth and Offaly. St. Mochtas then won the Junior 2A League in 1969.', note: 'Fifty years after the opening, the club marked the occasion with Mass, juvenile games and Louth playing Cavan.' },
  { period: '1970s', title: 'Football and club life', text: 'The decade began with Junior 2A success in 1970, followed by the Junior A League in 1973 and the Junior Football Championship in 1975. Club life extended well beyond match days. Business was conducted in the old hall in Louth Village, while the annual dinner dance at the Fairways Hotel was described in 1972 as the main social occasion of the club year.', note: 'Denis McArdle recalled being asked to join the committee in 1968 when he was only thirteen or fourteen.' },
  { period: '1980s', title: 'A first Intermediate Championship', text: 'St. Mochtas won the Louth Intermediate Football Championship in 1981, a major landmark in the club’s progress. The Dealgan Milk Products Shield followed in 1984 as the club continued to compete and develop at adult level.', note: 'The 1981 title was the club’s first Intermediate Championship.' },
  { period: '1990s', title: 'St. Vincent’s and a strong decade', text: 'For a period, the Louth Village underage section was known as St. Vincent’s. County records list St. Joseph’s/St. Vincent’s as the 1994 Louth minor champions, and early 2000s fixtures still used the combined name. At adult level, St. Mochtas won the Kevin Mullen Shield in 1990 and 1991 before lifting the Junior Football Championship again in 1995.', note: 'The St. Vincent’s name remains an important part of the memories of players who came through the club’s underage teams.' },
  { period: '2002 to 2006', title: 'Ladies football and new clubrooms', text: 'The ladies section began in 2002, bringing a new group of players, mentors and families into St. Mochtas. The men won the Junior Football Championship and Kevin Mullen Shield in 2004. At the same time, major work was taking place at Artoney. By 2003 the club reported that about €300,000 had been spent on the ground, and the new dressing rooms and clubrooms were officially opened on 18 May 2005 when Louth played Monaghan.', note: 'Páirc Mochta also hosted the Leinster Junior Hurling final in 2006.' },
  { period: '2007 to 2012', title: 'Success across the club', text: 'In 2007 both adult men’s teams won their leagues in the same year for the first time. The Junior Football Championship returned to Páirc Mochta in 2009, the same year the juvenile field was blessed during the club anniversary weekend. In 2010 the ladies won their first Intermediate Championship, and in 2012 they marked ten years with a family weekend and a senior nine-a-side title.', note: 'This period joined success on the field with a stronger underage and ladies structure.' },
  { period: '2013 to 2019', title: 'Building towards senior football', text: 'Underage teams and club amalgamations continued to provide a pathway into the adult game. The men won the Intermediate Football Championship for a second time in 2018 and moved into the senior grade. Development at Páirc Mochta continued too, with the new stand and gym blessed during a club celebration weekend in 2019.', note: 'The facilities grew in stages through the work of committees, members, families and local supporters.' },
  { period: '2020 to 2025', title: 'A new senior chapter', text: 'St. Mochtas reached the Louth Senior Football Championship final for the first time in 2021. The men won the Cardinal O’Donnell Cup in 2023 and regained the Division 1 title in 2025. In 2024 the village welcomed home Craig Lennon after his PwC Football All-Star selection and Eimear Byrne after her selection on the TG4 Junior Team of the Championship. The ladies won the Intermediate Championship and Division 2 League in 2025, earning a return to senior football for 2026.', note: 'Full competition records are kept on the separate Roll of Honour page.' },
  { period: '2024 onwards', title: 'The all-weather pitch project', text: 'St. Mochtas joined Phase 6 of the GAA Healthy Club programme in 2024 and received a €200,000 sports capital allocation towards an enclosed all-weather pitch. A 2025 planning application proposed a 65m by 28m pitch, floodlights and changes to the walking track.', note: 'The proposed work is the latest phase in the development of Páirc Mochta.' },
];

const snapshots = [
  ['The old hall', 'Before today’s facilities, club AGMs and committee work took place in the old hall in Louth Village.'],
  ['The St. Vincent’s name', 'A generation of young players from Louth Village knew their underage team as St. Vincent’s, including teams joined with St. Joseph’s.'],
  ['A county venue', 'Páirc Mochta has staged county finals, inter-county challenge matches and a Leinster club hurling final.'],
  ['The school bus rivalry', 'Local rivalries with St. Bride’s and Glyde followed the routes young people travelled to school in Dundalk and Ardee.'],
  ['Dinner-dance nights', 'The annual dinner dance brought players, members and families together and was a highlight of the club calendar.'],
  ['The wider parish', 'Fun runs, family days and Friends of Liam events show how often the grounds have served community causes as well as football.'],
];

const sources = [
  ['St. Mochtas 75th anniversary', 'https://www.independent.ie/news/st-mochtas-mark-75th-anniversary/26936050.html'],
  ['Páirc Mochta at 50', 'https://www.independent.ie/regionals/louth/dundalk-news/localnotes/louth/26953616.html'],
  ['Denis McArdle’s club memories', 'https://www.dundalkdemocrat.ie/news/sport/533661/gaels-tales-denis-mcardle-selects-his-st-mochta-s-and-louth-all-time-xvs.html'],
  ['Louth club title records', 'https://www.hoganstand.com/Louth/ClubTitles'],
  ['St. Joseph’s/St. Vincent’s underage fixtures', 'https://www.independent.ie/regionals/louth/sport/othersports/minor-board-fixtures/26909235.html'],
  ['Ground development and clubhouse', 'https://www.independent.ie/regionals/louth/drogheda-news/county-board-in-brief/27111538.html'],
  ['The 2007 turning point', 'https://www.hoganstand.com/county/louth/article/index/91109'],
  ['Ladies’ tenth anniversary', 'https://www.independent.ie/regionals/louth/dundalk-news/localnotes/louth/26964898.html'],
  ['Ladies’ 2010 Intermediate title', 'https://www.independent.ie/regionals/louth/dundalk-news/localnotes/players-head-to-darver-castle-for-presentation-night/26951371.html'],
  ['The 2018 Intermediate final', 'https://hoganstand.com/Louth/Article/Index/291407'],
  ['Stand and gym blessing', 'https://www.dundalkdemocrat.ie/news/gaa/436110/all-ireland-winner-and-former-louth-manager-to-be-among-the-guests-as-st-mochtas-weekend-of-celebration.html'],
  ['First Senior Championship final', 'https://www.dundalkdemocrat.ie/news/home/688877/inside-track-history-against-st-mochtas-as-they-look-to-win-first-senior-crown.html'],
  ['Cardinal O’Donnell Cup 2023', 'https://louthgaa.ie/mochtas-claim-the-cardinal-odonnell/'],
  ['National recognition in 2024', 'https://www.independent.ie/regionals/louth/sport/gaa/louth-ladies-midfielders-pride-at-club-reception-for-tg4-junior-team-of-the-year-award/a1233463176.html'],
  ['Cardinal O’Donnell Cup 2025', 'https://www.dundalkdemocrat.ie/news/louth-sport/1867313/louth-gaa-club-clinical-mochtas-crowned-cardinal-o-donnell-cup-champions.html'],
  ['Ladies’ 2025 Intermediate title', 'https://www.independent.ie/regionals/louth/sport/gaa/louth-lgfa-ifc-late-aoife-byrne-point-enough-as-st-mochtas-hold-on-to-edge-out-glen-emmets/a654186422.html'],
  ['Healthy Club programme 2024', 'https://louthgaa.ie/wp-content/uploads/2024/12/Part-2.pdf'],
  ['All-weather pitch grant', 'https://pridesports.ie/wp-content/uploads/2024/10/Sports-Capital-Grants-Recipients-2024.pdf'],
  ['All-weather pitch planning', 'https://www.louthcoco.ie/en/services/planning/planning-lists/louth-2025/july/applications-received-18-07-2025.pdf'],
];

export default async function HistoryPage() {
  const { history: editableChapters } = await getSiteContent();
  return (
    <main className="archive-page history-page">
      <SiteNavigation variant="sub" current="history" />
      <section className="page-hero history-hero"><div className="shell"><p className="eyebrow">Club history</p><h1>History of<br /><em>St. Mochtas GFC.</em></h1><p>From the first recorded Louth Village team at Stonetrough to the development of Páirc Mochta at Artoney.</p></div></section>
      <section className="history-opening shell"><div><p className="eyebrow blue">Louth Village</p><h2>The club and the parish.</h2></div><p>St. Mochtas has grown through local voluntary work, new teams and steady improvements to the grounds. This page records the places, people and events that have shaped the club.</p></section>
      <section className="history-name-section"><div className="shell history-name-grid"><div><p className="eyebrow">Our namesake</p><h2>Saint Mochta<br />of Louth.</h2></div><div className="history-name-copy"><p>Saint Mochta was a disciple of Saint Patrick who, according to local tradition, founded an early Christian monastery at Louth around the sixth century. The village grew around that foundation, and both the club and its ground carry his name.</p><p>St. Mochta’s House, beside the ruins of St. Mary’s Priory, is medieval rather than sixth-century, but it remains a distinctive reminder of the saint and of the place from which the club draws its identity.</p><a href="https://www.visitlouth.ie/things-to-do/st.-mochta%27s-house-%26-st.-mary%27s-abbey" target="_blank" rel="noreferrer">Discover St. Mochta’s House <span>→</span></a></div></div></section>
      <section className="history-story shell"><div className="history-story-heading"><p className="eyebrow blue">Club timeline</p><h2>From 1886<br />to today.</h2><a href="/honours">View the Roll of Honour <span>→</span></a></div><div className="history-chapters">{editableChapters.map((chapter, index) => <article key={`${chapter.period}-${index}`}><div className="history-chapter-marker"><span>{String(index + 1).padStart(2, '0')}</span><strong>{chapter.period}</strong></div><div><h3>{chapter.title}</h3><p>{chapter.text}</p>{chapter.note && <small>{chapter.note}</small>}</div></article>)}</div></section>
      <section className="history-snapshots"><div className="shell"><div className="history-snapshots-heading"><p className="eyebrow">From the archives</p><h2>Club life<br /><em>through the years.</em></h2></div><div className="history-snapshot-grid">{snapshots.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="history-archive history-archive-sources shell"><aside className="history-sources"><p className="eyebrow blue">Sources and further reading</p>{sources.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer"><span>{label}</span><b>↗</b></a>)}</aside></section>
    </main>
  );
}
