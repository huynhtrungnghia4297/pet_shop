import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarHeart,
  Camera,
  CheckCircle2,
  Home,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  FadeInUp,
  ScaleOnHover,
  StaggerContainer,
  StaggerItem,
} from '@/components/motion/MotionPrimitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { FeaturedProductsSection } from '@/components/storefront/FeaturedProductsSection';
import { CUSTOMER_REVIEWS } from '@/data/seedData';
import { buildPageMetadata, buildPetStoreJsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'PawPalace — Spa Thú Cưng, Khách Sạn 24/7 & Cửa Hàng Dinh Dưỡng',
  description:
    'Hệ thống chăm sóc thú cưng chuẩn y khoa PawPalace: Dịch vụ Spa & Grooming thảo mộc, Khách sạn thú cưng Camera 24/7 và Cửa hàng thức ăn, phụ kiện chính hãng.',
  path: '/',
});

const CORE_SERVICES = [
  {
    icon: Sparkles,
    badge: 'Chuẩn Spa Hữu Cơ',
    title: 'Spa & Grooming Nghệ Thuật',
    description:
      'Tắm vệ sinh 10 bước bằng sữa tắm thảo mộc độ pH 6.8, cắt tỉa tạo kiểu bởi Stylist chuyên nghiệp cùng khu vực riêng biệt cho chó và mèo.',
    href: '/services',
    cta: 'Xem bảng giá Spa',
    accentBg: 'bg-teal-50 text-teal-700',
    iconBg: 'bg-teal-600 text-white',
    image:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Dịch vụ tắm Spa và Grooming cho thú cưng tại PawPalace',
  },
  {
    icon: Home,
    badge: 'Giám Sát Camera 24/7',
    title: 'Khách Sạn Thú Cưng 24/7',
    description:
      'Phòng kính điều hòa lọc khí HEPA, tách biệt khu chó và mèo, thực đơn dinh dưỡng theo yêu cầu và camera HD quan sát bé mọi lúc.',
    href: '/pet-hotel',
    cta: 'Tính phí lưu trú',
    accentBg: 'bg-indigo-50 text-indigo-700',
    iconBg: 'bg-indigo-600 text-white',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Không gian khách sạn thú cưng sạch sẽ tiện nghi 24/7 tại PawPalace',
  },
  {
    icon: ShoppingBag,
    badge: '100% Chính Hãng',
    title: 'Cửa Hàng Phụ Kiện & Dinh Dưỡng',
    description:
      'Hạt dinh dưỡng, pate tươi, sữa tắm hữu cơ, áo hoodie và đồ chơi thông minh tuyển chọn kỹ lưỡng, giao nhanh tận nhà.',
    href: '/shop',
    cta: 'Khám phá cửa hàng',
    accentBg: 'bg-sky-50 text-sky-700',
    iconBg: 'bg-sky-600 text-white',
    image:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cửa hàng thức ăn dinh dưỡng và phụ kiện thú cưng PawPalace',
  },
];

const QUALITY_COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: 'Tiêu Chuẩn Vệ Sinh Y Khoa',
    description:
      '100% dụng cụ kéo, tông đơ, khăn tắm và phòng lưu trú được khử khuẩn tia UV-C sau mỗi lượt khách.',
  },
  {
    icon: Camera,
    title: 'Camera Giám Sát 24/7',
    description:
      'Ba mẹ dễ dàng theo dõi lịch ăn, giấc ngủ và giờ vui chơi của bé qua tài khoản Camera Full HD riêng.',
  },
  {
    icon: CheckCircle2,
    title: 'Không Gian Tách Biệt Chó & Mèo',
    description:
      'Thiết kế khu vực riêng biệt giảm tiếng ồn, loại bỏ hoàn toàn tình trạng lo âu cho các bé mèo nhạy cảm.',
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildPetStoreJsonLd()} />

      {/* HERO SECTION: Strict 2-column split (Text & CTAs completely separated from Image Frame) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFA] via-[#F8FAFC] to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Messaging & CTAs */}
            <FadeInUp className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Chăm sóc thú cưng chuẩn y khoa &amp; tận tâm</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Ngôi nhà thứ hai{' '}
                <span className="bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">
                  tươi mới &amp; an toàn
                </span>{' '}
                cho thú cưng của bạn
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                PawPalace kết hợp Spa thảo mộc hữu cơ, Khách sạn thú cưng Camera
                24/7 và Cửa hàng dinh dưỡng chính hãng — nơi mỗi bé chó mèo đều
                được nâng niu như thành viên trong gia đình.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md"
                >
                  <CalendarHeart className="h-4.5 w-4.5" />
                  <span>Đặt lịch chăm sóc</span>
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-6 py-3.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Khám phá cửa hàng</span>
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-teal-100 pt-6">
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Khách hàng hài lòng
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-slate-900">
                    4.9/5
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Bé được chăm sóc
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-teal-700">
                    12.000+
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Giám sát khách sạn
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-indigo-600">
                    24/7
                  </dd>
                </div>
              </dl>
            </FadeInUp>

            {/* Right Column: Clean Rounded Image Frame Completely Separate from Text */}
            <FadeInUp delay={0.12} className="lg:col-span-6">
              <div className="rounded-3xl border border-teal-100 bg-white p-3 shadow-card">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-teal-50">
                  <Image
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=85"
                    alt="Chú chó khỏe mạnh và hạnh phúc tại trung tâm chăm sóc thú cưng PawPalace"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-[#F0FDFA] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-xs">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Khử khuẩn UV-C
                      </p>
                      <p className="text-[11px] text-slate-600">
                        An toàn tuyệt đối cho da lông
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-xs">
                      <Camera className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Camera Full HD
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Xem trực tiếp bé mọi lúc
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 3 CORE SERVICE BLOCKS */}
      <section aria-labelledby="core-services-heading" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-sky-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
              Hệ sinh thái toàn diện
            </span>
            <h2
              id="core-services-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              3 Trụ cột chăm sóc tại PawPalace
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Mọi nhu cầu làm đẹp, nghỉ dưỡng và dinh dưỡng hàng ngày của thú
              cưng đều được chuẩn hóa tại một địa điểm duy nhất.
            </p>
          </FadeInUp>

          <StaggerContainer className="mt-12 grid gap-8 md:grid-cols-3">
            {CORE_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <StaggerItem key={service.title}>
                  <ScaleOnHover className="h-full">
                    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft transition-shadow hover:border-teal-200 hover:shadow-card">
                      {/* Image separated cleanly from text */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={service.image}
                          alt={service.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${service.iconBg}`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${service.accentBg}`}
                          >
                            {service.badge}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-900">
                          {service.title}
                        </h3>
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">
                          {service.description}
                        </p>

                        <Link
                          href={service.href}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
                        >
                          <span>{service.cta}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  </ScaleOnHover>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* FEATURED PRODUCTS (Synced live with Admin isPublished) */}
      <FeaturedProductsSection />

      {/* QUALITY COMMITMENTS & CUSTOMER REVIEWS */}
      <section
        aria-labelledby="trust-reviews-heading"
        className="bg-gradient-to-b from-[#EFF6FF]/60 to-[#F0FDFA]/70 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Cam kết &amp; Đánh giá
            </span>
            <h2
              id="trust-reviews-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              Vì sao hơn 12.000 ba mẹ tin chọn PawPalace?
            </h2>
          </FadeInUp>

          {/* Commitments */}
          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3">
            {QUALITY_COMMITMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="h-full rounded-2xl border border-white bg-white/90 p-6 shadow-soft">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Reviews */}
          <StaggerContainer className="mt-10 grid gap-6 md:grid-cols-3">
            {CUSTOMER_REVIEWS.map((review) => (
              <StaggerItem key={review.id}>
                <article className="flex h-full flex-col rounded-2xl border border-teal-100/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-teal-500">
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-4 w-4 fill-teal-500 text-teal-500"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                    “{review.comment}”
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm font-bold text-slate-900">
                      {review.author}
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.petInfo} •{' '}
                      <span className="font-medium text-teal-700">
                        {review.serviceUsed}
                      </span>
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Clean Split Bottom CTA Banner (No overlay on images) */}
          <FadeInUp className="mt-16 rounded-3xl border border-teal-200/80 bg-white p-8 shadow-card sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Sẵn sàng dành tặng bé một buổi Spa thư giãn?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Đặt lịch trực tuyến trong 30 giây, không cần chờ đợi và được
                  tư vấn miễn phí theo giống loài &amp; tình trạng da lông.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/booking?type=spa"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  <span>Đặt lịch Spa ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pet-hotel"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  <span>Xem phòng Khách sạn</span>
                </Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
