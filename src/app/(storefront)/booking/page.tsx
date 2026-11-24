import { Suspense } from 'react';
import { CalendarHeart } from 'lucide-react';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { BookingClient } from '@/components/storefront/BookingClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Đặt Lịch Spa Grooming & Đặt Phòng Khách Sạn Thú Cưng',
  description:
    'Đặt lịch chăm sóc Spa, cắt tỉa lông hoặc đặt phòng Khách sạn thú cưng trực tuyến tại PawPalace nhanh chóng, nhận mã xác nhận tức thì.',
  path: '/booking',
});

export default function BookingPage() {
  return (
    <>
      <section className="border-b border-teal-100 bg-gradient-to-b from-[#F0FDFA] to-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInUp>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
              <CalendarHeart className="h-3.5 w-3.5" />
              <span>Đặt lịch nhanh — Nhận mã xác nhận tức thì</span>
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Đặt lịch hẹn Chăm sóc &amp; Lưu trú
            </h1>
            <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-600 sm:text-base">
              Điền thông tin bé yêu để đội ngũ chuyên viên PawPalace phục vụ chu
              đáo nhất.
            </p>
          </FadeInUp>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
            Đang tải biểu mẫu đặt lịch...
          </div>
        }
      >
        <BookingClient />
      </Suspense>
    </>
  );
}
