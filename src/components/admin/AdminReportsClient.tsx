'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  BarChart3,
  CalendarRange,
  Check,
  Download,
  Home,
  Package,
  PieChart,
  Repeat2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  buildReportSummary,
  exportReportToCsv,
  type DaySubRange,
  type ReportGranularity,
} from '@/lib/reportUtils';
import { CATEGORY_LABELS, formatVnd } from '@/lib/utils';
import { bookingService } from '@/services/bookingService';
import { orderService } from '@/services/orderService';
import { petService } from '@/services/petService';
import { productService } from '@/services/productService';
import type { BookingDto, OrderDto, PetProfileDto, ProductDto } from '@/types';

const GRANULARITY_TABS: Array<{
  id: Exclude<ReportGranularity, 'custom'>;
  label: string;
}> = [
  { id: 'day', label: 'Theo Ngày' },
  { id: 'week', label: 'Theo Tuần' },
  { id: 'month', label: 'Theo Tháng' },
  { id: 'year', label: 'Theo Năm' },
];

function formatCompactVnd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return String(amount);
}

export function AdminReportsClient() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [pets, setPets] = useState<PetProfileDto[]>([]);

  const [granularity, setGranularity] = useState<ReportGranularity>('day');
  const [daySubRange, setDaySubRange] = useState<DaySubRange>('7d');
  const [customStart, setCustomStart] = useState<string>('2026-11-12');
  const [customEnd, setCustomEnd] = useState<string>('2026-11-25');

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const loadAll = useCallback(async () => {
    const [oRes, bRes, pRes, petRes] = await Promise.all([
      orderService.getAll(),
      bookingService.getAll(),
      productService.getAll(),
      petService.getAll(),
    ]);
    if (oRes.success) setOrders(oRes.data);
    if (bRes.success) setBookings(bRes.data);
    if (pRes.success) setProducts(pRes.data);
    if (petRes.success) setPets(petRes.data);
  }, []);

  useEffect(() => {
    void loadAll();
    const u1 = orderService.subscribe(() => void loadAll());
    const u2 = bookingService.subscribe(() => void loadAll());
    const u3 = productService.subscribe(() => void loadAll());
    const u4 = petService.subscribe(() => void loadAll());
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [loadAll]);

  const summary = useMemo(
    () =>
      buildReportSummary({
        granularity,
        daySubRange,
        customStart,
        customEnd,
        orders,
        bookings,
        products,
        pets,
      }),
    [
      granularity,
      daySubRange,
      customStart,
      customEnd,
      orders,
      bookings,
      products,
      pets,
    ]
  );

  const periodTitle = useMemo(() => {
    if (granularity === 'day') {
      return daySubRange === '7d' ? '7 ngày gần nhất' : '30 ngày gần nhất';
    }
    if (granularity === 'week') return '8 tuần gần nhất';
    if (granularity === 'month') return '12 tháng năm 2026';
    if (granularity === 'year') return 'So sánh 2024 – 2026';
    return `${customStart} → ${customEnd}`;
  }, [granularity, daySubRange, customStart, customEnd]);

  const handleExportCsv = () => {
    exportReportToCsv(summary, periodTitle);
    setExportSuccess(true);
    window.setTimeout(() => setExportSuccess(false), 3200);
  };

  // Stacked Bar + Line Chart SVG geometry
  const chartW = 740;
  const chartH = 290;
  const padL = 52;
  const padR = 16;
  const padT = 22;
  const padB = 36;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const points = summary.points;
  const slotW = plotW / Math.max(points.length, 1);

  const maxTotal = useMemo(() => {
    const peak = Math.max(...points.map((p) => p.totalRevenue), 1);
    return Math.ceil(peak * 1.18);
  }, [points]);

  const totalLinePath = useMemo(() => {
    return points
      .map((p, idx) => {
        const x = padL + slotW * idx + slotW / 2;
        const y = padT + plotH - (p.totalRevenue / maxTotal) * plotH;
        return `${x},${y}`;
      })
      .join(' ');
  }, [points, slotW, plotH, maxTotal]);

  const profitLinePath = useMemo(() => {
    return points
      .map((p, idx) => {
        const x = padL + slotW * idx + slotW / 2;
        const y = padT + plotH - (p.grossProfit / maxTotal) * plotH;
        return `${x},${y}`;
      })
      .join(' ');
  }, [points, slotW, plotH, maxTotal]);

  // Donut Chart Breakdown
  const donutItems = useMemo(() => {
    const total = Math.max(summary.totalRevenue, 1);
    const raw = [
      {
        id: 'shop',
        label: 'Cửa hàng Phụ kiện & Dinh dưỡng',
        amount: summary.shopRevenue,
        marginText: 'Biên gộp ~38%',
        color: '#0284C7',
        barClass: 'bg-sky-600',
        pillClass: 'bg-sky-50 text-sky-700',
      },
      {
        id: 'spa',
        label: 'Spa & Grooming',
        amount: summary.spaRevenue,
        marginText: 'Biên gộp ~68%',
        color: '#0D9488',
        barClass: 'bg-teal-600',
        pillClass: 'bg-teal-50 text-teal-700',
      },
      {
        id: 'hotel',
        label: 'Khách sạn Thú cưng',
        amount: summary.hotelRevenue,
        marginText: 'Biên gộp ~72%',
        color: '#4F46E5',
        barClass: 'bg-indigo-600',
        pillClass: 'bg-indigo-50 text-indigo-700',
      },
    ];

    let accPct = 0;
    return raw.map((item) => {
      const pct = (item.amount / total) * 100;
      const startPct = accPct;
      accPct += pct;
      return { ...item, pct, startPct };
    });
  }, [summary]);

  const donutRadius = 68;
  const donutCirc = 2 * Math.PI * donutRadius;
  const activeDonut = donutItems.find((i) => i.id === hoveredDonut) ?? null;

  const topProductPeak = summary.topProducts[0]?.revenue || 1;
  const topServicePeak = summary.topServices[0]?.revenue || 1;

  // Smart X-axis tick thinning when rendering 20–31 days
  const tickStep = points.length > 16 ? Math.ceil(points.length / 8) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Trung tâm Phân tích &amp; Báo cáo</span>
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Báo cáo &amp; Thống kê Kinh doanh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Phân tích doanh thu đa chiều theo Ngày / Tuần / Tháng / Năm, đồng bộ
            trực tiếp từ Đơn hàng, Lịch hẹn và Hồ sơ Thú cưng.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Xuất báo cáo CSV</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>
            Đã tải xuống file CSV (chuẩn UTF-8 BOM mở trực tiếp bằng Excel tiếng
            Việt) cho kỳ: {periodTitle}.
          </span>
        </div>
      )}

      {/* Sticky Top Filter Bar */}
      <div className="sticky top-3 z-20 rounded-2xl border border-teal-100/90 bg-white/95 p-4 shadow-soft backdrop-blur-md">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Granularity Tabs with layoutId */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="tablist"
              aria-label="Chọn kỳ báo cáo"
              className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
            >
              {GRANULARITY_TABS.map((tab) => {
                const active = granularity === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setGranularity(tab.id);
                      setHoveredIdx(null);
                    }}
                    className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="reportGranularityTab"
                        transition={{
                          type: 'spring',
                          stiffness: 360,
                          damping: 30,
                        }}
                        className="absolute inset-0 rounded-lg bg-teal-600 shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Day Sub-range Switcher (7d / 30d) */}
            {granularity === 'day' && (
              <div className="inline-flex rounded-xl border border-teal-100 bg-teal-50/70 p-1">
                {[
                  { id: '7d' as const, label: '7 ngày' },
                  { id: '30d' as const, label: '30 ngày' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setDaySubRange(sub.id);
                      setHoveredIdx(null);
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      daySubRange === sub.id
                        ? 'bg-white text-teal-800 shadow-2xs'
                        : 'text-teal-700/80 hover:text-teal-900'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
              <CalendarRange className="h-3.5 w-3.5 text-teal-600" />
              <span>Tùy chỉnh:</span>
            </span>
            <input
              type="date"
              aria-label="Từ ngày"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              aria-label="Đến ngày"
              min={customStart}
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setGranularity('custom');
                setHoveredIdx(null);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                granularity === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* 4 Period KPI Summary Cards */}
      <section
        aria-label="Chỉ số KPI theo kỳ báo cáo"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* KPI 1: Net Revenue & Growth */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tổng Doanh thu thuần
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />+
              {summary.growthPercent.toFixed(1)}%
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatVnd(summary.totalRevenue)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Lợi nhuận gộp:{' '}
            <strong className="text-teal-700">
              {formatVnd(summary.grossProfit)}
            </strong>
          </p>
        </div>

        {/* KPI 2: Shop vs Services Split */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Cửa hàng vs Dịch vụ
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between text-xs font-bold">
            <span className="text-sky-700">
              Cửa hàng {summary.shopSharePct.toFixed(0)}%
            </span>
            <span className="text-teal-700">
              Dịch vụ {summary.serviceSharePct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              style={{ width: `${summary.shopSharePct}%` }}
              className="bg-sky-600 transition-all duration-500"
            />
            <div
              style={{ width: `${summary.serviceSharePct}%` }}
              className="bg-gradient-to-r from-teal-600 to-indigo-600 transition-all duration-500"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Cửa hàng: <strong>{formatCompactVnd(summary.shopRevenue)}</strong> •
            Spa/Hotel:{' '}
            <strong>{formatCompactVnd(summary.serviceRevenue)}</strong>
          </p>
        </div>

        {/* KPI 3: AOV & Total Customers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Giá trị TB / Đơn &amp; Lịch (AOV)
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatVnd(summary.aov)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Phục vụ{' '}
            <strong className="text-indigo-700">
              {summary.totalCustomers} lượt
            </strong>{' '}
            ({summary.totalOrders} đơn • {summary.totalBookings} lịch)
          </p>
        </div>

        {/* KPI 4: Customer Retention Rate from Pet CRM */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tỷ lệ Khách hàng quay lại
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Repeat2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-teal-700">
            {summary.retentionRate.toFixed(1)}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            <strong className="text-slate-800">
              {summary.returningPetsCount} / {summary.totalPetsCount} bé
            </strong>{' '}
            đã quay lại từ 2 lần trở lên (Pet CRM)
          </p>
        </div>
      </section>

      {/* Multi-Dimensional Charts Grid (2/3 + 1/3) */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Main Chart (2/3): Stacked Bar (Shop / Spa / Hotel) + Total Revenue & Gross Profit Lines */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft lg:col-span-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tăng trưởng Doanh thu &amp; Lợi nhuận gộp ({periodTitle})
              </h2>
              <p className="text-xs text-slate-500">
                Cột xếp chồng 3 nguồn thu kết hợp đường xu hướng tổng doanh thu
                &amp; lợi nhuận gộp.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 self-start rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 sm:self-auto">
              <TrendingUp className="h-3.5 w-3.5" />
              {points.length} mốc thời gian
            </span>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />
              Cửa hàng
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />
              Spa &amp; Grooming
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
              Khách sạn Thú cưng
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-slate-800" />
              Xu hướng Tổng thu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500" />
              Lợi nhuận gộp
            </span>
          </div>

          {/* SVG Stacked Bar + Trend Line Chart */}
          <div className="mt-4">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="h-72 w-full overflow-visible"
              role="img"
              aria-label="Biểu đồ cột xếp chồng doanh thu và lợi nhuận gộp PawPalace"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padT + plotH - ratio * plotH;
                const val = maxTotal * ratio;
                return (
                  <g key={ratio}>
                    <line
                      x1={padL}
                      x2={chartW - padR}
                      y1={y}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={ratio === 0 ? undefined : '4 4'}
                      strokeWidth={1}
                    />
                    <text
                      x={padL - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-medium"
                    >
                      {formatCompactVnd(val)}
                    </text>
                  </g>
                );
              })}

              {/* Stacked Bars */}
              {points.map((point, idx) => {
                const centerX = padL + slotW * idx + slotW / 2;
                const barW = Math.min(34, Math.max(8, slotW * 0.54));
                const barX = centerX - barW / 2;
                const isHovered = hoveredIdx === idx;

                const shopH = (point.shopRevenue / maxTotal) * plotH;
                const spaH = (point.spaRevenue / maxTotal) * plotH;
                const hotelH = (point.hotelRevenue / maxTotal) * plotH;

                const shopY = padT + plotH - shopH;
                const spaY = shopY - spaH;
                const hotelY = spaY - hotelH;

                const showTick =
                  idx % tickStep === 0 || idx === points.length - 1;

                return (
                  <g
                    key={`${granularity}-${daySubRange}-${point.key}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Hover column backdrop */}
                    <rect
                      x={padL + slotW * idx + 1}
                      y={padT}
                      width={Math.max(4, slotW - 2)}
                      height={plotH}
                      rx={8}
                      fill={isHovered ? '#F0FDFA' : 'transparent'}
                      className="transition-colors duration-150"
                    />

                    {/* Bottom Segment: Shop Revenue (Sky Cyan) */}
                    <motion.rect
                      x={barX}
                      width={barW}
                      rx={2}
                      fill="#0284C7"
                      initial={{ y: padT + plotH, height: 0 }}
                      animate={{
                        y: shopY,
                        height: Math.max(1, shopH),
                        opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(idx * 0.02, 0.3),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />

                    {/* Middle Segment: Spa Revenue (Mint Emerald) */}
                    <motion.rect
                      x={barX}
                      width={barW}
                      rx={2}
                      fill="#0D9488"
                      initial={{ y: padT + plotH, height: 0 }}
                      animate={{
                        y: spaY,
                        height: Math.max(1, spaH),
                        opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                      }}
                      transition={{
                        duration: 0.48,
                        delay: Math.min(idx * 0.02 + 0.05, 0.35),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />

                    {/* Top Segment: Hotel Revenue (Royal Indigo) */}
                    <motion.rect
                      x={barX}
                      width={barW}
                      rx={4}
                      fill="#4F46E5"
                      initial={{ y: padT + plotH, height: 0 }}
                      animate={{
                        y: hotelY,
                        height: Math.max(1, hotelH),
                        opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                      }}
                      transition={{
                        duration: 0.52,
                        delay: Math.min(idx * 0.02 + 0.1, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />

                    {/* X-Axis label */}
                    {showTick && (
                      <text
                        x={centerX}
                        y={chartH - 10}
                        textAnchor="middle"
                        className={`text-[10px] font-semibold ${
                          isHovered ? 'fill-teal-700' : 'fill-slate-500'
                        }`}
                      >
                        {point.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Overlaid Total Revenue Trend Line */}
              {points.length > 1 && (
                <motion.polyline
                  key={`total-line-${granularity}-${daySubRange}-${points.length}`}
                  points={totalLinePath}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none"
                />
              )}

              {/* Overlaid Gross Profit Dashed Trend Line */}
              {points.length > 1 && (
                <motion.polyline
                  key={`profit-line-${granularity}-${daySubRange}-${points.length}`}
                  points={profitLinePath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="pointer-events-none"
                />
              )}

              {/* Highlight Active Node */}
              {hoveredIdx !== null && points[hoveredIdx] && (
                <g className="pointer-events-none">
                  <circle
                    cx={padL + slotW * hoveredIdx + slotW / 2}
                    cy={
                      padT +
                      plotH -
                      (points[hoveredIdx].totalRevenue / maxTotal) * plotH
                    }
                    r={5}
                    fill="#FFFFFF"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                  />
                  <circle
                    cx={padL + slotW * hoveredIdx + slotW / 2}
                    cy={
                      padT +
                      plotH -
                      (points[hoveredIdx].grossProfit / maxTotal) * plotH
                    }
                    r={4.5}
                    fill="#FFFFFF"
                    stroke="#10B981"
                    strokeWidth={2.5}
                  />
                </g>
              )}
            </svg>

            {/* Interactive Detail Tooltip Panel */}
            <div className="mt-3 min-h-[62px] rounded-xl border border-teal-100 bg-[#F0FDFA]/70 px-4 py-3 text-xs">
              {hoveredIdx !== null && points[hoveredIdx] ? (
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900">
                      {points[hoveredIdx].fullLabel} •{' '}
                      <span className="text-indigo-700">
                        {points[hoveredIdx].orderCount} đơn hàng &amp;{' '}
                        {points[hoveredIdx].bookingCount} lịch hẹn
                      </span>
                    </p>
                    <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-600">
                      <span>
                        Cửa hàng:{' '}
                        <strong className="text-sky-700">
                          {formatVnd(points[hoveredIdx].shopRevenue)}
                        </strong>
                      </span>
                      <span>
                        Spa:{' '}
                        <strong className="text-teal-700">
                          {formatVnd(points[hoveredIdx].spaRevenue)}
                        </strong>
                      </span>
                      <span>
                        Khách sạn:{' '}
                        <strong className="text-indigo-700">
                          {formatVnd(points[hoveredIdx].hotelRevenue)}
                        </strong>
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      Tổng: {formatVnd(points[hoveredIdx].totalRevenue)}
                    </p>
                    <p className="font-semibold text-emerald-700">
                      Lãi gộp: {formatVnd(points[hoveredIdx].grossProfit)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-500">
                  <span>
                    Di chuột lên bất kỳ cột thời gian nào để xem phân tách chi
                    tiết 3 nguồn thu, lãi gộp và số đơn/lịch.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Chart (1/3): Donut Chart + Contribution Progress Bars */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft lg:col-span-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <PieChart className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cơ cấu &amp; Biên đóng góp
                </h2>
                <p className="text-xs text-slate-500">
                  Tỷ trọng từng mảng trong kỳ
                </p>
              </div>
            </div>

            {/* SVG Donut */}
            <div className="relative mx-auto my-5 flex h-44 w-44 items-center justify-center">
              <svg
                viewBox="0 0 170 170"
                className="h-44 w-44 -rotate-90"
                role="img"
                aria-label="Biểu đồ cơ cấu nguồn thu"
              >
                <circle
                  cx={85}
                  cy={85}
                  r={donutRadius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={20}
                />
                {donutItems.map((seg, idx) => {
                  const segLen = (seg.pct / 100) * donutCirc;
                  const offset = -(seg.startPct / 100) * donutCirc;
                  const active = hoveredDonut === seg.id;
                  return (
                    <motion.circle
                      key={`${granularity}-${seg.id}`}
                      cx={85}
                      cy={85}
                      r={donutRadius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={active ? 24 : 20}
                      strokeDasharray={`${segLen} ${donutCirc}`}
                      initial={{ strokeDashoffset: donutCirc }}
                      animate={{
                        strokeDashoffset: offset,
                        opacity: hoveredDonut === null || active ? 1 : 0.4,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: idx * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onMouseEnter={() => setHoveredDonut(seg.id)}
                      onMouseLeave={() => setHoveredDonut(null)}
                      className="cursor-pointer transition-all"
                    />
                  );
                })}
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  {activeDonut ? activeDonut.label.split(' ')[0] : 'Tổng thu'}
                </span>
                <span className="mt-0.5 text-base font-extrabold text-slate-900">
                  {activeDonut
                    ? `${activeDonut.pct.toFixed(1)}%`
                    : formatCompactVnd(summary.totalRevenue)}
                </span>
                <span className="text-[10px] font-semibold text-teal-700">
                  {activeDonut
                    ? formatCompactVnd(activeDonut.amount)
                    : 'VNĐ'}
                </span>
              </div>
            </div>

            {/* Contribution Progress Bars */}
            <div className="space-y-3.5">
              {donutItems.map((item) => {
                const active = hoveredDonut === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredDonut(item.id)}
                    onMouseLeave={() => setHoveredDonut(null)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      active
                        ? 'border-teal-300 bg-teal-50/40'
                        : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-800">
                        {item.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.pillClass}`}
                      >
                        {item.pct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                      <motion.div
                        key={`bar-${granularity}-${item.id}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${item.barClass}`}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {formatVnd(item.amount)}
                      </span>
                      <span>{item.marginText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Performance Leaderboards */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Top Sản phẩm Bán chạy nhất
                </h2>
                <p className="text-xs text-slate-500">
                  Xếp hạng theo doanh thu &amp; số lượng đã bán ({periodTitle})
                </p>
              </div>
            </div>
            <Award className="h-5 w-5 text-teal-500" />
          </div>

          <div className="space-y-3.5">
            {summary.topProducts.map((item, idx) => {
              const barWidth = Math.max(
                10,
                Math.round((item.revenue / topProductPeak) * 100)
              );
              return (
                <div
                  key={item.productId}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                        idx === 0
                          ? 'bg-teal-600 text-white'
                          : idx === 1
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/70">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {CATEGORY_LABELS[item.category]} • Đã bán{' '}
                        <strong className="text-slate-800">
                          {item.unitsSold} SP
                        </strong>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold text-teal-700">
                        {formatVnd(item.revenue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <motion.div
                      key={`tp-${granularity}-${item.productId}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.55, delay: idx * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Booked Spa Services & Hotel Rooms */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Top Dịch vụ Spa &amp; Hạng phòng Đặt nhiều nhất
                </h2>
                <p className="text-xs text-slate-500">
                  Xếp hạng lượt đặt lịch và doanh thu mang lại ({periodTitle})
                </p>
              </div>
            </div>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="space-y-3.5">
            {summary.topServices.map((srv, idx) => {
              const barWidth = Math.max(
                10,
                Math.round((srv.revenue / topServicePeak) * 100)
              );
              const isSpa = srv.type === 'spa';
              return (
                <div
                  key={srv.serviceId}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                          idx === 0
                            ? 'bg-indigo-600 text-white'
                            : idx === 1
                              ? 'bg-teal-600 text-white'
                              : 'bg-white text-slate-600 ring-1 ring-slate-200'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {srv.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                              isSpa
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {isSpa ? (
                              <Sparkles className="h-3 w-3" />
                            ) : (
                              <Home className="h-3 w-3" />
                            )}
                            {isSpa ? 'Spa & Grooming' : 'Khách sạn'}
                          </span>
                          <span className="text-slate-500">
                            <strong className="text-slate-800">
                              {srv.bookingCount} lượt đặt
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold text-indigo-700">
                        {formatVnd(srv.revenue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <motion.div
                      key={`ts-${granularity}-${srv.serviceId}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.55, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        isSpa
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                          : 'bg-gradient-to-r from-indigo-500 to-sky-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
