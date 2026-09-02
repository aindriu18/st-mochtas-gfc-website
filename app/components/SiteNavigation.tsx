type SiteNavigationProps = {
  variant?: 'hero' | 'sub';
  current?: 'home' | 'news' | 'ladies' | 'history' | 'honours' | 'archive' | 'membership' | 'shop' | 'sponsorship' | 'governance' | 'contact';
};

const links = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'news', href: '/news', label: 'News' },
  { key: 'fixtures', href: '/#fixtures', label: 'Fixtures & Results' },
  { key: 'history', href: '/history', label: 'History' },
  { key: 'honours', href: '/honours', label: 'Honours' },
  { key: 'archive', href: '/archive', label: 'Archive' },
  { key: 'membership', href: '/membership', label: 'Membership' },
  { key: 'shop', href: '/shop', label: 'Shop' },
  { key: 'sponsorship', href: '/sponsorship', label: 'Sponsors' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

export default function SiteNavigation({ variant = 'hero', current = 'home' }: SiteNavigationProps) {
  const isHero = variant === 'hero';
  const visibleLinks = isHero ? links.filter((link) => link.key !== 'home') : links;

  return (
    <header className={`${isHero ? 'nav' : 'subnav'} site-header shell`}>
      <a className={`brand${isHero ? '' : ' sub-brand'}`} href="/" aria-label="St Mochtas GFC home">
        <img src="https://playr-fit.com/cdn/shop/collections/St-Mochtas-Crest.png?v=1728297738" alt="St Mochtas GFC crest" />
        <span>ST. MOCHTAS <b>GFC</b></span>
      </a>

      <nav className="nav-links desktop-nav" aria-label="Main navigation">
        {visibleLinks.map((link) => (
          <a key={link.key} href={link.href} aria-current={link.key === current ? 'page' : undefined}>
            {link.label}
          </a>
        ))}
      </nav>

      <details className="mobile-menu">
        <summary aria-label="Open site navigation">
          <span className="menu-label">Menu</span>
          <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
        </summary>
        <nav className="mobile-menu-panel" aria-label="Mobile navigation">
          {links.map((link) => (
            <a key={link.key} href={link.href} aria-current={link.key === current ? 'page' : undefined}>
              <span>{link.label}</span><b aria-hidden="true">→</b>
            </a>
          ))}
        </nav>
      </details>
    </header>
  );
}
