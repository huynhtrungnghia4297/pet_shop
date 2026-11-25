'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AirVent,
  ArrowRight,
  Calculator,
  Camera,
  Check,
  Crown,
  Images,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Trees,
  Utensils,
} from 'lucide-react';
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  Tilt3DCard,
} from '@/components/motion/MotionPrimitives';
import { RoomDetailModal } from '@/components/storefront/RoomDetailModal';
import { HOTEL_ROOMS } from '@/data/seedData';
import { calculateNights, formatVnd } from '@/lib/utils';
import type { HotelRoomTier } from '@/types';

const AMENITIES = [
  {
    icon: AirVent,
    title: 'Điều hòa & Lọc khí HEPA 24/7',
    description:
      'Nhiệt độ luôn duy trì lý tưởng 24–26°C cùng hệ thống lọc bụi mịn và khử mùi tự động.',
  },
  {
    icon: ShieldCheck,
    title: 'Khu vực tách biệt Chó & Mèo',
    description:
      'Tầng riêng biệt hoàn toàn giữa khu chó và khu mèo, cách âm chuẩn giúp các bé nghỉ ngơi thư thái.',
  },
  {
    icon: Utensils,
    title: 'Thực đơn dinh dưỡng khoa học',
    description:
      'Phục vụ hạt cao cấp, pate tươi hấp hoặc chuẩn bị đúng khẩu phần riêng do ba mẹ mang theo.',
  },
  {
    icon: Trees,
    title: 'Sân chơi riêng sạch khuẩn',
    description:
      'Khu vận động trong nhà lót sàn chống trượt, nhân viên tương tác cùng bé 2 lượt mỗi ngày.',
  },
];

function getDefaultDateOffset(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
}

function getRoomCardTheme(roomId: string, isSelected: boolean) {
  if (roomId === 'hotel-camera-247') {
    return {
      outerWrapper: `rounded-3xl p-[2px] bg-gradient-to-br from-indigo-500 via-purple-500 to-teal-400 shadow-2xl shadow-indigo-500/15 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-indigo-500/25 ${
        isSelected ? 'ring-4 ring-indigo-500/25' : ''
      }`,
      innerCard:
        'flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-2px)] bg-gradient-to-b from-white via-white to-indigo-50/40',
      topAccentBar:
        'h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400',
      badgeClass:
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-xs',
      priceClass: 'text-indigo-700',
      primaryBtnClass:
        'bg-gradient-to-r from-indigo-600 to-teal-600 text-white hover:from-indigo-700 hover:to-teal-700 shadow-sm shadow-indigo-500/20',
      isPremium: true,
    };
  }

  if (roomId === 'hotel-vip') {
    return {
      outerWrapper: `rounded-3xl p-[1.5px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-xl shadow-teal-500/15 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-teal-500/25 ${
        isSelected ? 'ring-4 ring-teal-500/25' : ''
      }`,
      innerCard:
        'flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-white',
      topAccentBar:
        'h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
      badgeClass:
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-xs',
      priceClass: 'text-teal-700',
      primaryBtnClass:
        'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-sm shadow-teal-500/20',
      isPremium: false,
    };
  }

  return {
    outerWrapper: `rounded-3xl p-[1px] bg-gradient-to-br from-teal-500/25 via-teal-200/40 to-sky-400/25 shadow-lg shadow-teal-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:from-teal-500/45 hover:to-cyan-500/40 hover:shadow-xl hover:shadow-teal-900/10 ${
      isSelected ? 'ring-4 ring-teal-500/20' : ''
    }`,
    innerCard:
      'flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] border border-teal-500/15 bg-white',
    topAccentBar: null,
    badgeClass:
      'inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700',
    priceClass: 'text-teal-700',
    primaryBtnClass:
      'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
    isPremium: false,
  };
}

export function PetHotelClient() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    HOTEL_ROOMS[1].id
  );
  const [checkIn, setCheckIn] = useState<string>(() => getDefaultDateOffset(1));
  const [checkOut, setCheckOut] = useState<string>(() =>
    getDefaultDateOffset(4)
  );
  const [detailRoom, setDetailRoom] = useState<HotelRoomTier | null>(null);
  const calculatorRef = useRef<HTMLElement>(null);

  const selectedRoom = useMemo(
    () => HOTEL_ROOMS.find((r) => r.id === selectedRoomId) ?? HOTEL_ROOMS[0],
    [selectedRoomId]
  );

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const totalCost = nights * selectedRoom.pricePerNight;

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (checkOut <= val) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleSelectForEstimate = (roomId: string) => {
    setSelectedRoomId(roomId);
    setDetailRoom(null);
    window.setTimeout(() => {
      calculatorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 120);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Amenities Grid */}
      <section aria-labelledby="amenities-heading">
        <FadeInUp className="mb-10 text-center">
          <h2
            id="amenities-heading"
            className="text-2xl font-extrabold text-slate-900 sm:text-3xl"
          >
            Tiện ích lưu trú chuẩn nghỉ dưỡng 5 sao
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            An tâm tuyệt đối trong mỗi chuyến công tác hay du lịch dài ngày của
            gia đình bạn.
          </p>
        </FadeInUp>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <div className="surface-card-elevated h-full rounded-2xl p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-500/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* 3 Room Tiers with Luxury Gradient Borders, 3D Tilt & Detail Popup Triggers */}
      <section aria-labelledby="rooms-heading" className="mt-20">
        <FadeInUp className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Hệ thống hạng phòng cao cấp
            </span>
            <h2
              id="rooms-heading"
              className="mt-3 text-3xl font-extrabold text-slate-900"
            >
              3 Hạng phòng Khách sạn Thú cưng
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Bấm vào ảnh hoặc tên phòng để xem bộ ảnh góc phòng &amp; tiện nghi
            chi tiết.
          </p>
        </FadeInUp>

        <StaggerContainer className="grid gap-8 lg:grid-cols-3">
          {HOTEL_ROOMS.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const theme = getRoomCardTheme(room.id, isSelected);
            const photoCount = room.galleryImages?.length || 1;

            return (
              <StaggerItem key={room.id}>
                <Tilt3DCard maxTilt={5} className="h-full rounded-3xl">
                  <div className={`group h-full ${theme.outerWrapper}`}>
                    <article className={theme.innerCard}>
                      {/* Subtle Luminous Top Accent Strip for VIP & Camera 24/7 */}
                      {theme.topAccentBar && (
                        <div
                          aria-hidden="true"
                          className={theme.topAccentBar}
                        />
                      )}

                      {/* Pure Clean Clickable Photo Frame — Zero Text/Badges Inside Image */}
                      <button
                        type="button"
                        onClick={() => setDetailRoom(room)}
                        aria-label={`Xem chi tiết và bộ ảnh ${room.name}`}
                        className="relative block aspect-[16/10] w-full cursor-pointer overflow-hidden bg-slate-100 text-left focus:outline-none"
                      >
                        <Image
                          src={room.imageUrl}
                          alt={`${room.name} tại Khách sạn thú cưng PawPalace`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </button>

                      {/* Separated Info & Controls Below Image */}
                      <div className="flex flex-1 flex-col p-6">
                        {/* Gallery Detail Trigger Link — Cleanly Outside Image Frame */}
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className={theme.badgeClass}>
                            {room.id === 'hotel-camera-247' && (
                              <Crown className="h-3.5 w-3.5" />
                            )}
                            {room.id === 'hotel-vip' && (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            <span>{room.badge}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setDetailRoom(room)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/90 px-2.5 py-1 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
                          >
                            <Images className="h-3.5 w-3.5" />
                            <span>Xem chi tiết &amp; {photoCount} ảnh</span>
                          </button>
                        </div>

                        {/* Clickable Room Title */}
                        <button
                          type="button"
                          onClick={() => setDetailRoom(room)}
                          className="cursor-pointer text-left focus:outline-none"
                        >
                          <h3 className="text-xl font-extrabold text-slate-900 transition-colors group-hover:text-teal-700">
                            {room.name}
                          </h3>
                        </button>

                        <p className="mt-1.5 text-sm text-slate-600">
                          {room.subtitle}
                        </p>

                        {/* Specs & Nightly Price */}
                        <div className="mt-4 flex items-center justify-between border-y border-slate-100 py-3.5">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-2xl font-extrabold ${theme.priceClass}`}
                            >
                              {formatVnd(room.pricePerNight)}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              / đêm
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            <Maximize2 className="h-3 w-3 text-teal-600" />
                            <span>{room.dimensions}</span>
                          </span>
                        </div>

                        <ul className="mt-4 flex-1 space-y-2.5">
                          {room.features.map((feat) => (
                            <li
                              key={feat}
                              className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50'
                            }`}
                          >
                            {isSelected ? 'Đang tính giá' : 'Chọn ước tính'}
                          </button>
                          <Link
                            href={`/booking?type=hotel&room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                            className={`flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${theme.primaryBtnClass}`}
                          >
                            Đặt phòng này
                          </Link>
                        </div>
                      </div>
                    </article>
                  </div>
                </Tilt3DCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Interactive Live Stay Cost Calculator */}
      <FadeInUp className="mt-20">
        <section
          ref={calculatorRef}
          id="stay-cost-calculator"
          aria-labelledby="calculator-heading"
          className="surface-card-elevated rounded-3xl bg-gradient-to-br from-[#F0FDFA] via-white to-[#EFF6FF] p-6 sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                <Calculator className="h-4 w-4" />
                <span>Công cụ ước tính chi phí trực tiếp</span>
              </div>
              <h2
                id="calculator-heading"
                className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl"
              >
                Tính chi phí lưu trú khách sạn thú cưng
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Chọn ngày Check-in, Check-out và hạng phòng phù hợp để biết ngay
                tổng chi phí dự kiến trước khi đặt lịch.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="calc-checkin"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Ngày Check-in
                  </label>
                  <input
                    id="calc-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-checkout"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Ngày Check-out
                  </label>
                  <input
                    id="calc-checkout"
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-room"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Hạng phòng
                  </label>
                  <select
                    id="calc-room"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {HOTEL_ROOMS.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result Summary Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Hạng phòng đã chọn
                    </p>
                    <p className="mt-0.5 text-base font-bold text-slate-900">
                      {selectedRoom.name}
                    </p>
                  </div>
                  {selectedRoom.id === 'hotel-camera-247' && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      <Camera className="h-3.5 w-3.5" />
                      HD 24/7
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Đơn giá mỗi đêm</span>
                    <span className="font-semibold text-slate-900">
                      {formatVnd(selectedRoom.pricePerNight)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số đêm lưu trú</span>
                    <span className="font-semibold text-teal-700">
                      {nights} đêm
                    </span>
                  </div>
                  {selectedRoom.id === 'hotel-camera-247' && nights >= 3 && (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                      Ưu đãi: Miễn phí gói Vệ sinh tai &amp; Cắt móng (lưu trú từ
                      3 đêm).
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm font-bold text-slate-900">
                      Tổng chi phí dự kiến
                    </span>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      {formatVnd(totalCost)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/booking?type=hotel&room=${selectedRoom.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <span>Đặt phòng ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* Interactive Room Detail Lightbox / Modal */}
      <RoomDetailModal
        room={detailRoom}
        checkIn={checkIn}
        checkOut={checkOut}
        onClose={() => setDetailRoom(null)}
        onSelectForEstimate={handleSelectForEstimate}
      />
    </div>
  );
}
