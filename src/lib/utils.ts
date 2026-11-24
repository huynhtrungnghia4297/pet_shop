import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  BookingStatus,
  OrderStatus,
  PetTarget,
  ProductCategory,
} from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugifyVi(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

export function formatDateVi(isoOrDate: string): string {
  if (!isoOrDate) return '';
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  food: 'Thức ăn & Dinh dưỡng',
  grooming: 'Sữa tắm & Chăm sóc',
  apparel: 'Quần áo & Phụ kiện',
  toys: 'Đồ chơi & Dụng cụ',
};

export const PET_TARGET_LABELS: Record<PetTarget, string> = {
  dog: 'Chó',
  cat: 'Mèo',
  all: 'Chó & Mèo',
};

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  in_progress: {
    label: 'Đang thực hiện',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  shipping: {
    label: 'Đang giao',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};
