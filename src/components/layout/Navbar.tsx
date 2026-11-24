'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  PawPrint,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/services', label: 'Dịch vụ Spa' },
  { href: '/pet-hotel', label: 'Khách sạn thú cưng' },
  { href: '/shop', label: 'Cửa hàng' },
  { href: '/booking', label: 'Đặt lịch hẹn' },
];

function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openDrawer } = useCart();
  const { member, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMemberMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMemberMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-teal-100/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none"
          aria-label="PawPalace Trang chủ"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <PawPrint className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Paw<span className="text-teal-600">Palace</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Spa • Pet Hotel • Boutique
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Cart + Member */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openDrawer}
            className="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50/60 hover:text-teal-700"
            aria-label="Mở giỏ hàng"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          {/* Member Action (Desktop) */}
          {!isAuthenticated || !member ? (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:inline-flex"
            >
              <Crown className="h-4 w-4" />
              <span>Thành viên</span>
            </Link>
          ) : (
            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setMemberMenuOpen((prev) => !prev)}
                aria-expanded={memberMenuOpen}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 text-sm font-semibold text-indigo-800 transition-colors hover:bg-indigo-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Crown className="h-3.5 w-3.5" />
                </span>
                <span>
                  Xin chào, {getFirstName(member.fullName)} •{' '}
                  <strong className="text-teal-700">{member.points} điểm</strong>
                </span>
                <ChevronDown className="h-4 w-4 text-indigo-500" />
              </button>

              <AnimatePresence>
                {memberMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    <div className="rounded-xl bg-[#F0FDFA] px-3 py-2.5">
                      <p className="text-xs font-bold text-slate-900">
                        {member.fullName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                        <Sparkles className="h-3 w-3" />
                        <span>
                          Hạng {member.tier} • Giảm {member.discountPercent}%
                        </span>
                      </p>
                    </div>

                    <div className="mt-1.5 space-y-1">
                      <Link
                        href="/member"
                        onClick={() => setMemberMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        <User className="h-4 w-4 text-teal-600" />
                        <span>Hồ sơ &amp; Tích điểm</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <LogOut className="h-4 w-4 text-slate-400" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            aria-label="Điều hướng di động"
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-xl px-4 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-slate-100 pt-3">
                {!isAuthenticated || !member ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Thành viên — Đăng nhập / Đăng ký</span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/member"
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center justify-between rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-800"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-indigo-600" />
                        <span>
                          Xin chào, {getFirstName(member.fullName)} •{' '}
                          {member.points} điểm
                        </span>
                      </span>
                      <span className="text-xs text-teal-700">Hồ sơ →</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
