import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import { getSiteContent } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Contact | St. Mochtas GFC',
  description: 'Contact St. Mochtas GFC, meet the club executive and find Páirc Mochta in Artoney, Louth Village.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const { officers, contact } = await getSiteContent();
  return (
    <main className="archive-page contact-page">
      <SiteNavigation variant="sub" current="contact" />

      <section className="page-hero contact-hero">
        <div className="shell">
          <p className="eyebrow">Contact the club</p>
          <h1>Find us in<br /><em>Louth Village.</em></h1>
          <p>Club contacts, executive officers and directions to Páirc Mochta.</p>
        </div>
      </section>

      <section className="contact-intro shell">
        <div className="contact-details">
          <p className="eyebrow blue">Páirc Mochta</p>
          <h2>Our home ground.</h2>
          <address>
            {contact.address.split('\n').map((line) => <span key={line}>{line}<br /></span>)}
            <strong>{contact.eircode}</strong>
          </address>
          <div className="contact-actions">
            <a className="button button-yellow" href={contact.directionsUrl} target="_blank" rel="noreferrer">Get directions <span>↗</span></a>
            <a className="contact-email" href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        </div>

        <div className="contact-map">
          <iframe
            src={contact.mapUrl}
            title="Google map showing Páirc Mochta in Artoney, Louth"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="committee-section">
        <div className="shell">
          <div className="committee-heading">
            <div>
              <p className="eyebrow">Club committee</p>
              <h2>Executive officers.</h2>
            </div>
            <p>The committee carries out the day-to-day work of the club. Please contact the relevant officer where possible, or email the club secretary for general enquiries.</p>
          </div>

          <div className="committee-grid">
            {officers.map((officer, index) => (
              <article key={officer.role}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p>{officer.role}</p>
                  <h3>{officer.name}</h3>
                  {officer.email ? <a href={`mailto:${officer.email}`}>{officer.email}</a> : <small>Please contact the club secretary</small>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="shell">
          <div>
            <p className="eyebrow blue">General enquiries</p>
            <h2>Get in touch.</h2>
          </div>
          <a className="button" href={`mailto:${contact.email}`}>Email the club <span>→</span></a>
        </div>
      </section>
    </main>
  );
}
