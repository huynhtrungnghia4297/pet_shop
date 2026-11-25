'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  PackageCheck,
  PawPrint,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import {
  BOOKING_STATUS_META,
  formatDateVi,
  formatVnd,
  ORDER_STATUS_META,
} from '@/lib/utils';
import { bookingService } from '@/services/bookingService';
import { orderService } from '@/services/orderService';
import { petService } from '@/services/petService';
import { productService } from '@/services/productService';
import type { BookingDto, OrderDto, PetProfileDto, ProductDto } from '@/types';

export function AdminDashboardClient() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [pets, setPets] = useState<PetProfileDto[]>([]);

  const loadAll = useCallback(async () => {
    const [pRes, bRes, oRes, petRes] = await Promise.all([
      productService.getAll(),
      bookingService.getAll(),
      orderService.getAll(),
      petService.getAll(),
    ]);
    if (pRes.success) setProducts(pRes.data);
    if (bRes.success) setBookings(bRes.data);
    if (oRes.success) setOrders(oRes.data);
    if (petRes.success) setPets(petRes.data);
  }, []);

  useEffect(() => {
    void loadAll();
    const u1 = productService.subscribe(() => void loadAll());
    const u2 = bookingService.subscribe(() => void loadAll());
    const u3 = orderService.subscribe(() => void loadAll());
    const u4 = petService.subscribe(() => void loadAll());
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [loadAll]);

  const publishedProducts = products.filter((p) => p.isPublished).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const orderRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const bookingRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.estimatedPrice, 0);
  const totalEstimatedRevenue = orderRevenue + bookingRevenue;

  const kpis = [
    {
      label: 'Sản phẩm đang mở bán',
      value: `${publishedProducts} / ${products.length}`,
      sub: `${products.length - publishedProducts} sản phẩm đang ẩn`,
      icon: PackageCheck,
      iconBg: 'bg-teal-50 text-teal-600',
      href: '/admin/products',
    },
    {
      label: 'Lịch hẹn chờ duyệt',
      value: String(pendingBookings),
      sub: `Tổng ${bookings.length} lịch • ${pets.length} hồ sơ bé`,
      icon: CalendarClock,
      iconBg: 'bg-sky-50 text-sky-600',
      href: '/admin/bookings',
    },
    {
      label: 'Đơn hàng mới',
      value: String(pendingOrders),
      sub: `Tổng ${orders.length} đơn hàng`,
      icon: ShoppingCart,
      iconBg: 'bg-indigo-50 text-indigo-600',
      href: '/admin/orders',
    },
    {
      label: 'Doanh thu ước tính',
      value: formatVnd(totalEstimatedRevenue),
      sub: `Đơn hàng ${formatVnd(orderRevenue)}`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      href: '/admin/orders',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Tổng quan Quản trị PawPalace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi báo cáo doanh thu, hồ sơ thú cưng CRM, lịch hẹn Spa/Khách
            sạn và đồng bộ cửa hàng theo thời gian thực.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/pets"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <PawPrint className="h-4 w-4" />
            <span>Hồ sơ Thú cưng ({pets.length})</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-teal-700"
          >
            <span>Quản lý sản phẩm</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all hover:border-teal-200 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {kpi.label}
                </span>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Analytics & Report Charts */}
      <AdminAnalyticsCharts orders={orders} bookings={bookings} />

      {/* Recent Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Lịch hẹn Spa &amp; Khách sạn gần đây
            </h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 4).map((bk) => {
              const meta = BOOKING_STATUS_META[bk.status];
              return (
                <div
                  key={bk.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {bk.petName} ({bk.petBreed}) — {bk.ownerName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {bk.serviceName} • {formatDateVi(bk.appointmentDate)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Đơn hàng mới nhất
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((ord) => {
              const meta = ORDER_STATUS_META[ord.status];
              return (
                <div
                  key={ord.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {ord.orderCode} — {ord.customerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ord.items.length} sản phẩm •{' '}
                      <strong className="text-teal-700">
                        {formatVnd(ord.totalAmount)}
                      </strong>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
