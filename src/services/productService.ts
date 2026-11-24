import { SEED_PRODUCTS } from '@/data/seedData';
import { slugifyVi } from '@/lib/utils';
import type {
  ApiResponse,
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '@/types';
import {
  buildApiResponse,
  fetchApi,
  MOCK_MODE,
  readLocalRepository,
  subscribeDataSync,
  writeLocalRepository,
} from './apiClient';

export const PRODUCTS_STORAGE_KEY = 'pawpalace_products_v1';

interface IProductRepository {
  getAll(): Promise<ApiResponse<ProductDto[]>>;
  getPublished(): Promise<ApiResponse<ProductDto[]>>;
  getBySlug(slug: string): Promise<ApiResponse<ProductDto | null>>;
  getById(id: string): Promise<ApiResponse<ProductDto | null>>;
  create(payload: CreateProductDto): Promise<ApiResponse<ProductDto>>;
  update(
    id: string,
    payload: UpdateProductDto
  ): Promise<ApiResponse<ProductDto | null>>;
  togglePublish(
    id: string,
    isPublished: boolean
  ): Promise<ApiResponse<ProductDto | null>>;
  remove(id: string): Promise<ApiResponse<boolean>>;
  decrementStock(
    items: Array<{ productId: string; variantLabel: string; quantity: number }>
  ): Promise<ApiResponse<boolean>>;
}

const mockProductRepository: IProductRepository = {
  async getAll() {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    return buildApiResponse(products, 'Lấy danh sách sản phẩm thành công');
  },

  async getPublished() {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    const published = products.filter((p) => p.isPublished === true);
    return buildApiResponse(published, 'Lấy sản phẩm đang mở bán thành công');
  },

  async getBySlug(slug: string) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    const found = products.find((p) => p.slug === slug) ?? null;
    return buildApiResponse(
      found,
      found ? 'Tìm thấy sản phẩm' : 'Không tìm thấy sản phẩm',
      Boolean(found)
    );
  },

  async getById(id: string) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    const found = products.find((p) => p.id === id) ?? null;
    return buildApiResponse(
      found,
      found ? 'Tìm thấy sản phẩm' : 'Không tìm thấy sản phẩm',
      Boolean(found)
    );
  },

  async create(payload: CreateProductDto) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    const now = new Date().toISOString();
    const baseSlug = payload.slug.trim() || slugifyVi(payload.name);
    const slugExists = products.some((p) => p.slug === baseSlug);
    const uniqueSlug = slugExists
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const newProduct: ProductDto = {
      id: `prod-${Date.now()}`,
      name: payload.name.trim(),
      slug: uniqueSlug,
      sku:
        payload.sku?.trim() ||
        `PP-${payload.category.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category: payload.category,
      petTarget: payload.petTarget,
      price: Number(payload.price),
      originalPrice: payload.originalPrice
        ? Number(payload.originalPrice)
        : undefined,
      stock: Number(payload.stock),
      imageUrl: payload.imageUrl.trim(),
      shortDescription: payload.shortDescription.trim(),
      description: payload.description.trim(),
      brand: payload.brand.trim() || 'PawPalace Select',
      rating: 5.0,
      reviewCount: 1,
      variants:
        payload.variants.length > 0
          ? payload.variants
          : [
              {
                id: `var-${Date.now()}`,
                label: 'Tiêu chuẩn',
                priceAdjustment: 0,
                stock: Number(payload.stock),
              },
            ],
      isPublished: payload.isPublished,
      isFeatured: payload.isFeatured ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newProduct, ...products];
    writeLocalRepository(PRODUCTS_STORAGE_KEY, updated);
    return buildApiResponse(newProduct, 'Thêm sản phẩm mới thành công');
  },

  async update(id: string, payload: UpdateProductDto) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    let updatedItem: ProductDto | null = null;
    const nextList = products.map((product) => {
      if (product.id !== id) return product;
      updatedItem = {
        ...product,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    });

    if (!updatedItem) {
      return buildApiResponse(null, 'Không tìm thấy sản phẩm', false);
    }

    writeLocalRepository(PRODUCTS_STORAGE_KEY, nextList);
    return buildApiResponse(updatedItem, 'Cập nhật sản phẩm thành công');
  },

  async togglePublish(id: string, isPublished: boolean) {
    return mockProductRepository.update(id, { isPublished });
  },

  async remove(id: string) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );
    const nextList = products.filter((p) => p.id !== id);
    writeLocalRepository(PRODUCTS_STORAGE_KEY, nextList);
    return buildApiResponse(true, 'Đã xóa sản phẩm');
  },

  async decrementStock(items) {
    const products = readLocalRepository<ProductDto[]>(
      PRODUCTS_STORAGE_KEY,
      SEED_PRODUCTS
    );

    const nextList = products.map((product) => {
      const matchingItems = items.filter((i) => i.productId === product.id);
      if (matchingItems.length === 0) return product;

      let totalOrdered = 0;
      const updatedVariants = product.variants.map((variant) => {
        const match = matchingItems.find(
          (m) => m.variantLabel === variant.label
        );
        if (!match) return variant;
        totalOrdered += match.quantity;
        return {
          ...variant,
          stock: Math.max(0, variant.stock - match.quantity),
        };
      });

      if (totalOrdered === 0) {
        totalOrdered = matchingItems.reduce((sum, m) => sum + m.quantity, 0);
      }

      return {
        ...product,
        stock: Math.max(0, product.stock - totalOrdered),
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      };
    });

    writeLocalRepository(PRODUCTS_STORAGE_KEY, nextList);
    return buildApiResponse(true, 'Đã cập nhật tồn kho tự động');
  },
};

const apiProductRepository: IProductRepository = {
  getAll: () => fetchApi<ProductDto[]>('/products'),
  getPublished: () => fetchApi<ProductDto[]>('/products?isPublished=true'),
  getBySlug: (slug) => fetchApi<ProductDto | null>(`/products/slug/${slug}`),
  getById: (id) => fetchApi<ProductDto | null>(`/products/${id}`),
  create: (payload) =>
    fetchApi<ProductDto>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    fetchApi<ProductDto | null>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  togglePublish: (id, isPublished) =>
    fetchApi<ProductDto | null>(`/products/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),
  remove: (id) =>
    fetchApi<boolean>(`/products/${id}`, {
      method: 'DELETE',
    }),
  decrementStock: (items) =>
    fetchApi<boolean>('/products/decrement-stock', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};

export const productService = {
  ...(MOCK_MODE ? mockProductRepository : apiProductRepository),
  subscribe(callback: () => void) {
    return subscribeDataSync(PRODUCTS_STORAGE_KEY, callback);
  },
};
