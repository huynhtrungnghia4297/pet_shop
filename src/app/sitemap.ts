import type { MetadataRoute } from 'next';
import { SEED_PRODUCTS } from '@/data/seedData';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/services', '/pet-hotel', '/shop', '/booking'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.85,
    })
  );

  const productRoutes = SEED_PRODUCTS.filter((p) => p.isPublished).map(
    (product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })
  );

  return [...staticRoutes, ...productRoutes];
}
