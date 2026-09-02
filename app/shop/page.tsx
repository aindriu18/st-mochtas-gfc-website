import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import { getSiteContent, visibleItems } from '../../db/site-content';

export const metadata: Metadata = {
  title: 'Club Shop | St. Mochtas GFC',
  description: 'Find approved St. Mochtas GFC club shops for jerseys, training wear and club clothing.',
  alternates: { canonical: '/shop' },
};

const products = [
  {
    name: 'St. Mochtas GFC jersey',
    fit: 'Adult',
    price: 'From €63',
    image: 'https://www.oneills.com/media/catalog/product/cache/2a6b0744b87cbe1990f7a65c1fd3659e/s/t/st_mochtas_gfc_louth146629-1.jpg',
    href: 'https://www.oneills.com/st-mochtas-gfc-louth-club-gaa-3s-jersey-v8-amber.html',
  },
  {
    name: "St. Mochtas GFC women's fit jersey",
    fit: "Women's fit",
    price: 'From €63',
    image: 'https://www.oneills.com/media/catalog/product/cache/2a6b0744b87cbe1990f7a65c1fd3659e/s/t/st_mochtas_gfc_louth146629-3.jpg',
    href: 'https://www.oneills.com/st-mochtas-gfc-louth-club-gaa-3s-jersey-womens-v8-amber.html',
  },
  {
    name: "St. Mochtas GFC kids' jersey",
    fit: 'Juvenile',
    price: 'From €28',
    image: 'https://www.oneills.com/media/catalog/product/cache/2a6b0744b87cbe1990f7a65c1fd3659e/s/t/st_mochtas_gfc_louth146629-1_1.jpg',
    href: 'https://www.oneills.com/st-mochtas-gfc-louth-gaa-3s-kids-jersey-v8-amber.html',
  },
];

export default async function ShopPage() {
  const { shops } = await getSiteContent();
  const providers = visibleItems(shops)
    .filter((provider) => provider.name.trim() && provider.href.trim())
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const primaryProvider = providers[0] ?? {
    name: 'O’Neills',
    description: 'Official St. Mochtas GFC jerseys, training wear, leisurewear and accessories for adults and children.',
    href: 'https://www.oneills.com/shop-by-team/gaa/ireland/st-mochtas-gfc-louth.html',
    image: '',
    sortOrder: '1',
  };
  const oneillsProvider = providers.find((provider) => /oneills|o’neills|o'neills/i.test(`${provider.name} ${provider.href}`)) ?? primaryProvider;
  return (
    <main className="archive-page shop-page">
      <SiteNavigation variant="sub" current="shop" />

      <section className="page-hero shop-hero">
        <div className="shell">
          <p className="eyebrow">Club shops</p>
          <h1>Wear the<br /><em>Mochs colours.</em></h1>
          <p>Approved retailers for St. Mochtas GFC jerseys, training wear and club clothing.</p>
        </div>
      </section>

      <section className="shop-intro shell">
        <div>
          <p className="eyebrow blue">Blue & yellow</p>
          <h2>From Páirc Mochta<br />to anywhere.</h2>
        </div>
        <div className="shop-intro-copy">
          <p>{primaryProvider.description}</p>
          <a className="button button-yellow" href={primaryProvider.href} target="_blank" rel="noreferrer">Visit {primaryProvider.name} <span>↗</span></a>
        </div>
      </section>

      <section className="shop-providers shell" aria-labelledby="shop-providers-title">
        <div className="shop-provider-heading">
          <p className="eyebrow blue">Where to buy</p>
          <h2 id="shop-providers-title">Approved club retailers.</h2>
        </div>
        <div className="shop-provider-grid">
          {providers.map((provider) => (
            <a className="shop-provider-card" href={provider.href} target="_blank" rel="noreferrer" key={`${provider.name}-${provider.href}`}>
              {provider.image ? <img src={provider.image} alt={`${provider.name} logo`} /> : <span className="shop-provider-name">{provider.name}</span>}
              <p>{provider.description}</p>
              <strong>Visit shop <span>↗</span></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="featured-kit">
        <div className="shell">
          <div className="featured-kit-heading">
            <div><p className="eyebrow">Featured kit</p><h2>The St. Mochtas jersey.</h2></div>
            <p>Choose the product to view available sizes, personalisation and current delivery information on O’Neills.</p>
          </div>

          <div className="kit-grid">
            {products.map((product, index) => (
              <a className={`kit-card kit-card-${index + 1}`} href={product.href} target="_blank" rel="noreferrer" key={product.name}>
                <div className="kit-image"><img src={product.image} alt={product.name} /></div>
                <div className="kit-details">
                  <span>{product.fit}</span>
                  <h3>{product.name}</h3>
                  <p>{product.price} <b>View on O’Neills ↗</b></p>
                </div>
              </a>
            ))}
          </div>
          <p className="shop-price-note">Product availability and prices are supplied by O’Neills and may change. Club-shop items bearing the crest are customised products; check the O’Neills size and returns information before ordering.</p>
        </div>
      </section>

      <section className="shop-cta">
        <div className="shell">
          <div><p className="eyebrow blue">Official O’Neills range</p><h2>See all club gear.</h2></div>
          <p>Browse jerseys, training wear, leisurewear and accessories for adults and children.</p>
          <a className="button" href={oneillsProvider.href} target="_blank" rel="noreferrer">Shop with {oneillsProvider.name} <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
