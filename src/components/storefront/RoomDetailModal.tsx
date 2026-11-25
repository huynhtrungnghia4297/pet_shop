'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AirVent,
  ArrowRight,
  BedDouble,
  Calculator,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Scale,
  ShieldCheck,
  Sparkles,
  Trees,
  Utensils,
  X,
} from 'lucide-react';
import { formatVnd } from '@/lib/utils';
import type { HotelAmenityIconKey, HotelRoomTier } from '@/types';

const AMENITY_ICON_MAP: Record<HotelAmenityIconKey, typeof ShieldCheck> = {
  air: AirVent,
  shield: ShieldCheck,
  utensils: Utensils,
  camera: Camera,
  sparkles: Sparkles,
  bed: BedDouble,
  trees: Trees,
  heart: Heart,
};

interface RoomDetailModalProps {
  room: HotelRoomTier | null;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onSelectForEstimate: (roomId: string) => void;
}

export function RoomDetailModal({
  room,
  checkIn,
  checkOut,
  onClose,
  onSelectForEstimate,
}: RoomDetailModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const images = room?.galleryImages?.length
    ? room.galleryImages
    : room
      ? [room.imageUrl]
      : [];

  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
  }, [room?.id]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!room) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room, onClose, handlePrev, handleNext]);

  const isLuxuryCamera = room?.id === 'hotel-camera-247';
  const isVipSuite = room?.id === 'hotel-vip';

  const currentImage = images[activeIndex] ?? room?.imageUrl ?? '';
  const currentCaption =
    room?.galleryCaptions?.[activeIndex] ||
    (room ? `Góc nhìn ${activeIndex + 1} — ${room.name}` : '');

  return (
    <AnimatePresence>
      {room && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl p-[2px] shadow-2xl ${
              isLuxuryCamera
                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-teal-400'
                : isVipSuite
                  ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500'
                  : 'bg-gradient-to-br from-teal-300 via-teal-200 to-sky-200'
            }`}
          >
            <div className="flex max-h-[calc(92vh-4px)] flex-col overflow-hidden rounded-[calc(1.5rem-2px)] bg-white">
              {/* Top Modal Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-7">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isLuxuryCamera
                        ? 'bg-indigo-100 text-indigo-700'
                        : isVipSuite
                          ? 'bg-emerald-100 text-teal-800'
                          : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    {room.badge}
                  </span>
                  <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                    Chi tiết không gian &amp; tiện nghi lưu trú PawPalace
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng cửa sổ chi tiết phòng"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable Body (1-col Mobile / 2-col Desktop) */}
              <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-7 lg:grid-cols-12 lg:gap-8">
                {/* Left Column: Interactive Clean Image Gallery (Zero text/buttons overlaid on image!) */}
                <div className="flex flex-col lg:col-span-6">
                  {/* Pure Clean Main Image Frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-inner">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, x: direction * 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -28 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="relative h-full w-full"
                      >
                        <Image
                          src={currentImage}
                          alt={`${room.name} - ${currentCaption}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* External Controls Bar Below Photo (Caption + Prev/Next Buttons + Counter) */}
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
                    <p className="min-w-0 flex-1 text-xs font-medium text-slate-700">
                      <span className="mr-2 font-bold text-teal-700">
                        {activeIndex + 1}/{images.length}
                      </span>
                      <span>{currentCaption}</span>
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Ảnh trước"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Ảnh tiếp theo"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="mt-3 grid grid-cols-4 gap-2.5">
                    {images.map((imgUrl, idx) => {
                      const isCurrent = idx === activeIndex;
                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => {
                            setDirection(idx > activeIndex ? 1 : -1);
                            setActiveIndex(idx);
                          }}
                          aria-label={`Xem góc phòng ${idx + 1}`}
                          className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all ${
                            isCurrent
                              ? 'border-teal-600 ring-2 ring-teal-500/25'
                              : 'border-slate-200 opacity-75 hover:border-teal-300 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Ảnh thu nhỏ ${idx + 1} - ${room.name}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Detailed Room Info, Specs, Amenities & Actions */}
                <div className="flex flex-col lg:col-span-6">
                  <h2
                    id="room-modal-title"
                    className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
                  >
                    {room.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {room.subtitle}
                  </p>

                  {/* Price & Specs Row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-[#F0FDFA]/80 p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                        Đơn giá lưu trú
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-teal-700">
                          {formatVnd(room.pricePerNight)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          / đêm
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs ring-1 ring-teal-100">
                        <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
                        <span>{room.dimensions}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs ring-1 ring-indigo-100">
                        <Scale className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Tối đa {room.maxWeightKg}kg</span>
                      </span>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {room.descriptionDetail}
                  </p>

                  {/* Detailed Amenities with Icons */}
                  <div className="mt-5 flex-1">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tiện nghi &amp; Đặc quyền bao gồm
                    </p>
                    <ul className="space-y-2.5">
                      {room.detailedAmenities.map((amenity) => {
                        const Icon =
                          AMENITY_ICON_MAP[amenity.icon] || ShieldCheck;
                        return (
                          <li
                            key={amenity.title}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isLuxuryCamera
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-teal-100/80 text-teal-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {amenity.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                {amenity.detail}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => onSelectForEstimate(room.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-100"
                    >
                      <Calculator className="h-4 w-4" />
                      <span>Chọn ước tính chi phí</span>
                    </button>
                    <Link
                      href={`/booking?type=hotel&room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                      onClick={onClose}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 ${
                        isLuxuryCamera
                          ? 'bg-gradient-to-r from-indigo-600 to-teal-600'
                          : 'bg-gradient-to-r from-teal-600 to-emerald-600'
                      }`}
                    >
                      <span>Đặt phòng này ngay</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
