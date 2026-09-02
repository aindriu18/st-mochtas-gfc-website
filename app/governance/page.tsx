import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';

export const metadata: Metadata = {
  title: 'Governance & Safeguarding | St. Mochtas GFC',
  description: 'Safeguarding, privacy, photography and website governance information for St. Mochtas GFC.',
  alternates: { canonical: '/governance' },
};

const photographyRules = [
  'Photography preferences must be checked before images of an underage player are published.',
  'Children should understand how an image may be used, with a parent or guardian involved where required.',
  'Full names should not normally be paired with photographs of children.',
  'No changing-room images, medical information, home addresses or dates of birth should be published.',
  'A photograph will be reviewed promptly if a player or parent asks the club to remove it.',
  'Automated galleries must use a club approval queue. Underage images must never publish automatically.',
];

const dataUses = [
  ['Contact and sponsorship enquiries', 'To respond to a request sent to a club officer. The website currently opens the visitor’s own email application and does not retain the message.'],
  ['Club news and photographs', 'To report club activity and maintain a record of club life, subject to the club’s publication and photography procedures.'],
  ['External media', 'To display club social posts and the location map through Facebook, Instagram, X and Google Maps.'],
  ['Website security and delivery', 'To operate, protect and troubleshoot the website through the club’s hosting provider.'],
];

const thirdParties = [
  ['Clubforce', 'Membership and club events'],
  ['Foireann', 'Official Gaelic Games registration and member preferences'],
  ['O’Neills', 'Official club shop'],
  ['Meta and X', 'Optional social-media content'],
  ['Google Maps', 'Optional map content'],
  ['OpenAI Sites', 'Website hosting and delivery'],
];

export default function GovernancePage() {
  return (
    <main className="archive-page governance-page">
      <SiteNavigation variant="sub" current="governance" />

      <section className="page-hero governance-hero"><div className="shell"><p className="eyebrow">Club governance</p><h1>Safeguarding,<br /><em>privacy & trust.</em></h1><p>How St. Mochtas protects children, personal information and the integrity of its official website.</p></div></section>

      <section className="governance-intro shell"><div><p className="eyebrow blue">Our approach</p><h2>Clear responsibilities.<br />Practical safeguards.</h2></div><p>This section brings the website’s safeguarding and data-protection information together in one place. It will be updated when the club executive approves new policies or named officers change.</p></section>

      <nav className="governance-jump shell" aria-label="Governance sections">
        <a href="#safeguarding"><span>01</span><strong>Child safeguarding</strong></a>
        <a href="#privacy"><span>02</span><strong>Privacy information</strong></a>
        <a href="#photography"><span>03</span><strong>Photography</strong></a>
        <a href="#cookies"><span>04</span><strong>Cookies & external media</strong></a>
        <a href="#website"><span>05</span><strong>Website governance</strong></a>
      </nav>

      <section className="governance-safeguarding" id="safeguarding"><div className="shell governance-two-column"><div><p className="eyebrow">Child safeguarding</p><h2>Children come first.</h2><p>St. Mochtas follows the joint Gaelic Games Code of Behaviour and safeguarding procedures. Concerns about possible abuse are handled through the approved safeguarding route, not through ordinary club publicity or sponsorship channels.</p><div className="governance-actions"><a className="button button-yellow" href="https://www.gaa.ie/the-gaa/child-safeguarding-and-protection/children-first" target="_blank" rel="noreferrer">GAA safeguarding guidance <span>↗</span></a><a href="https://www.tusla.ie/children-first/" target="_blank" rel="noreferrer">Tusla Children First <span>↗</span></a></div></div><aside className="safeguarding-status"><p className="eyebrow blue">Club contacts & documents</p><dl><div><dt>Club Children’s Officer</dt><dd>Club Children’s Officer</dd></div><div><dt>Designated Liaison Person</dt><dd>To be confirmed by the club</dd></div><div><dt>Safeguarding Statement</dt><dd>Approved copy to be added</dd></div><div><dt>Last formal review</dt><dd>To be confirmed by the club</dd></div></dl><p>The signed statement and DLP contact route will be published here after club approval.</p></aside></div></section>

      <section className="governance-content shell" id="privacy"><header><p className="eyebrow blue">Website privacy information</p><h2>What information is used and why.</h2><p>Last reviewed 24 August 2026. This information covers the public website. Membership information held through Foireann or Clubforce is also governed by the relevant club and service policies.</p></header><div className="privacy-grid">{dataUses.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="privacy-detail-grid"><article><h3>Who is responsible</h3><p>St. Mochtas GFC is responsible for deciding how personal information is used through this website. General privacy requests can be sent to <a href="mailto:club-contact@example.com">club-contact@example.com</a>.</p></article><article><h3>Your rights</h3><p>You may ask for access, correction, restriction or deletion of personal information, where applicable. You may also object to particular uses or withdraw consent. Complaints may be made to the <a href="https://www.dataprotection.ie/" target="_blank" rel="noreferrer">Data Protection Commission</a>.</p></article><article><h3>How long information is kept</h3><p>Information should be kept only for as long as its purpose requires. The club will adopt a formal retention schedule covering enquiries, consent records, photographs and website administration.</p></article><article><h3>External services</h3><ul>{thirdParties.map(([name, purpose]) => <li key={name}><strong>{name}</strong><span>{purpose}</span></li>)}</ul></article></div></section>

      <section className="photography-policy" id="photography"><div className="shell"><div className="photography-heading"><p className="eyebrow">Photography & social media</p><h2>Publishing club life responsibly.</h2><p>Photographs are an important record of St. Mochtas, but publication must respect players, families and the club’s safeguarding duties.</p></div><ol>{photographyRules.map((rule, index) => <li key={rule}><span>{String(index + 1).padStart(2, '0')}</span><p>{rule}</p></li>)}</ol></div></section>

      <section className="cookie-policy shell" id="cookies"><div><p className="eyebrow blue">Cookies & external media</p><h2>Third-party content.</h2><p>The website includes social feeds from Facebook, Instagram and X, together with an embedded Google Map. When these features load, the provider may receive device information or use cookies under its own privacy terms.</p><a className="button button-blue" href="https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies" target="_blank" rel="noreferrer">DPC cookie guidance <span>↗</span></a></div><aside><h3>Club website</h3><p>The site does not currently enable optional audience analytics or advertising trackers of its own.</p><h3>Embedded services</h3><p>Meta, X and Google content loads as part of the relevant page. These services are not necessary to read the club’s own text content, and direct account or directions links are also provided.</p><h3>Before formal launch</h3><p>The club should approve either a consent-management service that controls these embeds or a locally rendered alternative that does not contact the platforms from the visitor’s browser.</p></aside></section>

      <section className="website-governance" id="website"><div className="shell governance-two-column"><div><p className="eyebrow">Website governance</p><h2>Club-owned and accountable.</h2><p>The club should own its domain, hosting and administrator accounts. Day-to-day content can be managed by authorised club administrators, while safeguarding and data-protection decisions remain with the club executive and appointed officers.</p></div><div className="governance-checklist"><p><span>01</span>Individual administrator accounts with two-factor authentication</p><p><span>02</span>Access removed promptly when a role changes</p><p><span>03</span>Underage content checked before publication</p><p><span>04</span>Annual review of policies, access and third-party services</p><p><span>05</span>A recorded process for removals, rights requests and data incidents</p></div></div></section>

      <section className="governance-pending shell"><div><p className="eyebrow blue">Documents to complete</p><h2>Awaiting club approval.</h2></div><div><article><span>Pending</span><h3>Signed Child Safeguarding Statement</h3><p>Generated through the club’s Foireann safeguarding process.</p></article><article><span>Pending</span><h3>Designated Liaison Person</h3><p>Name and appropriate club-controlled contact route.</p></article><article><span>Pending</span><h3>Formal retention schedule</h3><p>Approved periods for enquiries, photographs, consent and administration records.</p></article></div></section>
    </main>
  );
}
