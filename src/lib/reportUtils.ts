import { HOTEL_ROOMS, SPA_SERVICES } from '@/data/seedData';
import type {
  BookingDto,
  OrderDto,
  PetProfileDto,
  ProductDto,
} from '@/types';

export type ReportGranularity = 'day' | 'week' | 'month' | 'year' | 'custom';
export type DaySubRange = '7d' | '30d';

export interface ReportTimePoint {
  key: string;
  label: string;
  fullLabel: string;
  shopRevenue: number;
  spaRevenue: number;
  hotelRevenue: number;
  totalRevenue: number;
  grossProfit: number;
  orderCount: number;
  bookingCount: number;
  totalCustomers: number;
}

export interface TopProductPerformance {
  productId: string;
  name: string;
  imageUrl: string;
  category: ProductDto['category'];
  unitsSold: number;
  revenue: number;
}

export interface TopServicePerformance {
  serviceId: string;
  name: string;
  type: 'spa' | 'hotel';
  bookingCount: number;
  revenue: number;
}

export interface ReportSummary {
  points: ReportTimePoint[];
  totalRevenue: number;
  grossProfit: number;
  growthPercent: number;
  shopRevenue: number;
  spaRevenue: number;
  hotelRevenue: number;
  serviceRevenue: number;
  shopSharePct: number;
  serviceSharePct: number;
  totalOrders: number;
  totalBookings: number;
  totalCustomers: number;
  aov: number;
  retentionRate: number;
  returningPetsCount: number;
  totalPetsCount: number;
  topProducts: TopProductPerformance[];
  topServices: TopServicePerformance[];
}

// Deterministic pseudo-variation for smooth, realistic historical baselines
function wave(seed: number, min: number, max: number): number {
  const s = Math.sin(seed * 1.73 + 0.5) * 0.5 + 0.5;
  return Math.round(min + s * (max - min));
}

function calcGrossProfit(shop: number, spa: number, hotel: number): number {
  // Typical pet business gross margins: Shop ~38%, Spa ~68%, Pet Hotel ~72%
  return Math.round(shop * 0.38 + spa * 0.68 + hotel * 0.72);
}

function makePoint(
  key: string,
  label: string,
  fullLabel: string,
  shopRevenue: number,
  spaRevenue: number,
  hotelRevenue: number,
  orderCount: number,
  bookingCount: number
): ReportTimePoint {
  const totalRevenue = shopRevenue + spaRevenue + hotelRevenue;
  return {
    key,
    label,
    fullLabel,
    shopRevenue,
    spaRevenue,
    hotelRevenue,
    totalRevenue,
    grossProfit: calcGrossProfit(shopRevenue, spaRevenue, hotelRevenue),
    orderCount,
    bookingCount,
    totalCustomers: orderCount + bookingCount,
  };
}

export function buildReportSummary(params: {
  granularity: ReportGranularity;
  daySubRange: DaySubRange;
  customStart: string;
  customEnd: string;
  orders: OrderDto[];
  bookings: BookingDto[];
  products: ProductDto[];
  pets: PetProfileDto[];
}): ReportSummary {
  const {
    granularity,
    daySubRange,
    customStart,
    customEnd,
    orders,
    bookings,
    products,
    pets,
  } = params;

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const validBookings = bookings.filter((b) => b.status !== 'cancelled');

  const liveShopRev = validOrders.reduce((s, o) => s + o.totalAmount, 0);
  const liveSpaBookings = validBookings.filter((b) => b.type === 'spa');
  const liveHotelBookings = validBookings.filter((b) => b.type === 'hotel');
  const liveSpaRev = liveSpaBookings.reduce((s, b) => s + b.estimatedPrice, 0);
  const liveHotelRev = liveHotelBookings.reduce(
    (s, b) => s + b.estimatedPrice,
    0
  );

  let points: ReportTimePoint[] = [];
  let growthPercent = 14.6;

  if (granularity === 'day') {
    const count = daySubRange === '7d' ? 7 : 30;
    const anchor = new Date('2026-11-25T00:00:00');
    growthPercent = daySubRange === '7d' ? 16.4 : 18.9;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const mult = isWeekend ? 1.38 : 1.0;

      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${d.getFullYear()}-${mm}-${dd}`;
      const shortLabel = `${dd}/${mm}`;
      const fullLabel = `Ngày ${dd}/${mm}/${d.getFullYear()}`;

      let shop = Math.round(wave(i + 11, 1200000, 2600000) * mult);
      let spa = Math.round(wave(i + 29, 980000, 2100000) * mult);
      let hotel = Math.round(wave(i + 47, 740000, 1750000) * mult);
      let ordCnt = Math.round(wave(i + 3, 4, 10) * mult);
      let bkCnt = Math.round(wave(i + 7, 5, 11) * mult);

      // Fold live orders & bookings into the latest day so live edits immediately reflect
      if (i === 0) {
        shop += liveShopRev;
        spa += liveSpaRev;
        hotel += liveHotelRev;
        ordCnt += validOrders.length;
        bkCnt += validBookings.length;
      }

      points.push(
        makePoint(key, shortLabel, fullLabel, shop, spa, hotel, ordCnt, bkCnt)
      );
    }
  } else if (granularity === 'week') {
    growthPercent = 12.8;
    for (let w = 1; w <= 8; w++) {
      const trendBoost = 1 + (w - 1) * 0.045;
      let shop = Math.round(wave(w + 5, 11500000, 15800000) * trendBoost);
      let spa = Math.round(wave(w + 17, 10200000, 13900000) * trendBoost);
      let hotel = Math.round(wave(w + 31, 8200000, 11800000) * trendBoost);
      let ordCnt = Math.round(wave(w + 2, 28, 44) * trendBoost);
      let bkCnt = Math.round(wave(w + 9, 32, 49) * trendBoost);

      if (w === 8) {
        shop += liveShopRev;
        spa += liveSpaRev;
        hotel += liveHotelRev;
        ordCnt += validOrders.length;
        bkCnt += validBookings.length;
      }

      points.push(
        makePoint(
          `W${w}`,
          `Tuần ${w}`,
          `Tuần ${w} (8 tuần gần nhất)`,
          shop,
          spa,
          hotel,
          ordCnt,
          bkCnt
        )
      );
    }
  } else if (granularity === 'month') {
    growthPercent = 21.3;
    const seasonalFactors = [
      1.18, 1.26, 0.94, 0.98, 1.05, 1.12, 1.16, 1.1, 1.08, 1.15, 1.22, 1.32,
    ];
    for (let m = 1; m <= 12; m++) {
      const sf = seasonalFactors[m - 1];
      let shop = Math.round(wave(m + 10, 32000000, 42000000) * sf);
      let spa = Math.round(wave(m + 22, 28000000, 37000000) * sf);
      let hotel = Math.round(wave(m + 35, 22000000, 31000000) * sf);
      let ordCnt = Math.round(wave(m + 4, 88, 128) * sf);
      let bkCnt = Math.round(wave(m + 8, 96, 142) * sf);

      // Fold live activity into current month (Tháng 11)
      if (m === 11) {
        shop += liveShopRev;
        spa += liveSpaRev;
        hotel += liveHotelRev;
        ordCnt += validOrders.length;
        bkCnt += validBookings.length;
      }

      points.push(
        makePoint(
          `2026-${String(m).padStart(2, '0')}`,
          `T${m}`,
          `Tháng ${String(m).padStart(2, '0')}/2026`,
          shop,
          spa,
          hotel,
          ordCnt,
          bkCnt
        )
      );
    }
  } else if (granularity === 'year') {
    growthPercent = 34.2;
    const yearlyBase = [
      {
        year: '2024',
        shop: 318000000,
        spa: 274000000,
        hotel: 205000000,
        orders: 940,
        bookings: 1080,
      },
      {
        year: '2025',
        shop: 428000000,
        spa: 382000000,
        hotel: 298000000,
        orders: 1290,
        bookings: 1475,
      },
      {
        year: '2026',
        shop: 545000000 + liveShopRev,
        spa: 492000000 + liveSpaRev,
        hotel: 396000000 + liveHotelRev,
        orders: 1640 + validOrders.length,
        bookings: 1890 + validBookings.length,
      },
    ];

    points = yearlyBase.map((y) =>
      makePoint(
        y.year,
        `Năm ${y.year}`,
        `Tổng kết Năm ${y.year}`,
        y.shop,
        y.spa,
        y.hotel,
        y.orders,
        y.bookings
      )
    );
  } else {
    // Custom date range
    growthPercent = 15.2;
    const start = new Date(customStart || '2026-11-15');
    const end = new Date(customEnd || '2026-11-25');
    const safeEnd = end >= start ? end : start;
    const totalDays = Math.min(
      31,
      Math.max(
        1,
        Math.ceil(
          (safeEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      )
    );

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${d.getFullYear()}-${mm}-${dd}`;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const mult = isWeekend ? 1.32 : 1.0;

      let shop = Math.round(wave(d.getDate() + i * 3, 1250000, 2450000) * mult);
      let spa = Math.round(wave(d.getDate() + i * 7, 1050000, 2050000) * mult);
      let hotel = Math.round(
        wave(d.getDate() + i * 11, 820000, 1680000) * mult
      );
      let ordCnt = Math.round(wave(i + 4, 4, 9) * mult);
      let bkCnt = Math.round(wave(i + 8, 5, 10) * mult);

      // Include live orders/bookings on the last bucket of custom range
      if (i === totalDays - 1) {
        shop += liveShopRev;
        spa += liveSpaRev;
        hotel += liveHotelRev;
        ordCnt += validOrders.length;
        bkCnt += validBookings.length;
      }

      points.push(
        makePoint(
          key,
          `${dd}/${mm}`,
          `Ngày ${dd}/${mm}/${d.getFullYear()}`,
          shop,
          spa,
          hotel,
          ordCnt,
          bkCnt
        )
      );
    }
  }

  const shopRevenue = points.reduce((s, p) => s + p.shopRevenue, 0);
  const spaRevenue = points.reduce((s, p) => s + p.spaRevenue, 0);
  const hotelRevenue = points.reduce((s, p) => s + p.hotelRevenue, 0);
  const serviceRevenue = spaRevenue + hotelRevenue;
  const totalRevenue = shopRevenue + serviceRevenue;
  const grossProfit = points.reduce((s, p) => s + p.grossProfit, 0);
  const totalOrders = points.reduce((s, p) => s + p.orderCount, 0);
  const totalBookings = points.reduce((s, p) => s + p.bookingCount, 0);
  const totalCustomers = totalOrders + totalBookings;
  const aov = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  const shopSharePct = totalRevenue > 0 ? (shopRevenue / totalRevenue) * 100 : 0;
  const serviceSharePct =
    totalRevenue > 0 ? (serviceRevenue / totalRevenue) * 100 : 0;

  // Pet CRM Retention Rate (pets with visitCount >= 2 / total pets)
  const totalPetsCount = pets.length;
  const returningPetsCount = pets.filter((p) => p.visitCount >= 2).length;
  const retentionRate =
    totalPetsCount > 0 ? (returningPetsCount / totalPetsCount) * 100 : 0;

  // Scale factor for ranking tables based on period width
  const periodFactor =
    granularity === 'year'
      ? 14
      : granularity === 'month'
        ? 8
        : granularity === 'week'
          ? 3
          : granularity === 'day' && daySubRange === '30d'
            ? 2.2
            : 1;

  // Top Selling Products (live orders + baseline mapped to productService catalog)
  const productSalesMap = new Map<string, { units: number; revenue: number }>();

  products.slice(0, 8).forEach((prod, idx) => {
    const baseUnits = Math.max(
      3,
      Math.round((18 - idx * 1.8) * periodFactor)
    );
    productSalesMap.set(prod.id, {
      units: baseUnits,
      revenue: baseUnits * prod.price,
    });
  });

  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const prev = productSalesMap.get(item.productId) ?? {
        units: 0,
        revenue: 0,
      };
      productSalesMap.set(item.productId, {
        units: prev.units + item.quantity,
        revenue: prev.revenue + item.unitPrice * item.quantity,
      });
    });
  });

  const topProducts: TopProductPerformance[] = Array.from(
    productSalesMap.entries()
  )
    .map(([productId, stats]) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return null;
      return {
        productId: prod.id,
        name: prod.name,
        imageUrl: prod.imageUrl,
        category: prod.category,
        unitsSold: stats.units,
        revenue: stats.revenue,
      };
    })
    .filter((item): item is TopProductPerformance => Boolean(item))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Spa Services & Hotel Rooms (live bookings + baseline)
  const serviceMap = new Map<
    string,
    { name: string; type: 'spa' | 'hotel'; count: number; revenue: number }
  >();

  SPA_SERVICES.slice(0, 4).forEach((pkg, idx) => {
    const count = Math.max(4, Math.round((22 - idx * 3.5) * periodFactor));
    const avgPrice = pkg.tiers[1]?.price || pkg.tiers[0].price;
    serviceMap.set(pkg.id, {
      name: pkg.name,
      type: 'spa',
      count,
      revenue: count * avgPrice,
    });
  });

  HOTEL_ROOMS.forEach((room, idx) => {
    const count = Math.max(3, Math.round((14 - idx * 2) * periodFactor));
    serviceMap.set(room.id, {
      name: room.name,
      type: 'hotel',
      count,
      revenue: count * room.pricePerNight * 2,
    });
  });

  validBookings.forEach((bk) => {
    const prev = serviceMap.get(bk.serviceId) ?? {
      name: bk.serviceName,
      type: bk.type,
      count: 0,
      revenue: 0,
    };
    serviceMap.set(bk.serviceId, {
      ...prev,
      count: prev.count + 1,
      revenue: prev.revenue + bk.estimatedPrice,
    });
  });

  const topServices: TopServicePerformance[] = Array.from(serviceMap.entries())
    .map(([serviceId, stats]) => ({
      serviceId,
      name: stats.name,
      type: stats.type,
      bookingCount: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    points,
    totalRevenue,
    grossProfit,
    growthPercent,
    shopRevenue,
    spaRevenue,
    hotelRevenue,
    serviceRevenue,
    shopSharePct,
    serviceSharePct,
    totalOrders,
    totalBookings,
    totalCustomers,
    aov,
    retentionRate,
    returningPetsCount,
    totalPetsCount,
    topProducts,
    topServices,
  };
}

/**
 * Generates and downloads an Excel-compatible UTF-8 BOM CSV file in Vietnamese
 */
export function exportReportToCsv(
  summary: ReportSummary,
  granularityLabel: string
): void {
  const headers = [
    'Mốc thời gian',
    'Doanh thu Cửa hàng (VNĐ)',
    'Doanh thu Spa & Grooming (VNĐ)',
    'Doanh thu Khách sạn Thú cưng (VNĐ)',
    'Tổng Doanh thu (VNĐ)',
    'Lợi nhuận gộp ước tính (VNĐ)',
    'Số đơn hàng',
    'Số lịch hẹn',
    'Tổng lượt khách',
  ];

  const escapeCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = summary.points.map((p) =>
    [
      p.fullLabel,
      p.shopRevenue,
      p.spaRevenue,
      p.hotelRevenue,
      p.totalRevenue,
      p.grossProfit,
      p.orderCount,
      p.bookingCount,
      p.totalCustomers,
    ]
      .map(escapeCell)
      .join(',')
  );

  const footer = [
    `TỔNG CỘNG (${granularityLabel})`,
    summary.shopRevenue,
    summary.spaRevenue,
    summary.hotelRevenue,
    summary.totalRevenue,
    summary.grossProfit,
    summary.totalOrders,
    summary.totalBookings,
    summary.totalCustomers,
  ]
    .map(escapeCell)
    .join(',');

  // UTF-8 BOM (\uFEFF) ensures Vietnamese accents display properly in Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows, footer].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `PawPalace-BaoCao-DoanhThu-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
