'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useCart } from '@/context/CartContext';
import { CATEGORY_LABELS, formatVnd, PET_TARGET_LABELS } from '@/lib/utils';
import { productService } from '@/services/productService';
import type { ProductDto } from '@/types';

interface ProductDetailClientProps {
  slug: string;
  initialProduct: ProductDto | null;
}

export function ProductDetailClient({
  slug,
  initialProduct,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDto | null>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialProduct?.variants[0]?.id ?? ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(!initialProduct);

  const loadData = useCallback(async () => {
    const [prodRes, publishedRes] = await Promise.all([
      productService.getBySlug(slug),
      productService.getPublished(),
    ]);

    if (prodRes.success && prodRes.data) {
      setProduct(prodRes.data);
      setSelectedVariantId((prev) =>
        prodRes.data?.variants.some((v) => v.id === prev)
          ? prev
          : prodRes.data?.variants[0]?.id ?? ''
      );
    } else {
      setProduct(null);
    }

    if (publishedRes.success) {
      setRelatedProducts(
        publishedRes.data.filter((p) => p.slug !== slug).slice(0, 4)
      );
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void loadData();
    return productService.subscribe(() => {
      void loadData();
    });
  }, [loadData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-slate-500">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product || !product.isPublished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900">
            Sản phẩm hiện không khả dụng
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sản phẩm có thể đã tạm ẩn hoặc hết hàng. Mời bạn tham khảo các sản
            phẩm khác đang mở bán tại PawPalace.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Cửa hàng</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0] ?? {
      id: 'default',
      label: 'Tiêu chuẩn',
      priceAdjustment: 0,
      stock: product.stock,
    };

  const finalPrice = Math.max(0, product.price + activeVariant.priceAdjustment);
  const availableStock = Math.min(product.stock, activeVariant.stock || product.stock);
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = (buyNow = false) => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        variantId: activeVariant.id,
        variantLabel: activeVariant.label,
        unitPrice: finalPrice,
        quantity,
        maxStock: availableStock,
      },
      !buyNow
    );
    if (buyNow) {
      router.push('/checkout');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-teal-600">
          Cửa hàng
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-slate-800">
          {product.name}
        </span>
      </nav>

      {/* 2-Column Product Detail */}
      <div className="grid gap-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft lg:grid-cols-12 lg:p-10">
        {/* Left: Clean Image Frame */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            <Image
              src={product.imageUrl}
              alt={`${product.name} - ${product.brand} chính hãng tại PawPalace`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Right: Product Metadata & Actions */}
        <div className="flex flex-col lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Dành cho: {PET_TARGET_LABELS[product.petTarget]}
            </span>
            <span className="text-xs font-medium text-slate-400">
              SKU: {product.sku}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-teal-500 text-teal-500" />
              <span className="font-bold text-slate-900">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-slate-400">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span>
              Thương hiệu:{' '}
              <strong className="text-slate-900">{product.brand}</strong>
            </span>
          </div>

          {/* Price Block */}
          <div className="mt-6 rounded-2xl bg-[#F0FDFA] p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-teal-700">
                {formatVnd(finalPrice)}
              </span>
              {product.originalPrice && product.originalPrice > finalPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatVnd(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isOutOfStock
                  ? 'Tạm hết hàng phân loại này'
                  : `Còn ${availableStock} sản phẩm sẵn sàng giao ngay`}
              </span>
            </p>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Chọn phân loại (Size / Mùi hương / Trọng lượng)
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => {
                  const selected = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                        selected
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-slate-600 hover:text-teal-700"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(availableStock, q + 1))
                }
                disabled={quantity >= availableStock}
                className="p-3 text-slate-600 hover:text-teal-700 disabled:opacity-40"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAddToCart(false)}
              disabled={isOutOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-500"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>{isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ hàng'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddToCart(true)}
              disabled={isOutOfStock}
              className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-500"
            >
              Mua ngay
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
              <span>Chính hãng 100%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Truck className="h-4 w-4 shrink-0 text-sky-600" />
              <span>Freeship đơn từ 500K</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Package className="h-4 w-4 shrink-0 text-indigo-600" />
              <span>Đổi trả trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold text-slate-900">
            Có thể bé cũng thích
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
