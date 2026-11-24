import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/services', '/pet-hotel', '/shop', '/booking'],
        disallow: ['/admin', '/cart', '/checkout'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
