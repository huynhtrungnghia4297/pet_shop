'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AirVent,
  ArrowRight,
  Calculator,
  Camera,
  Check,
  Maximize2,
  ShieldCheck,
  Trees,
  Utensils,
} from 'lucide-react';
import {
  FadeInUp,
  ScaleOnHover,
  StaggerContainer,
  StaggerItem,
} from '@/components/motion/MotionPrimitives';
import { HOTEL_ROOMS } from '@/data/seedData';
import { calculateNights, formatVnd } from '@/lib/utils';

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

export function PetHotelClient() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    HOTEL_ROOMS[1].id
  );
  const [checkIn, setCheckIn] = useState<string>(() => getDefaultDateOffset(1));
  const [checkOut, setCheckOut] = useState<string>(() =>
    getDefaultDateOffset(4)
  );

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
                <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
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

      {/* 3 Room Tiers */}
      <section aria-labelledby="rooms-heading" className="mt-20">
        <FadeInUp className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Hệ thống hạng phòng
            </span>
            <h2
              id="rooms-heading"
              className="mt-3 text-3xl font-extrabold text-slate-900"
            >
              3 Hạng phòng Khách sạn Thú cưng
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Bấm chọn hạng phòng để ước tính chi phí ngay bên dưới.
          </p>
        </FadeInUp>

        <StaggerContainer className="grid gap-8 lg:grid-cols-3">
          {HOTEL_ROOMS.map((room) => {
            const isSelected = room.id === selectedRoomId;
            return (
              <StaggerItem key={room.id}>
                <ScaleOnHover liftY={-4} className="h-full">
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-soft transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-teal-200'
                    }`}
                  >
                    {/* Clean Image Frame */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={room.imageUrl}
                        alt={`${room.name} tại Khách sạn thú cưng PawPalace`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    {/* Separated Info */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            room.id === 'hotel-camera-247'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-teal-50 text-teal-700'
                          }`}
                        >
                          {room.badge}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Maximize2 className="h-3.5 w-3.5" />
                          {room.dimensions}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {room.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {room.subtitle}
                      </p>

                      <div className="mt-4 flex items-baseline gap-1 border-y border-slate-100 py-3">
                        <span className="text-2xl font-extrabold text-teal-700">
                          {formatVnd(room.pricePerNight)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          / đêm (tối đa {room.maxWeightKg}kg)
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
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? 'Đang tính giá' : 'Chọn ước tính'}
                        </button>
                        <Link
                          href={`/booking?type=hotel&room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                          className="flex items-center justify-center rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                        >
                          Đặt phòng này
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScaleOnHover>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Interactive Live Stay Cost Calculator */}
      <FadeInUp className="mt-20">
        <section
          aria-labelledby="calculator-heading"
          className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-[#F0FDFA] via-white to-[#EFF6FF] p-6 shadow-card sm:p-10"
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
    </div>
  );
}
