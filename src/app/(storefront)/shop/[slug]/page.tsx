import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { SEED_PRODUCTS } from '@/data/seedData';
import {
  buildPageMetadata,
  buildProductJsonLd,
} from '@/lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return buildPageMetadata({
      title: 'Chi tiết sản phẩm',
      description:
        'Khám phá sản phẩm chăm sóc & dinh dưỡng thú cưng chính hãng tại PawPalace.',
      path: `/shop/${slug}`,
    });
  }

  return buildPageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/shop/${product.slug}`,
    image: product.imageUrl,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const seedProduct = SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;

  return (
    <>
      {seedProduct && <JsonLd data={buildProductJsonLd(seedProduct)} />}
      <ProductDetailClient slug={slug} initialProduct={seedProduct} />
    </>
  );
}
