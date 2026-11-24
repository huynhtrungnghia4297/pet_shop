import type { Metadata } from 'next';
import type { ProductDto } from '@/types';
import { CATEGORY_LABELS } from './utils';

export const SITE_NAME = 'PawPalace';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://pawpalace.vn';
export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80';

export function buildPageMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonicalUrl = `${SITE_URL}${params.path}`;
  const ogImage = params.image || DEFAULT_OG_IMAGE;

  return {
    title: params.title,
    description: params.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: params.title,
      description: params.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: params.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [ogImage],
    },
    ...(params.noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}

export function buildPetStoreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    name: 'PawPalace — Spa Thú Cưng, Khách Sạn 24/7 & Cửa Hàng Dinh Dưỡng',
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: '+84-28-3888-6868',
    priceRange: '90.000₫ - 1.500.000₫',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '68 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức',
      addressLocality: 'TP. Hồ Chí Minh',
      addressCountry: 'VN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '21:00',
      },
    ],
    sameAs: [
      'https://facebook.com/pawpalace.vn',
      'https://instagram.com/pawpalace.vn',
    ],
  };
}

export function buildProductJsonLd(product: ProductDto) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: product.shortDescription,
    sku: product.sku,
    category: CATEGORY_LABELS[product.category],
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: 'VND',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}
