'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award,
  CalendarHeart,
  Crown,
  Gift,
  Home,
  LogOut,
  PawPrint,
  Phone,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDateVi } from '@/lib/utils';
import { MEMBER_TIER_RULES } from '@/services/authService';
import type { MemberTier, PointHistoryItemDto } from '@/types';

const TIER_CARD_GRADIENT: Record<MemberTier, string> = {
  Silver: 'from-teal-700 via-teal-600 to-sky-600',
  Gold: 'from-indigo-700 via-indigo-600 to-teal-600',
  Diamond: 'from-slate-900 via-indigo-800 to-teal-700',
};

const HISTORY_CATEGORY_ICON: Record<
  PointHistoryItemDto['category'],
  typeof Gift
> = {
  bonus: Gift,
  spa: Sparkles,
  hotel: Home,
  shop: ShoppingBag,
};

export function MemberProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';
  const { member, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-slate-500">
        Đang tải hồ sơ thành viên...
      </div>
    );
  }

  if (!isAuthenticated || !member) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Crown className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Đăng nhập để xem Thẻ Thành Viên
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Theo dõi điểm thưởng tích lũy, hạng thẻ ưu đãi 5% – 15% và lịch sử
            chăm sóc thú cưng của bạn tại PawPalace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Đăng nhập ngay
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100"
            >
              Đăng ký nhận 100 điểm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tierRule = MEMBER_TIER_RULES[member.tier];
  const nextPoints = tierRule.nextTierPoints;
  const progressPercent = nextPoints
    ? Math.min(100, Math.round((member.points / nextPoints) * 100))
    : 100;
  const remainingPoints = nextPoints
    ? Math.max(0, nextPoints - member.points)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {isWelcome && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          <Gift className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Chào mừng <strong>{member.fullName}</strong> gia nhập PawPalace
            Club! Bạn đã được cộng ngay <strong>+100 điểm thưởng</strong> vào
            tài khoản.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hồ sơ Thành viên PawPalace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thẻ hội viên, điểm thưởng tích lũy và đặc quyền giảm giá.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Virtual Membership Card + Progress */}
        <div className="space-y-6 lg:col-span-5">
          {/* Virtual Card */}
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-card ${TIER_CARD_GRADIENT[member.tier]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
                  <PawPrint className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight">
                    PawPalace Club
                  </p>
                  <p className="text-[11px] text-teal-100">
                    {member.memberCode}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-xs">
                <Crown className="h-3.5 w-3.5" />
                <span>{member.tier}</span>
              </span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-teal-100/80">
                Điểm tích lũy hiện có
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight">
                  {member.points}
                </span>
                <span className="text-sm font-semibold text-teal-100">
                  điểm
                </span>
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between border-t border-white/20 pt-4">
              <div>
                <p className="text-[11px] text-teal-100/80">Chủ thẻ</p>
                <p className="text-sm font-bold">{member.fullName}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-teal-100/80">Ưu đãi trực tiếp</p>
                <p className="text-base font-extrabold text-emerald-200">
                  Giảm {member.discountPercent}%
                </p>
              </div>
            </div>
          </div>

          {/* Tier Progress Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Award className="h-4.5 w-4.5 text-indigo-600" />
                <span>Tiến trình nâng hạng thẻ</span>
              </span>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-600"
              />
            </div>

            {tierRule.nextTier && nextPoints ? (
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Bạn cần tích thêm{' '}
                <strong className="text-indigo-700">
                  {remainingPoints} điểm
                </strong>{' '}
                nữa để lên hạng{' '}
                <strong className="text-slate-900">{tierRule.nextTier}</strong>{' '}
                và nhận ưu đãi giảm trực tiếp{' '}
                <strong>
                  {MEMBER_TIER_RULES[tierRule.nextTier].discountPercent}%
                </strong>
                .
              </p>
            ) : (
              <p className="mt-3 text-xs font-medium text-emerald-700">
                Chúc mừng! Bạn đang ở hạng thẻ cao nhất Diamond với mức ưu đãi
                tối đa 15%.
              </p>
            )}

            {/* Account Info Summary */}
            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  <span>Số điện thoại</span>
                </dt>
                <dd className="font-semibold text-slate-900">{member.phone}</dd>
              </div>
              {member.petName && (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-slate-500">
                    <PawPrint className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Thú cưng của bạn</span>
                  </dt>
                  <dd className="font-semibold text-slate-900">
                    {member.petName} (
                    {member.petSpecies === 'cat' ? 'Mèo' : 'Chó'})
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Ngày gia nhập</dt>
                <dd className="font-semibold text-slate-900">
                  {formatDateVi(member.joinedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Point History & Quick Actions */}
        <div className="space-y-6 lg:col-span-7">
          {/* Quick Actions to Earn Points */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/booking?type=spa"
              className="rounded-2xl border border-teal-100 bg-white p-4 shadow-soft transition-all hover:border-teal-300 hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <CalendarHeart className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">
                Đặt lịch Spa
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Giảm {member.discountPercent}% + Tích điểm
              </p>
            </Link>

            <Link
              href="/pet-hotel"
              className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-soft transition-all hover:border-indigo-300 hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Home className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">
                Khách sạn 24/7
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Ưu tiên phòng VIP &amp; Camera
              </p>
            </Link>

            <Link
              href="/shop"
              className="rounded-2xl border border-sky-100 bg-white p-4 shadow-soft transition-all hover:border-sky-300 hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">
                Cửa hàng
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Mua sắm dinh dưỡng tích điểm
              </p>
            </Link>
          </div>

          {/* Point History */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Lịch sử tích điểm thưởng
                </h2>
                <p className="text-xs text-slate-500">
                  Cập nhật tự động sau mỗi giao dịch hoàn tất tại PawPalace.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {member.pointHistory.length} giao dịch
              </span>
            </div>

            {member.pointHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Chưa có lịch sử điểm thưởng.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {member.pointHistory.map((item) => {
                  const Icon = HISTORY_CATEGORY_ICON[item.category] || Gift;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.description} • {formatDateVi(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                        +{item.pointsDelta} điểm
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
