'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { SAMPLE_PRODUCT_IMAGES } from '@/data/seedData';
import {
  CATEGORY_LABELS,
  formatVnd,
  PET_TARGET_LABELS,
  slugifyVi,
} from '@/lib/utils';
import { productService } from '@/services/productService';
import type {
  CreateProductDto,
  PetTarget,
  ProductCategory,
  ProductDto,
  ProductVariantDto,
} from '@/types';

interface FormState {
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  petTarget: PetTarget;
  brand: string;
  price: string;
  originalPrice: string;
  stock: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  isPublished: boolean;
  variants: ProductVariantDto[];
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  sku: '',
  category: 'food',
  petTarget: 'all',
  brand: 'PawPalace Select',
  price: '250000',
  originalPrice: '',
  stock: '20',
  imageUrl: SAMPLE_PRODUCT_IMAGES[0].url,
  shortDescription: '',
  description: '',
  isPublished: true,
  variants: [
    { id: 'v-new-1', label: 'Tiêu chuẩn', priceAdjustment: 0, stock: 20 },
  ],
};

export function AdminProductsClient() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    ProductCategory | 'all'
  >('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'hidden'
  >('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProducts = useCallback(async () => {
    const res = await productService.getAll();
    if (res.success) setProducts(res.data);
  }, []);

  useEffect(() => {
    void loadProducts();
    return productService.subscribe(() => void loadProducts());
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return products.filter((p) => {
      if (kw && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(kw)) {
        return false;
      }
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'published' && !p.isPublished) return false;
      if (statusFilter === 'hidden' && p.isPublished) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      variants: [
        {
          id: `v-${Date.now()}`,
          label: 'Tiêu chuẩn',
          priceAdjustment: 0,
          stock: 20,
        },
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (product: ProductDto) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      petTarget: product.petTarget,
      brand: product.brand,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      shortDescription: product.shortDescription,
      description: product.description,
      isPublished: product.isPublished,
      variants:
        product.variants.length > 0
          ? product.variants
          : [
              {
                id: `v-${Date.now()}`,
                label: 'Tiêu chuẩn',
                priceAdjustment: 0,
                stock: product.stock,
              },
            ],
    });
    setModalOpen(true);
  };

  const handleTogglePublish = async (product: ProductDto) => {
    const nextState = !product.isPublished;
    await productService.togglePublish(product.id, nextState);
    showToast(
      nextState
        ? `Đã mở bán "${product.name}" trên trang khách hàng`
        : `Đã ẩn "${product.name}" khỏi trang khách hàng`
    );
  };

  const handleDelete = async (product: ProductDto) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }
    await productService.remove(product.id);
    showToast(`Đã xóa sản phẩm "${product.name}"`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.imageUrl.trim()) return;

    const payload: CreateProductDto = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifyVi(form.name),
      sku: form.sku.trim() || undefined,
      category: form.category,
      petTarget: form.petTarget,
      brand: form.brand.trim() || 'PawPalace Select',
      price: Math.max(0, Number(form.price) || 0),
      originalPrice: form.originalPrice
        ? Math.max(0, Number(form.originalPrice))
        : undefined,
      stock: Math.max(0, Number(form.stock) || 0),
      imageUrl: form.imageUrl.trim(),
      shortDescription:
        form.shortDescription.trim() || form.description.trim().slice(0, 140),
      description: form.description.trim() || form.shortDescription.trim(),
      isPublished: form.isPublished,
      variants: form.variants.filter((v) => v.label.trim().length > 0),
    };

    if (editingId) {
      await productService.update(editingId, payload);
      showToast('Đã cập nhật sản phẩm và đồng bộ ra Storefront');
    } else {
      await productService.create(payload);
      showToast('Đã thêm sản phẩm mới thành công');
    }

    setModalOpen(false);
  };

  const addVariantRow = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `v-${Date.now()}`,
          label: '',
          priceAdjustment: 0,
          stock: Number(prev.stock) || 10,
        },
      ],
    }));
  };

  const updateVariantRow = (
    idx: number,
    field: keyof ProductVariantDto,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariantRow = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Quản lý Sản phẩm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gạt công tắc <strong>Mở bán (isPublished)</strong> để bật hoặc ẩn
            sản phẩm tức thì ngoài Trang chủ &amp; Cửa hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Sync Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft sm:grid-cols-12">
        <div className="relative sm:col-span-5">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU, thương hiệu..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as ProductCategory | 'all')
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'published' | 'hidden')
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đang mở bán</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                <th className="px-5 py-3.5">Sản phẩm</th>
                <th className="px-4 py-3.5">Danh mục</th>
                <th className="px-4 py-3.5 text-right">Giá bán</th>
                <th className="px-4 py-3.5 text-center">Tồn kho</th>
                <th className="px-4 py-3.5 text-center">Mở bán (isPublished)</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-xs truncate font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.sku} • {PET_TARGET_LABELS[product.petTarget]}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      {CATEGORY_LABELS[product.category]}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatVnd(product.price)}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.stock > 5
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Instant Publish Toggle Switch */}
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.isPublished}
                      onClick={() => void handleTogglePublish(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                        product.isPublished ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition-transform ${
                          product.isPublished ? 'translate-x-5.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      {product.isPublished ? 'Đang mở bán' : 'Đang ẩn'}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {product.isPublished && (
                        <Link
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          title="Xem ngoài Storefront"
                          className="rounded-lg p-2 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        title="Chỉnh sửa sản phẩm"
                        className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        title="Xóa sản phẩm"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <p className="text-xs text-slate-500">
                  Slug chuẩn SEO được tạo tự động từ tên sản phẩm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name: val,
                        slug: editingId ? prev.slug : slugifyVi(val),
                      }));
                    }}
                    placeholder="VD: Sữa Tắm Hoa Cúc Hữu Cơ Cho Chó Mèo"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Slug SEO (URL)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, brand: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Danh mục
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value as ProductCategory,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {CATEGORY_LABELS[k]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Đối tượng thú cưng
                  </label>
                  <select
                    value={form.petTarget}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        petTarget: e.target.value as PetTarget,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="all">Chó &amp; Mèo</option>
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL + Sample Image Picker */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  URL Hình ảnh sản phẩm *
                </label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />
                <div className="mt-2.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <ImageIcon className="h-3.5 w-3.5 text-teal-600" />
                    <span>Chọn nhanh bộ ảnh mẫu để test:</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {SAMPLE_PRODUCT_IMAGES.map((sample) => (
                      <button
                        key={sample.url}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, imageUrl: sample.url }))
                        }
                        title={sample.label}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          form.imageUrl === sample.url
                            ? 'border-teal-600 ring-2 ring-teal-500/30'
                            : 'border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <Image
                          src={sample.url}
                          alt={sample.label}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mô tả ngắn (Meta Description)
                  </label>
                  <textarea
                    rows={3}
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mô tả chi tiết sản phẩm
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Editor */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Biến thể (Size / Mùi hương / Trọng lượng)
                  </p>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm biến thể</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {form.variants.map((variant, idx) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-12 items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Tên biến thể (VD: Size M, 500ml)"
                        value={variant.label}
                        onChange={(e) =>
                          updateVariantRow(idx, 'label', e.target.value)
                        }
                        className="col-span-5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Chênh lệch giá"
                        value={variant.priceAdjustment}
                        onChange={(e) =>
                          updateVariantRow(
                            idx,
                            'priceAdjustment',
                            Number(e.target.value) || 0
                          )
                        }
                        className="col-span-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Kho"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariantRow(
                            idx,
                            'stock',
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                        className="col-span-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantRow(idx)}
                        disabled={form.variants.length <= 1}
                        className="col-span-1 flex justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Switch */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Mở bán ngay ngoài Trang khách hàng (isPublished)
                  </p>
                  <p className="text-xs text-slate-600">
                    Bật công tắc này để sản phẩm xuất hiện lập tức tại Trang chủ
                    và Cửa hàng.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-teal-600"
                />
              </label>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  {editingId ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
