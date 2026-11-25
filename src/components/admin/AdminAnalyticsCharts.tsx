'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import { formatVnd } from '@/lib/utils';
import type { BookingDto, OrderDto } from '@/types';

interface AdminAnalyticsChartsProps {
  orders: OrderDto[];
  bookings: BookingDto[];
}

interface TrendPoint {
  label: string;
  fullLabel: string;
  orderRevenue: number;
  serviceRevenue: number;
  visits: number;
}

const BASE_7_DAYS: TrendPoint[] = [
  {
    label: 'T2',
    fullLabel: 'Thứ 2 (19/11)',
    orderRevenue: 1450000,
    serviceRevenue: 1680000,
    visits: 9,
  },
  {
    label: 'T3',
    fullLabel: 'Thứ 3 (20/11)',
    orderRevenue: 1920000,
    serviceRevenue: 2150000,
    visits: 12,
  },
  {
    label: 'T4',
    fullLabel: 'Thứ 4 (21/11)',
    orderRevenue: 1380000,
    serviceRevenue: 1840000,
    visits: 10,
  },
  {
    label: 'T5',
    fullLabel: 'Thứ 5 (22/11)',
    orderRevenue: 2260000,
    serviceRevenue: 2540000,
    visits: 14,
  },
  {
    label: 'T6',
    fullLabel: 'Thứ 6 (23/11)',
    orderRevenue: 2680000,
    serviceRevenue: 3120000,
    visits: 17,
  },
  {
    label: 'T7',
    fullLabel: 'Thứ 7 (24/11)',
    orderRevenue: 3420000,
    serviceRevenue: 4180000,
    visits: 23,
  },
  {
    label: 'CN',
    fullLabel: 'Hôm nay (25/11)',
    orderRevenue: 1850000,
    serviceRevenue: 2250000,
    visits: 15,
  },
];

const BASE_6_MONTHS: TrendPoint[] = [
  {
    label: 'T6',
    fullLabel: 'Tháng 06/2026',
    orderRevenue: 26400000,
    serviceRevenue: 31800000,
    visits: 142,
  },
  {
    label: 'T7',
    fullLabel: 'Tháng 07/2026',
    orderRevenue: 30200000,
    serviceRevenue: 35600000,
    visits: 165,
  },
  {
    label: 'T8',
    fullLabel: 'Tháng 08/2026',
    orderRevenue: 33500000,
    serviceRevenue: 38900000,
    visits: 184,
  },
  {
    label: 'T9',
    fullLabel: 'Tháng 09/2026',
    orderRevenue: 31800000,
    serviceRevenue: 41200000,
    visits: 192,
  },
  {
    label: 'T10',
    fullLabel: 'Tháng 10/2026',
    orderRevenue: 37400000,
    serviceRevenue: 45800000,
    visits: 218,
  },
  {
    label: 'T11',
    fullLabel: 'Tháng 11/2026 (Hiện tại)',
    orderRevenue: 41200000,
    serviceRevenue: 49500000,
    visits: 236,
  },
];

function formatCompactVnd(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return String(amount);
}

export function AdminAnalyticsCharts({
  orders,
  bookings,
}: AdminAnalyticsChartsProps) {
  const [range, setRange] = useState<'7d' | '6m'>('7d');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const liveMetrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const validBookings = bookings.filter((b) => b.status !== 'cancelled');

    const orderRev = validOrders.reduce((s, o) => s + o.totalAmount, 0);
    const spaRev = validBookings
      .filter((b) => b.type === 'spa')
      .reduce((s, b) => s + b.estimatedPrice, 0);
    const hotelRev = validBookings
      .filter((b) => b.type === 'hotel')
      .reduce((s, b) => s + b.estimatedPrice, 0);

    return {
      orderRev,
      spaRev,
      hotelRev,
      serviceRev: spaRev + hotelRev,
      totalTransactions: validOrders.length + validBookings.length,
    };
  }, [orders, bookings]);

  // Combine historical baseline with live service/order figures in the latest period
  const trendData = useMemo<TrendPoint[]>(() => {
    const base = range === '7d' ? BASE_7_DAYS : BASE_6_MONTHS;
    return base.map((point, index) => {
      if (index !== base.length - 1) return point;
      return {
        ...point,
        orderRevenue: point.orderRevenue + liveMetrics.orderRev,
        serviceRevenue: point.serviceRevenue + liveMetrics.serviceRev,
        visits: point.visits + liveMetrics.totalTransactions,
      };
    });
  }, [range, liveMetrics]);

  const maxRevenue = useMemo(() => {
    const peak = Math.max(
      ...trendData.map((d) => Math.max(d.orderRevenue, d.serviceRevenue, 1))
    );
    return Math.ceil(peak * 1.18);
  }, [trendData]);

  const maxVisits = useMemo(() => {
    return Math.max(...trendData.map((d) => d.visits), 1) * 1.15;
  }, [trendData]);

  const totalTrendRevenue = useMemo(
    () =>
      trendData.reduce((s, d) => s + d.orderRevenue + d.serviceRevenue, 0),
    [trendData]
  );

  const totalTrendVisits = useMemo(
    () => trendData.reduce((s, d) => s + d.visits, 0),
    [trendData]
  );

  // Donut Chart Breakdown (synced live with Spa, Hotel & Shop revenue + baseline)
  const donutSegments = useMemo(() => {
    const spaTotal = 14800000 + liveMetrics.spaRev;
    const hotelTotal = 11200000 + liveMetrics.hotelRev;
    const shopTotal = 16500000 + liveMetrics.orderRev;
    const grandTotal = spaTotal + hotelTotal + shopTotal;

    const items = [
      {
        id: 'spa',
        label: 'Spa & Grooming',
        amount: spaTotal,
        color: '#0D9488',
        dotClass: 'bg-teal-600',
        pillClass: 'bg-teal-50 text-teal-700',
      },
      {
        id: 'hotel',
        label: 'Khách sạn Thú cưng',
        amount: hotelTotal,
        color: '#4F46E5',
        dotClass: 'bg-indigo-600',
        pillClass: 'bg-indigo-50 text-indigo-700',
      },
      {
        id: 'shop',
        label: 'Cửa hàng Phụ kiện & Dinh dưỡng',
        amount: shopTotal,
        color: '#0284C7',
        dotClass: 'bg-sky-600',
        pillClass: 'bg-sky-50 text-sky-700',
      },
    ];

    let cumulativePct = 0;
    return {
      grandTotal,
      items: items.map((item) => {
        const pct = grandTotal > 0 ? (item.amount / grandTotal) * 100 : 0;
        const startPct = cumulativePct;
        cumulativePct += pct;
        return {
          ...item,
          pct,
          startPct,
        };
      }),
    };
  }, [liveMetrics]);

  // SVG Geometry for Trend Chart
  const chartW = 620;
  const chartH = 240;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 34;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const groupW = plotW / trendData.length;

  const visitPolylinePoints = trendData
    .map((point, idx) => {
      const cx = padL + groupW * idx + groupW / 2;
      const cy = padT + plotH - (point.visits / maxVisits) * plotH;
      return `${cx},${cy}`;
    })
    .join(' ');

  // SVG Geometry for Donut Chart
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const activeDonutItem =
    donutSegments.items.find((i) => i.id === hoveredSegment) ?? null;

  return (
    <section
      aria-labelledby="analytics-heading"
      className="grid gap-6 lg:grid-cols-12"
    >
      {/* Left: Dual Bar + Visits Line Chart (7 cols) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft lg:col-span-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <BarChart3 className="h-4.5 w-4.5" />
              </span>
              <h2
                id="analytics-heading"
                className="text-base font-bold text-slate-900"
              >
                Xu hướng Doanh thu &amp; Lượt khách
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tổng kỳ:{' '}
              <strong className="text-teal-700">
                {formatVnd(totalTrendRevenue)}
              </strong>{' '}
              •{' '}
              <strong className="text-sky-700">{totalTrendVisits} lượt</strong>
            </p>
          </div>

          {/* 7d / 6m Mode Switcher */}
          <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { id: '7d' as const, label: '7 ngày qua' },
              { id: '6m' as const, label: '6 tháng qua' },
            ].map((tab) => {
              const active = range === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setRange(tab.id);
                    setHoveredIdx(null);
                  }}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="analyticsRangeTab"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="absolute inset-0 rounded-lg bg-teal-600 shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />
            Doanh thu Cửa hàng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
            Spa &amp; Khách sạn
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500 ring-2 ring-sky-200" />
            Lượt khách sử dụng
          </span>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="h-60 w-full overflow-visible"
            role="img"
            aria-label="Biểu đồ doanh thu và lượt khách PawPalace"
          >
            {/* Horizontal Grid Lines + Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padT + plotH - ratio * plotH;
              const value = maxRevenue * ratio;
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
                    {formatCompactVnd(value)}
                  </text>
                </g>
              );
            })}

            {/* Grouped Bars per Period */}
            {trendData.map((point, idx) => {
              const centerX = padL + groupW * idx + groupW / 2;
              const barW = Math.min(20, groupW * 0.28);
              const gap = 4;

              const orderH = (point.orderRevenue / maxRevenue) * plotH;
              const serviceH = (point.serviceRevenue / maxRevenue) * plotH;
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={`${range}-${point.label}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {/* Hover column highlight */}
                  <rect
                    x={padL + groupW * idx + 4}
                    y={padT}
                    width={groupW - 8}
                    height={plotH}
                    rx={10}
                    fill={isHovered ? '#F0FDFA' : 'transparent'}
                    className="transition-colors duration-150"
                  />

                  {/* Order Revenue Bar (Mint Emerald) */}
                  <motion.rect
                    key={`ord-${range}-${idx}-${point.orderRevenue}`}
                    x={centerX - barW - gap / 2}
                    width={barW}
                    rx={5}
                    fill="#0D9488"
                    initial={{ y: padT + plotH, height: 0 }}
                    animate={{
                      y: padT + plotH - orderH,
                      height: Math.max(2, orderH),
                      opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />

                  {/* Service Revenue Bar (Royal Indigo) */}
                  <motion.rect
                    key={`srv-${range}-${idx}-${point.serviceRevenue}`}
                    x={centerX + gap / 2}
                    width={barW}
                    rx={5}
                    fill="#4F46E5"
                    initial={{ y: padT + plotH, height: 0 }}
                    animate={{
                      y: padT + plotH - serviceH,
                      height: Math.max(2, serviceH),
                      opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.04 + 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />

                  {/* X-Axis Label */}
                  <text
                    x={centerX}
                    y={chartH - 10}
                    textAnchor="middle"
                    className={`text-[11px] font-semibold ${
                      isHovered ? 'fill-teal-700' : 'fill-slate-500'
                    }`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}

            {/* Visits Trend Line (Sky Cyan) */}
            <motion.polyline
              key={`line-${range}`}
              points={visitPolylinePoints}
              fill="none"
              stroke="#0284C7"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none"
            />

            {/* Visit Line Nodes */}
            {trendData.map((point, idx) => {
              const cx = padL + groupW * idx + groupW / 2;
              const cy = padT + plotH - (point.visits / maxVisits) * plotH;
              const isHovered = hoveredIdx === idx;
              return (
                <circle
                  key={`dot-${range}-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth={2.25}
                  className="pointer-events-none transition-all duration-150"
                />
              );
            })}
          </svg>

          {/* Interactive Tooltip Bar (always crisp & never clipped on mobile) */}
          <div className="mt-3 min-h-[54px] rounded-xl border border-teal-100/80 bg-[#F0FDFA]/70 px-4 py-2.5 text-xs">
            {hoveredIdx !== null && trendData[hoveredIdx] ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">
                    {trendData[hoveredIdx].fullLabel}
                  </p>
                  <p className="text-slate-600">
                    Cửa hàng:{' '}
                    <strong className="text-teal-700">
                      {formatVnd(trendData[hoveredIdx].orderRevenue)}
                    </strong>{' '}
                    • Spa &amp; Hotel:{' '}
                    <strong className="text-indigo-700">
                      {formatVnd(trendData[hoveredIdx].serviceRevenue)}
                    </strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-bold text-sky-700 shadow-2xs">
                    <Users className="h-3.5 w-3.5" />
                    {trendData[hoveredIdx].visits} lượt
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {formatVnd(
                      trendData[hoveredIdx].orderRevenue +
                        trendData[hoveredIdx].serviceRevenue
                    )}
                  </span>
                </div>
              </div>
            ) : (
            <div className="flex items-center justify-between text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Di chuột lên từng cột để xem chi tiết doanh thu &amp; số lượt
                khách.
              </span>
              <Link
                href="/admin/reports"
                className="inline-flex shrink-0 items-center gap-1 font-bold text-indigo-600 transition-colors hover:text-indigo-800"
              >
                <span>Xem báo cáo chi tiết</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: SVG Animated Donut Chart (5 cols) */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft lg:col-span-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <PieChart className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cơ cấu Doanh thu theo Mảng
                </h2>
                <p className="text-xs text-slate-500">
                  Phân bổ tỷ trọng Spa, Khách sạn &amp; Cửa hàng
                </p>
              </div>
            </div>
            <Link
              href="/admin/reports"
              className="hidden shrink-0 items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 sm:inline-flex"
            >
              <span>Xem báo cáo chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            {/* SVG Donut Ring */}
            <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 180 180"
                className="h-44 w-44 -rotate-90"
                role="img"
                aria-label="Biểu đồ cơ cấu doanh thu PawPalace"
              >
                <circle
                  cx={90}
                  cy={90}
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={22}
                />
                {donutSegments.items.map((seg, idx) => {
                  const segLength = (seg.pct / 100) * circumference;
                  const dashOffset = -(seg.startPct / 100) * circumference;
                  const isActive = hoveredSegment === seg.id;
                  return (
                    <motion.circle
                      key={seg.id}
                      cx={90}
                      cy={90}
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isActive ? 26 : 22}
                      strokeDasharray={`${segLength} ${circumference}`}
                      strokeLinecap="butt"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{
                        strokeDashoffset: dashOffset,
                        opacity:
                          hoveredSegment === null || isActive ? 1 : 0.4,
                      }}
                      transition={{
                        duration: 0.75,
                        delay: idx * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onMouseEnter={() => setHoveredSegment(seg.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className="cursor-pointer transition-all duration-150"
                    />
                  );
                })}
              </svg>

              {/* Center Readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {activeDonutItem ? activeDonutItem.label.split(' ')[0] : 'Tổng cộng'}
                </span>
                <span className="mt-0.5 text-base font-extrabold text-slate-900">
                  {activeDonutItem
                    ? `${activeDonutItem.pct.toFixed(1)}%`
                    : formatCompactVnd(donutSegments.grandTotal)}
                </span>
                <span className="text-[10px] font-medium text-teal-700">
                  {activeDonutItem
                    ? formatCompactVnd(activeDonutItem.amount)
                    : 'VNĐ'}
                </span>
              </div>
            </div>

            {/* Interactive Breakdown Legend */}
            <div className="w-full flex-1 space-y-2.5">
              {donutSegments.items.map((seg) => {
                const isActive = hoveredSegment === seg.id;
                return (
                  <div
                    key={seg.id}
                    onMouseEnter={() => setHoveredSegment(seg.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      isActive
                        ? 'border-teal-300 bg-teal-50/50 shadow-2xs'
                        : 'border-slate-100 bg-slate-50/60 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${seg.dotClass}`}
                        />
                        <span className="line-clamp-1">{seg.label}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${seg.pillClass}`}
                      >
                        {seg.pct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="mt-1 pl-4.5 text-xs font-semibold text-slate-600">
                      {formatVnd(seg.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
