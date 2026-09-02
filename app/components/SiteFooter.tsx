import { getSiteContent } from '../../db/site-content';

export default async function SiteFooter() {
  const { links, contact } = await getSiteContent();
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <a className="footer-brand" href="/" aria-label="St. Mochtas GFC home">
          <img src="https://playr-fit.com/cdn/shop/collections/St-Mochtas-Crest.png?v=1728297738" alt="St. Mochtas GFC crest" />
          <span>ST. MOCHTAS<br /><b>GFC</b></span>
          <p>{contact.address.replace(/\n/g, ', ')} · {contact.eircode}</p>
        </a>

        <nav className="footer-links" aria-label="Club and county links">
          <div className="footer-link-group">
            <span className="footer-kicker">County football</span>
            <div className="county-links">
              <a className="county-link county-gaa" href={links.louthGaa} target="_blank" rel="noreferrer">
                <span className="county-mark"><img src="https://louthgaa.ie/wp-content/uploads/2021/05/louth-white-crest.png" alt="" /></span>
                <span><small>County board</small><strong>Louth GAA</strong></span>
                <b aria-hidden="true">→</b>
              </a>
              <a className="county-link county-lgfa" href={links.louthLgfa} target="_blank" rel="noreferrer">
                <span className="county-mark"><img src="https://ladiesgaelic.ie/wp-content/themes/lgfa/assets/images/crests/crest-box-7.png" alt="" /></span>
                <span><small>Fixtures & results</small><strong>Louth LGFA</strong></span>
                <b aria-hidden="true">→</b>
              </a>
            </div>
          </div>

          <div className="footer-link-group">
            <span className="footer-kicker">Follow St. Mochtas</span>
            <div className="social-links">
              <a className="social-link" href={links.facebook} target="_blank" rel="noreferrer" aria-label="St. Mochtas GFC on Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.1H7.8V13h2.7v8h3.7Z" /></svg>
              </a>
              <a className="social-link" href={links.instagram} target="_blank" rel="noreferrer" aria-label="St. Mochtas GFC on Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" className="social-dot" /></svg>
              </a>
              <a className="social-link" href={links.x} target="_blank" rel="noreferrer" aria-label="St. Mochtas GFC on X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l6.2 8.3L4.5 20h2.4l4.4-5.9 4.4 5.9H20l-6.5-8.7L18.8 4h-2.4l-4 5.4L8.4 4H4Zm4 1.8h.8l7.1 9.5h-.8L8 5.8Z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-link-group footer-governance">
            <span className="footer-kicker">Club policies</span>
            <div className="footer-policy-links">
              <a href="/governance">Safeguarding & club policies</a>
              <a href="/governance#privacy">Privacy</a>
              <a href="/governance#cookies">Cookie information</a>
              <a href="/admin">Club administration</a>
            </div>
          </div>
        </nav>

        <p className="footer-copyright">© St. Mochtas GFC</p>
      </div>
    </footer>
  );
}
