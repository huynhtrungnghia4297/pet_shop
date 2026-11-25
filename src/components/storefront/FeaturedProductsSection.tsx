'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  StaggerContainer,
  StaggerItem,
} from '@/components/motion/MotionPrimitives';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SEED_PRODUCTS } from '@/data/seedData';
import { productService } from '@/services/productService';
import type { ProductDto } from '@/types';

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<ProductDto[]>(() =>
    SEED_PRODUCTS.filter((p) => p.isPublished).slice(0, 4)
  );

  const loadProducts = useCallback(async () => {
    const res = await productService.getPublished();
    if (res.success) {
      setProducts(res.data.slice(0, 4));
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    return productService.subscribe(() => {
      void loadProducts();
    });
  }, [loadProducts]);

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-white py-20"
    >
      {/* Subtle Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full border border-teal-200/80 bg-teal-50/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
              Cửa hàng PawPalace
            </span>
            <h2
              id="featured-products-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              Sản phẩm nổi bật đang mở bán
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Tuyển chọn thức ăn dinh dưỡng, sữa tắm thảo mộc hữu cơ và phụ kiện
              an toàn được đồng bộ trực tiếp từ kho PawPalace.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
          >
            <span>Xem tất cả sản phẩm</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="surface-card-elevated rounded-2xl border-dashed p-12 text-center">
            <p className="text-sm text-slate-500">
              Hiện chưa có sản phẩm nào đang mở bán. Quản trị viên có thể bật
              hiển thị trong trang Quản trị sản phẩm.
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
