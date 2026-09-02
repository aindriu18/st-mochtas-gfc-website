import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import { getSiteContent } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Club Membership | St. Mochtas GFC',
  description: 'Join or renew your St. Mochtas GFC membership securely through the club’s official Clubforce page.',
  alternates: { canonical: '/membership' },
};

const steps = [
  ['01', 'Open Clubforce', 'Use the club’s official Clubforce page to begin your registration.'],
  ['02', 'Choose your membership', 'Select the available membership plan that applies to you or your family.'],
  ['03', 'Register & pay securely', 'Complete the member details and payment directly through Clubforce.'],
];

export default async function MembershipPage() {
  const { links, contact } = await getSiteContent();
  const clubforceUrl = links.membership;
  return (
    <main className="archive-page membership-page">
      <SiteNavigation variant="sub" current="membership" />

      <section className="page-hero membership-hero">
        <div className="shell">
          <p className="eyebrow">Club membership</p>
          <h1>Join<br /><em>the Mochs.</em></h1>
          <p>Player, family and supporter membership is managed securely through the club’s official Clubforce account.</p>
        </div>
      </section>

      <section className="membership-intro shell">
        <div className="membership-copy">
          <p className="eyebrow blue">St. Mochtas GFC membership</p>
          <h2>Be part of the club.</h2>
          <p>Membership supports the teams, facilities and day-to-day running of St. Mochtas GFC. Clubforce handles registrations and payments, so member and payment details remain within the club’s established system.</p>
          <p className="membership-note">Available plans, current prices and payment options are shown on Clubforce when registration is open.</p>
        </div>

        <aside className="clubforce-card">
          <span className="clubforce-kicker">Official registration partner</span>
          <strong>clubforce</strong>
          <p>Continue to Clubforce to view the membership options currently available for St. Mochtas GFC.</p>
          <a className="button button-yellow" href={clubforceUrl} target="_blank" rel="noreferrer">Join or renew <span>↗</span></a>
          <small>You will leave this website and complete registration securely on Clubforce.</small>
        </aside>
      </section>

      <section className="membership-steps">
        <div className="shell">
          <div className="membership-steps-heading">
            <div><p className="eyebrow">How it works</p><h2>Three simple steps.</h2></div>
            <p>The club website explains where to go; Clubforce remains the official record for plans, registrations and payments.</p>
          </div>
          <div className="membership-step-grid">
            {steps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-help">
        <div className="shell">
          <div><p className="eyebrow blue">Need some help?</p><h2>Membership enquiries.</h2></div>
          <p>If you are unsure which option applies or have a registration query, contact the club secretary.</p>
          <a className="button" href={`mailto:${contact.email}?subject=St.%20Mochtas%20membership%20enquiry`}>Email the secretary <span>→</span></a>
        </div>
      </section>
    </main>
  );
}
