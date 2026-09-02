import type { MetadataRoute } from 'next';

const siteUrl = 'https://st-mochtas-gfc-louth.lively-teal-9910.chatgpt.site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ['', 'weekly', 1],
    ['/news', 'daily', 0.9],
    ['/history', 'monthly', 0.7],
    ['/honours', 'monthly', 0.7],
    ['/archive', 'monthly', 0.7],
    ['/membership', 'monthly', 0.8],
    ['/shop', 'monthly', 0.8],
    ['/sponsorship', 'monthly', 0.8],
    ['/contact', 'monthly', 0.7],
    ['/governance', 'yearly', 0.3],
  ] as const;

  return routes.map(([path, changeFrequency, priority]) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
