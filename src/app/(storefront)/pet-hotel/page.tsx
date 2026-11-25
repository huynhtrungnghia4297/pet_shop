import { Home } from 'lucide-react';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { PetHotelClient } from '@/components/storefront/PetHotelClient';
import { buildPageMetadata, buildPetStoreJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Khách Sạn Thú Cưng 24/7 Có Camera HD & Điều Hòa Lọc Khí',
  description:
    'Dịch vụ khách sạn lưu trú cho chó mèo tại PawPalace với 3 hạng phòng Standard, VIP Suite và Camera Riêng 24/7. Ước tính chi phí lưu trú trực tiếp ngay trên web.',
  path: '/pet-hotel',
});

export default function PetHotelPage() {
  return (
    <>
      <JsonLd data={buildPetStoreJsonLd()} />

      <section className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white py-14">
        <div
          aria-hidden="true"
          className="bg-paw-dot-grid-indigo pointer-events-none absolute inset-0 opacity-30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-500/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInUp>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs ring-1 ring-indigo-200">
              <Home className="h-3.5 w-3.5" />
              <span>Khách Sạn Thú Cưng 5 Sao • Giám Sát 24/7</span>
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Khách sạn Thú cưng PawPalace
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
              Không gian nghỉ dưỡng khử khuẩn UV-C, tách biệt hoàn toàn khu chó
              và khu mèo, theo dõi trực tuyến 24/7 giúp bạn yên tâm mọi chuyến
              đi.
            </p>
          </FadeInUp>
        </div>
      </section>

      <PetHotelClient />
    </>
  );
}
