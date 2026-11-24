import { Sparkles } from 'lucide-react';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { SpaServicesClient } from '@/components/storefront/SpaServicesClient';
import { buildPageMetadata, buildPetStoreJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Dịch Vụ Spa & Grooming Chó Mèo Minh Bạch Giá Theo Cân Nặng',
  description:
    'Tắm vệ sinh toàn diện, cắt tỉa lông nghệ thuật, cắt mài móng vệ sinh tai và dưỡng lông trị liệu thảo mộc cho chó mèo tại PawPalace.',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={buildPetStoreJsonLd()} />

      <section className="border-b border-teal-100 bg-gradient-to-b from-[#F0FDFA] to-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInUp>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-2xs ring-1 ring-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Spa Thảo Mộc &amp; Grooming Chuẩn Quốc Tế</span>
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Dịch vụ Chăm sóc &amp; Spa Thú cưng
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
              Chọn đối tượng Chó hoặc Mèo để xem quy trình chăm sóc chi tiết và
              bảng giá minh bạch theo từng hạng cân.
            </p>
          </FadeInUp>
        </div>
      </section>

      <SpaServicesClient />
    </>
  );
}
