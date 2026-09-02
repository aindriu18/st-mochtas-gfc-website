import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import { listArchiveItems } from '../../db/archive';

export const metadata: Metadata = {
  title: 'Club Archive | St. Mochtas GFC',
  description: 'The developing St. Mochtas GFC archive of team photographs, programmes, newspaper cuttings and club memories.',
  alternates: { canonical: '/archive' },
};

export const dynamic = 'force-dynamic';

const categoryLabels: Record<string, string> = {
  teams: 'Teams & players',
  matches: 'Match days',
  'club-life': 'Club life',
  documents: 'Programmes & documents',
};

export default async function ArchivePage() {
  const items = await listArchiveItems('published');
  return <main className="archive-page">
    <SiteNavigation variant="sub" current="archive" />
    <section className="page-hero archive-hero"><div className="shell"><p className="eyebrow">Club archive</p><h1>Keep the memories<br /><em>in the club.</em></h1><p>Photographs, teamsheets, programmes and the people behind St. Mochtas.</p></div></section>
    <section className="page-content shell">
      <div className="page-intro"><p className="eyebrow blue">The collection</p><h2>Every photograph has a story.</h2><p>Old team photographs, match-day programmes, newspaper cuttings and the memories of players, supporters and volunteers.</p></div>
      {items.length > 0 ? <div className="public-archive-grid">{items.map((item) => <article key={item.id}>
        {item.content_type.startsWith('image/') ? <img src={`/api/archive/files/${item.id}`} alt={item.alt_text ?? ''} loading="lazy" /> : <a className="archive-document" href={`/api/archive/files/${item.id}`} target="_blank" rel="noreferrer"><span>PDF</span><b>Open document ↗</b></a>}
        <div><small>{categoryLabels[item.category]}{item.year ? ` · ${item.year}` : ''}</small><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>
      </article>)}</div> : <div className="archive-grid"><article><span>01</span><h3>Teams & players</h3><p>Senior, ladies and underage team photographs across the years.</p></article><article><span>02</span><h3>Match days</h3><p>Programmes, cup finals, league campaigns and championship memories.</p></article><article><span>03</span><h3>Club life</h3><p>Fundraisers, volunteers, grounds development and community occasions.</p></article></div>}
      <aside className="contribute-card"><p className="eyebrow blue">Contribute to the archive</p><h3>We need the club’s old albums.</h3><p>If you have scanned photographs or documents, please share only material you own or have permission to use, especially where children are pictured.</p><a href="mailto:secretary.stmochtas.louth@gaa.ie?subject=St.%20Mochtas%20club%20archive">Send an archive item →</a></aside>
    </section>
  </main>;
}
