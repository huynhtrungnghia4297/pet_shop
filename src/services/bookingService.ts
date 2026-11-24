import { SEED_BOOKINGS } from '@/data/seedData';
import type {
  ApiResponse,
  BookingDto,
  BookingStatus,
  CreateBookingDto,
} from '@/types';
import {
  buildApiResponse,
  fetchApi,
  MOCK_MODE,
  readLocalRepository,
  subscribeDataSync,
  writeLocalRepository,
} from './apiClient';

export const BOOKINGS_STORAGE_KEY = 'pawpalace_bookings_v1';

interface IBookingRepository {
  getAll(): Promise<ApiResponse<BookingDto[]>>;
  getById(id: string): Promise<ApiResponse<BookingDto | null>>;
  create(payload: CreateBookingDto): Promise<ApiResponse<BookingDto>>;
  updateStatus(
    id: string,
    status: BookingStatus
  ): Promise<ApiResponse<BookingDto | null>>;
  remove(id: string): Promise<ApiResponse<boolean>>;
}

const mockBookingRepository: IBookingRepository = {
  async getAll() {
    const bookings = readLocalRepository<BookingDto[]>(
      BOOKINGS_STORAGE_KEY,
      SEED_BOOKINGS
    );
    return buildApiResponse(bookings, 'Lấy danh sách lịch hẹn thành công');
  },

  async getById(id: string) {
    const bookings = readLocalRepository<BookingDto[]>(
      BOOKINGS_STORAGE_KEY,
      SEED_BOOKINGS
    );
    const found = bookings.find((b) => b.id === id) ?? null;
    return buildApiResponse(found, found ? 'Thành công' : 'Không tìm thấy', Boolean(found));
  },

  async create(payload: CreateBookingDto) {
    const bookings = readLocalRepository<BookingDto[]>(
      BOOKINGS_STORAGE_KEY,
      SEED_BOOKINGS
    );
    const prefix = payload.type === 'spa' ? 'PP-SPA' : 'PP-HTL';
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newBooking: BookingDto = {
      ...payload,
      id: `bk-${Date.now()}`,
      bookingCode: `${prefix}-${randomNum}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    writeLocalRepository(BOOKINGS_STORAGE_KEY, [newBooking, ...bookings]);
    return buildApiResponse(newBooking, 'Đặt lịch hẹn thành công');
  },

  async updateStatus(id: string, status: BookingStatus) {
    const bookings = readLocalRepository<BookingDto[]>(
      BOOKINGS_STORAGE_KEY,
      SEED_BOOKINGS
    );
    let updatedItem: BookingDto | null = null;
    const nextList = bookings.map((item) => {
      if (item.id !== id) return item;
      updatedItem = { ...item, status };
      return updatedItem;
    });

    if (!updatedItem) {
      return buildApiResponse(null, 'Không tìm thấy lịch hẹn', false);
    }

    writeLocalRepository(BOOKINGS_STORAGE_KEY, nextList);
    return buildApiResponse(updatedItem, 'Cập nhật trạng thái lịch hẹn thành công');
  },

  async remove(id: string) {
    const bookings = readLocalRepository<BookingDto[]>(
      BOOKINGS_STORAGE_KEY,
      SEED_BOOKINGS
    );
    writeLocalRepository(
      BOOKINGS_STORAGE_KEY,
      bookings.filter((b) => b.id !== id)
    );
    return buildApiResponse(true, 'Đã xóa lịch hẹn');
  },
};

const apiBookingRepository: IBookingRepository = {
  getAll: () => fetchApi<BookingDto[]>('/bookings'),
  getById: (id) => fetchApi<BookingDto | null>(`/bookings/${id}`),
  create: (payload) =>
    fetchApi<BookingDto>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateStatus: (id, status) =>
    fetchApi<BookingDto | null>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  remove: (id) =>
    fetchApi<boolean>(`/bookings/${id}`, {
      method: 'DELETE',
    }),
};

export const bookingService = {
  ...(MOCK_MODE ? mockBookingRepository : apiBookingRepository),
  subscribe(callback: () => void) {
    return subscribeDataSync(BOOKINGS_STORAGE_KEY, callback);
  },
};
