'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { ScaleOnHover } from '@/components/motion/MotionPrimitives';
import { useCart } from '@/context/CartContext';
import { CATEGORY_LABELS, formatVnd, PET_TARGET_LABELS } from '@/lib/utils';
import type { ProductDto } from '@/types';

interface ProductCardProps {
  product: ProductDto;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const defaultVariant = product.variants[0] ?? {
    id: 'default',
    label: 'Tiêu chuẩn',
    priceAdjustment: 0,
    stock: product.stock,
  };
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      variantId: defaultVariant.id,
      variantLabel: defaultVariant.label,
      unitPrice: Math.max(0, product.price + defaultVariant.priceAdjustment),
      quantity: 1,
      maxStock: Math.max(1, defaultVariant.stock || product.stock),
    });
  };

  return (
    <ScaleOnHover className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-shadow hover:border-teal-200 hover:shadow-card">
        {/* Clean Image Frame — Zero overlay text or CTAs on image */}
        <Link
          href={`/shop/${product.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100"
        >
          <Image
            src={product.imageUrl}
            alt={`${product.name} - ${CATEGORY_LABELS[product.category]} tại PawPalace`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>

        {/* Separated Content Block */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              {PET_TARGET_LABELS[product.petTarget]}
            </span>
          </div>

          <Link href={`/shop/${product.slug}`} className="group">
            <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-teal-600">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.shortDescription}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Star className="h-3.5 w-3.5 fill-teal-500 text-teal-500" />
            <span className="font-semibold text-slate-700">
              {product.rating.toFixed(1)}
            </span>
            <span>({product.reviewCount} đánh giá)</span>
            <span className="mx-1 text-slate-300">•</span>
            <span
              className={
                isOutOfStock
                  ? 'font-medium text-slate-400'
                  : 'font-medium text-emerald-600'
              }
            >
              {isOutOfStock ? 'Tạm hết hàng' : `Còn ${product.stock}`}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <div className="text-lg font-bold text-teal-700">
                {formatVnd(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-xs text-slate-400 line-through">
                  {formatVnd(product.originalPrice)}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}</span>
            </button>
          </div>
        </div>
      </article>
    </ScaleOnHover>
  );
}
