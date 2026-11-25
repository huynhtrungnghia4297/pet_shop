'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarClock,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Package,
  PawPrint,
  Server,
  ShoppingCart,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MODE } from '@/services/apiClient';

const ADMIN_NAV = [
  { href: '/admin', label: 'Tổng quan Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
  { href: '/admin/products', label: 'Quản lý Sản phẩm', icon: Package },
  { href: '/admin/bookings', label: 'Lịch hẹn Spa & Hotel', icon: CalendarClock },
  { href: '/admin/pets', label: 'Hồ sơ Thú cưng', icon: PawPrint },
  { href: '/admin/orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white shadow-xs">
            <PawPrint className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-slate-900">
              Paw<span className="text-teal-600">Palace</span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
              Admin Portal
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-1 p-4">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4.5 w-4.5',
                  active ? 'text-teal-600' : 'text-slate-400'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info & Storefront Link */}
      <div className="space-y-3 border-t border-slate-100 p-4">
        <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-sky-800">
            <Server className="h-3.5 w-3.5" />
            <span>Chế độ dữ liệu</span>
          </div>
          <p className="mt-1 text-[11px] text-sky-700">
            {MOCK_MODE
              ? 'Mock Adapter (localStorage Sync)'
              : 'ASP.NET Core Web API Live'}
          </p>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        >
          <span>Xem trang Khách hàng</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <PawPrint className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-slate-900">
            PawPalace Admin
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            Storefront
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-700"
            aria-label="Mở menu quản trị"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40"
          />
          <aside className="relative z-10 h-full w-72 bg-white shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
