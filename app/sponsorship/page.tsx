import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import SponsorshipEnquiryForm from '../components/SponsorshipEnquiryForm';
import { getSiteContent, visibleItems } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Sponsorship | St. Mochtas GFC',
  description: 'Explore sponsorship opportunities with St. Mochtas GFC and contact the club sponsorship team.',
  alternates: { canonical: '/sponsorship' },
};

const opportunityGroups = [
  {
    number: '01',
    title: 'Ground & visibility',
    description: 'Put your business in front of players, members and visitors at Páirc Mochta.',
    opportunities: ['Ground sponsorship', 'Pitch-side hoardings', 'Scoreboard sponsor'],
  },
  {
    number: '02',
    title: 'Teams & kit',
    description: 'Support the people representing St. Mochtas throughout the season.',
    opportunities: ['Adult team sponsor', 'Youth team sponsor — multiple teams', 'Teamwear provider', 'Kit bag sponsor'],
  },
  {
    number: '03',
    title: 'Matchday & awards',
    description: 'Be part of the occasions and achievements that matter to the club.',
    opportunities: ['Player of the match award', 'Player of the season awards', 'Match ball sponsor'],
  },
  {
    number: '04',
    title: 'Digital & club events',
    description: 'Reach our wider community online and through major club activities.',
    opportunities: ['Website main sponsor', 'Website match centre sponsor', 'Summer Camp'],
  },
];

export default async function SponsorshipPage() {
  const { sponsors: storedSponsors, contact } = await getSiteContent();
  const sponsors = visibleItems(storedSponsors).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  return (
    <main className="archive-page sponsorship-page">
      <SiteNavigation variant="sub" current="sponsorship" />

      <section className="page-hero sponsorship-hero">
        <div className="shell">
          <p className="eyebrow">Support St. Mochtas</p>
          <h1>Back the<br /><em>blue &amp; yellow.</em></h1>
          <p>Put your business alongside a club at the heart of Louth Village and help our teams thrive at every level.</p>
        </div>
      </section>

      <section className="featured-partners">
        <div className="shell">
          <div className="featured-partners-heading">
            <div>
              <p className="eyebrow blue">Main club partners</p>
              <h2>Proudly supported by.</h2>
            </div>
            <p>Please support the businesses that support St. Mochtas.</p>
          </div>

          <div className="featured-partners-grid">{sponsors.map((sponsor) => <a key={sponsor.name} className={`featured-partner featured-${sponsor.style || 'cti'}`} href={sponsor.href} target="_blank" rel="noreferrer"><span>{sponsor.tier || 'Club partner'}</span><img src={sponsor.image} alt={sponsor.name} /><small>Visit {sponsor.name} <b>↗</b></small></a>)}</div>
        </div>
      </section>

      <section className="sponsorship-intro shell">
        <div>
          <p className="eyebrow blue">Partner with the club</p>
          <h2>A place for every kind of support.</h2>
        </div>
        <p>Our sponsors make a real difference to St. Mochtas. Their support helps us provide football, facilities and opportunities for our adult and underage teams. We are grateful too to local businesses that give their time, expertise or services throughout the season.</p>
      </section>

      <section className="opportunities-section">
        <div className="shell">
          <div className="opportunities-heading">
            <div>
              <p className="eyebrow">Sponsorship opportunities</p>
              <h2>Find the right fit.</h2>
            </div>
            <p>From a visible presence at Páirc Mochta to backing one of our teams or club awards, there are a number of ways to get involved.</p>
          </div>

          <div className="opportunity-groups">
            {opportunityGroups.map((group) => (
              <article key={group.title}>
                <header>
                  <span>{group.number}</span>
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </header>
                <ul>
                  {group.opportunities.map((opportunity) => <li key={opportunity}>{opportunity}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sponsorship-enquiry" id="enquiry">
        <div className="shell sponsorship-enquiry-grid">
          <div className="enquiry-copy">
            <p className="eyebrow blue">Become a sponsor</p>
            <h2>Start the conversation.</h2>
            <p>Tell us which opportunity interests you and the club secretary will be able to continue the discussion with you directly.</p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <SponsorshipEnquiryForm />
        </div>
      </section>
    </main>
  );
}
