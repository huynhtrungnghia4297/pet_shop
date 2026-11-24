'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SEED_PRODUCTS } from '@/data/seedData';
import { CATEGORY_LABELS } from '@/lib/utils';
import { productService } from '@/services/productService';
import type { PetTarget, ProductCategory, ProductDto } from '@/types';

type PriceRangeKey = 'all' | 'under200' | '200to400' | 'over400';

export function ShopCatalogClient() {
  const [products, setProducts] = useState<ProductDto[]>(() =>
    SEED_PRODUCTS.filter((p) => p.isPublished)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const [selectedPet, setSelectedPet] = useState<PetTarget | 'any'>('any');
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>(
    'newest'
  );

  const loadPublishedProducts = useCallback(async () => {
    const res = await productService.getPublished();
    if (res.success) {
      setProducts(res.data);
    }
  }, []);

  useEffect(() => {
    void loadPublishedProducts();
    return productService.subscribe(() => {
      void loadPublishedProducts();
    });
  }, [loadPublishedProducts]);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    const list = products.filter((item) => {
      if (keyword) {
        const hay = `${item.name} ${item.brand} ${item.shortDescription}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (selectedPet !== 'any') {
        if (selectedPet === 'all') {
          if (item.petTarget !== 'all') return false;
        } else if (item.petTarget !== selectedPet && item.petTarget !== 'all') {
          return false;
        }
      }

      if (priceRange === 'under200' && item.price >= 200000) return false;
      if (
        priceRange === '200to400' &&
        (item.price < 200000 || item.price > 400000)
      ) {
        return false;
      }
      if (priceRange === 'over400' && item.price <= 400000) return false;

      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedPet,
    priceRange,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPet('any');
    setPriceRange('all');
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Filter Control Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
        <div className="grid gap-4 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm thức ăn, sữa tắm, áo hoodie..."
              aria-label="Tìm kiếm sản phẩm theo tên"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as ProductCategory | 'all')
              }
              aria-label="Lọc theo danh mục"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">Tất cả danh mục</option>
              {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Pet Target */}
          <div className="md:col-span-2">
            <select
              value={selectedPet}
              onChange={(e) =>
                setSelectedPet(e.target.value as PetTarget | 'any')
              }
              aria-label="Lọc theo đối tượng thú cưng"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="any">Mọi thú cưng</option>
              <option value="dog">Dành cho Chó</option>
              <option value="cat">Dành cho Mèo</option>
              <option value="all">Dùng chung Chó &amp; Mèo</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="md:col-span-3">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRangeKey)}
              aria-label="Lọc theo khoảng giá"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">Mọi mức giá</option>
              <option value="under200">Dưới 200.000₫</option>
              <option value="200to400">200.000₫ – 400.000₫</option>
              <option value="over400">Trên 400.000₫</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Bar: Count + Sort + Reset */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5 text-teal-600" />
            <span>
              Đang hiển thị{' '}
              <strong className="text-slate-900">
                {filteredProducts.length}
              </strong>{' '}
              sản phẩm đang mở bán
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'newest' | 'price_asc' | 'price_desc'
                  )
                }
                aria-label="Sắp xếp sản phẩm"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <p className="text-base font-bold text-slate-800">
            Không tìm thấy sản phẩm phù hợp
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Thử đổi bộ lọc danh mục, khoảng giá hoặc từ khóa tìm kiếm khác.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
