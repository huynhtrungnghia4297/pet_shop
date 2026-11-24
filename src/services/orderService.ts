import { SEED_ORDERS } from '@/data/seedData';
import type {
  ApiResponse,
  CreateOrderDto,
  OrderDto,
  OrderStatus,
} from '@/types';
import {
  buildApiResponse,
  fetchApi,
  MOCK_MODE,
  readLocalRepository,
  subscribeDataSync,
  writeLocalRepository,
} from './apiClient';
import { productService } from './productService';

export const ORDERS_STORAGE_KEY = 'pawpalace_orders_v1';

interface IOrderRepository {
  getAll(): Promise<ApiResponse<OrderDto[]>>;
  getById(id: string): Promise<ApiResponse<OrderDto | null>>;
  create(payload: CreateOrderDto): Promise<ApiResponse<OrderDto>>;
  updateStatus(
    id: string,
    status: OrderStatus
  ): Promise<ApiResponse<OrderDto | null>>;
}

const mockOrderRepository: IOrderRepository = {
  async getAll() {
    const orders = readLocalRepository<OrderDto[]>(
      ORDERS_STORAGE_KEY,
      SEED_ORDERS
    );
    return buildApiResponse(orders, 'Lấy danh sách đơn hàng thành công');
  },

  async getById(id: string) {
    const orders = readLocalRepository<OrderDto[]>(
      ORDERS_STORAGE_KEY,
      SEED_ORDERS
    );
    const found = orders.find((o) => o.id === id) ?? null;
    return buildApiResponse(found, found ? 'Thành công' : 'Không tìm thấy', Boolean(found));
  },

  async create(payload: CreateOrderDto) {
    const orders = readLocalRepository<OrderDto[]>(
      ORDERS_STORAGE_KEY,
      SEED_ORDERS
    );
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: OrderDto = {
      ...payload,
      id: `ord-${Date.now()}`,
      orderCode: `PP-ORD-${randomNum}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    writeLocalRepository(ORDERS_STORAGE_KEY, [newOrder, ...orders]);

    // Automatically deduct inventory stock when an order is placed
    await productService.decrementStock(
      payload.items.map((item) => ({
        productId: item.productId,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
      }))
    );

    return buildApiResponse(newOrder, 'Tạo đơn hàng thành công');
  },

  async updateStatus(id: string, status: OrderStatus) {
    const orders = readLocalRepository<OrderDto[]>(
      ORDERS_STORAGE_KEY,
      SEED_ORDERS
    );
    let updatedOrder: OrderDto | null = null;
    const nextList = orders.map((order) => {
      if (order.id !== id) return order;
      updatedOrder = { ...order, status };
      return updatedOrder;
    });

    if (!updatedOrder) {
      return buildApiResponse(null, 'Không tìm thấy đơn hàng', false);
    }

    writeLocalRepository(ORDERS_STORAGE_KEY, nextList);
    return buildApiResponse(updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
  },
};

const apiOrderRepository: IOrderRepository = {
  getAll: () => fetchApi<OrderDto[]>('/orders'),
  getById: (id) => fetchApi<OrderDto | null>(`/orders/${id}`),
  create: (payload) =>
    fetchApi<OrderDto>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateStatus: (id, status) =>
    fetchApi<OrderDto | null>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const orderService = {
  ...(MOCK_MODE ? mockOrderRepository : apiOrderRepository),
  subscribe(callback: () => void) {
    return subscribeDataSync(ORDERS_STORAGE_KEY, callback);
  },
};
