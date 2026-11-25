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
  Wind,
} from 'lucide-react';
import {
  AnimatedCounter,
  FadeInUp,
  Floating3DElement,
  ShimmerText,
  StaggerContainer,
  StaggerItem,
  Tilt3DCard,
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
    accentBg: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/70',
    iconBg:
      'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25',
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
    accentBg: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70',
    iconBg:
      'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/25',
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
    accentBg: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70',
    iconBg:
      'bg-gradient-to-br from-sky-500 to-teal-600 text-white shadow-md shadow-sky-500/25',
    image:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cửa hàng thức ăn dinh dưỡng và phụ kiện thú cưng PawPalace',
  },
];

const QUALITY_COMMITMENTS = [
  {
    icon: ShieldCheck,
    iconBg:
      'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20',
    title: 'Tiêu Chuẩn Vệ Sinh Y Khoa',
    description:
      '100% dụng cụ kéo, tông đơ, khăn tắm và phòng lưu trú được khử khuẩn tia UV-C sau mỗi lượt khách.',
  },
  {
    icon: Camera,
    iconBg:
      'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20',
    title: 'Camera Giám Sát 24/7',
    description:
      'Ba mẹ dễ dàng theo dõi lịch ăn, giấc ngủ và giờ vui chơi của bé qua tài khoản Camera Full HD riêng.',
  },
  {
    icon: CheckCircle2,
    iconBg:
      'bg-gradient-to-br from-sky-500 to-teal-600 text-white shadow-md shadow-sky-500/20',
    title: 'Không Gian Tách Biệt Chó & Mèo',
    description:
      'Thiết kế khu vực riêng biệt giảm tiếng ồn, loại bỏ hoàn toàn tình trạng lo âu cho các bé mèo nhạy cảm.',
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildPetStoreJsonLd()} />

      {/* HERO SECTION: 3D Depth, Ambient Glows, Dot Grid & Strict Separation from Photo Frame */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFA] via-[#F8FAFC] to-slate-50 py-16 lg:py-24">
        {/* Subtle Dot Grid Background */}
        <div
          aria-hidden="true"
          className="bg-paw-dot-grid pointer-events-none absolute inset-0 opacity-35"
        />

        {/* Ambient Glow Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-indigo-500/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Messaging, Shimmer Headline, CTAs & Animated Counters */}
            <FadeInUp className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Chăm sóc thú cưng chuẩn y khoa &amp; tận tâm</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Ngôi nhà thứ hai{' '}
                <ShimmerText>tươi mới &amp; an toàn</ShimmerText> cho thú cưng
                của bạn
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                PawPalace kết hợp Spa thảo mộc hữu cơ, Khách sạn thú cưng Camera
                24/7 và Cửa hàng dinh dưỡng chính hãng — nơi mỗi bé chó mèo đều
                được nâng niu như thành viên trong gia đình.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-teal-600/25 active:scale-[0.98]"
                >
                  <CalendarHeart className="h-4.5 w-4.5" />
                  <span>Đặt lịch chăm sóc</span>
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/90 active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Khám phá cửa hàng</span>
                </Link>
              </div>

              {/* Elevated Stat Cards with AnimatedCounter */}
              <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="surface-card-elevated rounded-2xl p-3.5 sm:p-4">
                  <dt className="text-[11px] font-medium text-slate-500 sm:text-xs">
                    Khách hàng hài lòng
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    <AnimatedCounter to={4.9} decimals={1} suffix="/5" />
                  </dd>
                </div>
                <div className="surface-card-elevated rounded-2xl p-3.5 sm:p-4">
                  <dt className="text-[11px] font-medium text-slate-500 sm:text-xs">
                    Bé được chăm sóc
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold text-teal-700 sm:text-2xl">
                    <AnimatedCounter to={12000} suffix="+" />
                  </dd>
                </div>
                <div className="surface-card-elevated rounded-2xl p-3.5 sm:p-4">
                  <dt className="text-[11px] font-medium text-slate-500 sm:text-xs">
                    Giám sát khách sạn
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold text-indigo-600 sm:text-2xl">
                    <AnimatedCounter to={24} suffix="/7" />
                  </dd>
                </div>
              </dl>
            </FadeInUp>

            {/* Right Column: Tilt3DCard + 2 Floating 3D Glass Badges Strictly Outside the Image Frame */}
            <FadeInUp delay={0.12} className="lg:col-span-6">
              <div className="relative py-8 sm:px-3">
                {/* Floating 3D Glass Badge 1 — Positioned cleanly ABOVE the outer top-right rim */}
                <Floating3DElement
                  delay={0}
                  duration={4.8}
                  yRange={5}
                  rotateRange={1.2}
                  className="pointer-events-none absolute -top-1 right-2 z-30 sm:right-0"
                >
                  <div className="glass-badge-3d flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30">
                      <Sparkles className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        Chuẩn Spa Y Khoa 5★
                      </p>
                      <p className="text-[11px] font-medium text-teal-700">
                        Thảo mộc hữu cơ pH 6.8
                      </p>
                    </div>
                  </div>
                </Floating3DElement>

                {/* Main 3D Tilt Hero Showcase Card */}
                <Tilt3DCard maxTilt={7} className="rounded-3xl">
                  <div className="surface-card-elevated rounded-3xl p-3.5">
                    {/* Pure Clean Photo Frame — Zero Overlaid Text or Badges */}
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

                    {/* Separated Info Row Below Photo */}
                    <div className="mt-3.5 grid grid-cols-2 gap-3 rounded-2xl border border-teal-100/80 bg-[#F0FDFA]/90 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/25">
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
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-sm shadow-indigo-500/25">
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
                </Tilt3DCard>

                {/* Floating 3D Glass Badge 2 — Positioned cleanly BELOW the outer bottom-left rim */}
                <Floating3DElement
                  delay={1.2}
                  duration={5.2}
                  yRange={6}
                  rotateRange={1.4}
                  className="pointer-events-none absolute -bottom-2 left-2 z-30 sm:-left-2"
                >
                  <div className="glass-badge-3d flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/30">
                      <Wind className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        Phòng Lọc Khí HEPA
                      </p>
                      <p className="text-[11px] font-medium text-indigo-700">
                        Khu riêng biệt Chó &amp; Mèo
                      </p>
                    </div>
                  </div>
                </Floating3DElement>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Soft Gradient Divider */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-teal-200/80 to-transparent"
      />

      {/* 3 CORE SERVICE BLOCKS */}
      <section
        aria-labelledby="core-services-heading"
        className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/40 to-slate-50 py-20"
      >
        <div
          aria-hidden="true"
          className="bg-paw-dot-grid pointer-events-none absolute inset-0 opacity-25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-sky-200/80 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700 shadow-2xs">
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
                  <Tilt3DCard maxTilt={5} className="h-full rounded-3xl">
                    <article className="group surface-card-elevated flex h-full flex-col overflow-hidden rounded-3xl">
                      {/* Image separated cleanly from text */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={service.image}
                          alt={service.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${service.iconBg}`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${service.accentBg}`}
                          >
                            {service.badge}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-900 transition-colors group-hover:text-teal-700">
                          {service.title}
                        </h3>
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">
                          {service.description}
                        </p>

                        <Link
                          href={service.href}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-indigo-700"
                        >
                          <span>{service.cta}</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  </Tilt3DCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Soft Gradient Divider */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-indigo-200/70 to-transparent"
      />

      {/* FEATURED PRODUCTS (Synced live with Admin isPublished) */}
      <FeaturedProductsSection />

      {/* Soft Gradient Divider */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-teal-200/80 to-transparent"
      />

      {/* QUALITY COMMITMENTS, CUSTOMER REVIEWS & 3D GRADIENT CTA BANNER */}
      <section
        aria-labelledby="trust-reviews-heading"
        className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-[#EFF6FF]/65 to-[#F0FDFA]/85 py-20"
      >
        <div
          aria-hidden="true"
          className="bg-paw-dot-grid-indigo pointer-events-none absolute inset-0 opacity-35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-indigo-500/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInUp className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 shadow-2xs">
              Cam kết &amp; Đánh giá
            </span>
            <h2
              id="trust-reviews-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              Vì sao hơn 12.000 ba mẹ tin chọn PawPalace?
            </h2>
          </FadeInUp>

          {/* Commitments with 3D Tilt & Hover Icon Lift */}
          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3">
            {QUALITY_COMMITMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <Tilt3DCard maxTilt={5} className="h-full rounded-2xl">
                    <div className="group surface-card-elevated h-full rounded-2xl p-6">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${item.iconBg}`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </Tilt3DCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Customer Reviews with 3D Tilt */}
          <StaggerContainer className="mt-10 grid gap-6 md:grid-cols-3">
            {CUSTOMER_REVIEWS.map((review) => (
              <StaggerItem key={review.id}>
                <Tilt3DCard maxTilt={5} className="h-full rounded-2xl">
                  <article className="surface-card-elevated flex h-full flex-col rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-teal-500">
                        {Array.from({ length: review.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="h-4 w-4 fill-teal-500 text-teal-500"
                          />
                        ))}
                      </div>
                      <span className="rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {review.date}
                      </span>
                    </div>

                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                      “{review.comment}”
                    </p>

                    <div className="mt-5 border-t border-teal-100/70 pt-4">
                      <p className="text-sm font-bold text-slate-900">
                        {review.author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {review.petInfo} •{' '}
                        <span className="font-semibold text-teal-700">
                          {review.serviceUsed}
                        </span>
                      </p>
                    </div>
                  </article>
                </Tilt3DCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Vivid 3D Gradient CTA Banner with Floating Frosted Glass Orbs */}
          <FadeInUp className="mt-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 p-8 shadow-[0_28px_70px_-15px_rgba(13,148,136,0.38)] ring-1 ring-white/25 sm:p-12">
              {/* Floating Frosted Glass Geometric Orbs in Corners */}
              <Floating3DElement
                delay={0.2}
                duration={6}
                yRange={8}
                rotateRange={3}
                className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
              >
                <span className="sr-only" />
              </Floating3DElement>
              <Floating3DElement
                delay={1.4}
                duration={5.4}
                yRange={7}
                rotateRange={2.5}
                className="pointer-events-none absolute -bottom-14 left-10 h-36 w-36 rounded-full border border-white/15 bg-white/10 backdrop-blur-md"
              >
                <span className="sr-only" />
              </Floating3DElement>
              <Floating3DElement
                delay={0.8}
                duration={7}
                yRange={5}
                rotateRange={4}
                className="pointer-events-none absolute right-1/3 top-4 hidden h-16 w-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md md:block"
              >
                <span className="sr-only" />
              </Floating3DElement>

              <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Đặt lịch nhanh chỉ 30 giây</span>
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Sẵn sàng dành tặng bé một buổi Spa thư giãn?
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-teal-50/95 sm:text-base">
                    Đặt lịch trực tuyến không cần chờ đợi, tích điểm hội viên
                    lên đến 15% và được tư vấn miễn phí theo giống loài &amp;
                    tình trạng da lông.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  <Link
                    href="/booking?type=spa"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-teal-700 shadow-lg shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 active:scale-[0.97]"
                  >
                    <span>Đặt lịch Spa ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/pet-hotel"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 active:scale-[0.97]"
                  >
                    <span>Xem phòng Khách sạn</span>
                  </Link>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
