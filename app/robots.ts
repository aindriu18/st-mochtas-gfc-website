import type { MetadataRoute } from 'next';

const siteUrl = 'https://st-mochtas-gfc-louth.lively-teal-9910.chatgpt.site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/archive', '/api/admin'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
