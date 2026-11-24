'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Home,
  PawPrint,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { HOTEL_ROOMS, SPA_SERVICES } from '@/data/seedData';
import { calculateNights, formatDateVi, formatVnd } from '@/lib/utils';
import { bookingService } from '@/services/bookingService';
import type { BookingDto, BookingType } from '@/types';

const TIME_SLOTS = [
  '08:30',
  '09:30',
  '10:30',
  '13:30',
  '14:30',
  '15:30',
  '16:30',
  '18:00',
];

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const bookingSchema = z
  .object({
    type: z.enum(['spa', 'hotel']),
    petName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên thú cưng')
      .max(50, 'Tên thú cưng tối đa 50 ký tự'),
    petSpecies: z.enum(['dog', 'cat']),
    petBreed: z
      .string()
      .trim()
      .min(2, 'Vui lòng nhập giống thú cưng (VD: Poodle, Mèo ALN)'),
    petWeightKg: z.coerce
      .number({ invalid_type_error: 'Vui lòng nhập cân nặng hợp lệ' })
      .min(0.5, 'Cân nặng tối thiểu 0.5kg')
      .max(80, 'Cân nặng tối đa 80kg'),
    healthNotes: z.string().max(400, 'Ghi chú tối đa 400 ký tự').optional(),
    serviceId: z.string().min(1, 'Vui lòng chọn gói dịch vụ hoặc hạng phòng'),
    appointmentDate: z.string().min(1, 'Vui lòng chọn ngày hẹn'),
    appointmentTime: z.string().optional(),
    checkOutDate: z.string().optional(),
    ownerName: z
      .string()
      .trim()
      .min(2, 'Vui lòng nhập họ tên chủ nuôi'),
    ownerPhone: z
      .string()
      .trim()
      .regex(
        /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
        'Số điện thoại Việt Nam không hợp lệ (VD: 0912345678)'
      ),
    ownerEmail: z
      .string()
      .trim()
      .email('Email không đúng định dạng')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'spa' && !data.appointmentTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn khung giờ Spa',
        path: ['appointmentTime'],
      });
    }
    if (data.type === 'hotel') {
      if (!data.checkOutDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn ngày Check-out',
          path: ['checkOutDate'],
        });
      } else if (data.checkOutDate <= data.appointmentDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ngày Check-out phải sau ngày Check-in ít nhất 1 đêm',
          path: ['checkOutDate'],
        });
      }
    }
  });

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingClient() {
  const searchParams = useSearchParams();
  const initialType: BookingType =
    searchParams.get('type') === 'hotel' ? 'hotel' : 'spa';
  const paramService = searchParams.get('service');
  const paramRoom = searchParams.get('room');
  const paramPet = searchParams.get('pet') === 'cat' ? 'cat' : 'dog';
  const paramCheckIn = searchParams.get('checkIn') || getDateOffset(1);
  const paramCheckOut = searchParams.get('checkOut') || getDateOffset(3);

  const [createdBooking, setCreatedBooking] = useState<BookingDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultServiceId =
    initialType === 'hotel'
      ? HOTEL_ROOMS.find((r) => r.id === paramRoom)?.id ?? HOTEL_ROOMS[0].id
      : SPA_SERVICES.find((s) => s.id === paramService)?.id ??
        SPA_SERVICES.find((s) => s.petSpecies === paramPet)?.id ??
        SPA_SERVICES[0].id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: initialType,
      petName: '',
      petSpecies: paramPet,
      petBreed: '',
      petWeightKg: 4.5,
      healthNotes: '',
      serviceId: defaultServiceId,
      appointmentDate: paramCheckIn,
      appointmentTime: '09:30',
      checkOutDate: paramCheckOut,
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
    },
  });

  const activeType = watch('type');
  const petSpecies = watch('petSpecies');
  const serviceId = watch('serviceId');
  const petWeightKg = watch('petWeightKg') || 4;
  const appointmentDate = watch('appointmentDate');
  const checkOutDate = watch('checkOutDate') || '';

  const availableSpaPackages = useMemo(
    () => SPA_SERVICES.filter((s) => s.petSpecies === petSpecies),
    [petSpecies]
  );

  // Sync serviceId when switching type or species
  useEffect(() => {
    if (activeType === 'spa') {
      const exists = availableSpaPackages.some((s) => s.id === serviceId);
      if (!exists && availableSpaPackages[0]) {
        setValue('serviceId', availableSpaPackages[0].id);
      }
    } else {
      const exists = HOTEL_ROOMS.some((r) => r.id === serviceId);
      if (!exists) {
        setValue('serviceId', HOTEL_ROOMS[0].id);
      }
    }
  }, [activeType, availableSpaPackages, serviceId, setValue]);

  const pricingSummary = useMemo(() => {
    if (activeType === 'spa') {
      const pkg =
        SPA_SERVICES.find((s) => s.id === serviceId) ?? availableSpaPackages[0];
      const weight = Number(petWeightKg) || 4;
      const matchedTier =
        pkg.tiers.find(
          (t) => weight >= t.minKg && (t.maxKg === null || weight <= t.maxKg)
        ) ?? pkg.tiers[0];
      return {
        serviceName: pkg.name,
        tierNote: `Hạng cân ${matchedTier.label}`,
        nights: undefined,
        estimatedPrice: matchedTier.price,
      };
    }

    const room =
      HOTEL_ROOMS.find((r) => r.id === serviceId) ?? HOTEL_ROOMS[0];
    const nights = calculateNights(appointmentDate, checkOutDate);
    return {
      serviceName: room.name,
      tierNote: `${nights} đêm × ${formatVnd(room.pricePerNight)}`,
      nights,
      estimatedPrice: nights * room.pricePerNight,
    };
  }, [
    activeType,
    serviceId,
    petWeightKg,
    availableSpaPackages,
    appointmentDate,
    checkOutDate,
  ]);

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    try {
      const res = await bookingService.create({
        type: values.type,
        petName: values.petName,
        petSpecies: values.petSpecies,
        petBreed: values.petBreed,
        petWeightKg: Number(values.petWeightKg),
        healthNotes: values.healthNotes || undefined,
        serviceId: values.serviceId,
        serviceName: pricingSummary.serviceName,
        appointmentDate: values.appointmentDate,
        appointmentTime:
          values.type === 'spa' ? values.appointmentTime : undefined,
        checkOutDate: values.type === 'hotel' ? values.checkOutDate : undefined,
        nights: pricingSummary.nights,
        estimatedPrice: pricingSummary.estimatedPrice,
        ownerName: values.ownerName,
        ownerPhone: values.ownerPhone,
        ownerEmail: values.ownerEmail || undefined,
      });

      if (res.success) {
        setCreatedBooking(res.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (createdBooking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-teal-200 bg-white p-8 shadow-card sm:p-10"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="mt-5 text-center">
            <span className="inline-block rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-700">
              Đặt lịch thành công
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Cảm ơn {createdBooking.ownerName}!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Lịch hẹn của bé{' '}
              <strong className="text-slate-900">
                {createdBooking.petName}
              </strong>{' '}
              đã được ghi nhận vào hệ thống PawPalace. Nhân viên tư vấn sẽ liên
              hệ xác nhận trong vòng 15 phút.
            </p>
          </div>

          {/* Booking Code Banner */}
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Mã đặt lịch của bạn
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-widest text-indigo-700">
              {createdBooking.bookingCode}
            </p>
          </div>

          {/* Details */}
          <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-2 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Loại hình</dt>
              <dd className="font-semibold text-slate-900">
                {createdBooking.type === 'spa'
                  ? 'Spa & Grooming'
                  : 'Khách sạn Thú cưng'}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Dịch vụ / Hạng phòng</dt>
              <dd className="font-semibold text-slate-900">
                {createdBooking.serviceName}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Thú cưng</dt>
              <dd className="font-semibold text-slate-900">
                {createdBooking.petName} ({createdBooking.petSpecies === 'dog' ? 'Chó' : 'Mèo'}{' '}
                {createdBooking.petBreed} • {createdBooking.petWeightKg}kg)
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Thời gian</dt>
              <dd className="font-semibold text-slate-900">
                {createdBooking.type === 'spa'
                  ? `${createdBooking.appointmentTime} — ${formatDateVi(createdBooking.appointmentDate)}`
                  : `${formatDateVi(createdBooking.appointmentDate)} → ${formatDateVi(createdBooking.checkOutDate || '')} (${createdBooking.nights} đêm)`}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Chi phí dự kiến</dt>
              <dd className="text-base font-extrabold text-teal-700">
                {formatVnd(createdBooking.estimatedPrice)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCreatedBooking(null);
                reset();
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đặt thêm lịch mới
            </button>
            <Link
              href="/admin/bookings"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Xem lịch trong Quản trị Admin
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Về Trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 2-Tab Switcher with Framer Motion layoutId */}
      <div className="mb-10 flex justify-center">
        <div
          role="tablist"
          aria-label="Chọn loại hình đặt lịch"
          className="inline-flex rounded-2xl border border-teal-100 bg-white p-1.5 shadow-soft"
        >
          {[
            {
              id: 'spa' as const,
              label: 'Đặt lịch Spa / Grooming',
              icon: Sparkles,
            },
            {
              id: 'hotel' as const,
              label: 'Đặt phòng Khách sạn',
              icon: Home,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setValue('type', tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                  active ? 'text-white' : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bookingTabIndicator"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className={`absolute inset-0 rounded-xl shadow-sm ${
                      tab.id === 'spa' ? 'bg-teal-600' : 'bg-indigo-600'
                    }`}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-8 lg:grid-cols-12"
      >
        {/* Left Form Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section 1: Pet Info */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <PawPrint className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  1. Thông tin thú cưng
                </h2>
                <p className="text-xs text-slate-500">
                  Giúp chuyên viên chuẩn bị dầu tắm, dụng cụ và không gian phù
                  hợp nhất cho bé.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Tên bé <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Mochi, Bơ, Cà Phê..."
                  {...register('petName')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.petName && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.petName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Loài <span className="text-teal-600">*</span>
                </label>
                <select
                  {...register('petSpecies')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="dog">Chó</option>
                  <option value="cat">Mèo</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Giống thú cưng <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Poodle Toy, Corgi, Mèo Anh Lông Ngắn..."
                  {...register('petBreed')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.petBreed && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.petBreed.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Cân nặng (kg) <span className="text-teal-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="80"
                  {...register('petWeightKg')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.petWeightKg && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.petWeightKg.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Ghi chú tình trạng sức khỏe / dị ứng / thói quen
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Bé có làn da nhạy cảm, sợ tiếng máy sấy lớn, hoặc đã tiêm đủ vaccine..."
                  {...register('healthNotes')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Service & Schedule */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  2.{' '}
                  {activeType === 'spa'
                    ? 'Chọn gói Spa & Ngày giờ hẹn'
                    : 'Chọn hạng phòng & Lịch lưu trú'}
                </h2>
                <p className="text-xs text-slate-500">
                  Chi phí dự kiến được tự động tính minh bạch theo cân nặng hoặc
                  số đêm lưu trú.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {activeType === 'spa'
                    ? 'Gói dịch vụ Spa'
                    : 'Hạng phòng Khách sạn'}{' '}
                  <span className="text-teal-600">*</span>
                </label>
                <select
                  {...register('serviceId')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {activeType === 'spa'
                    ? availableSpaPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.durationMinutes} phút)
                        </option>
                      ))
                    : HOTEL_ROOMS.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} — {formatVnd(room.pricePerNight)}/đêm
                        </option>
                      ))}
                </select>
              </div>

              {activeType === 'spa' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ngày hẹn Spa <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('appointmentDate')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    {errors.appointmentDate && (
                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        {errors.appointmentDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Khung giờ <span className="text-teal-600">*</span>
                    </label>
                    <select
                      {...register('appointmentTime')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {errors.appointmentTime && (
                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        {errors.appointmentTime.message}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ngày Check-in <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('appointmentDate')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ngày Check-out <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('checkOutDate')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    {errors.checkOutDate && (
                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        {errors.checkOutDate.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Owner Info */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  3. Thông tin chủ nuôi
                </h2>
                <p className="text-xs text-slate-500">
                  Dùng để gửi mã xác nhận và cập nhật hình ảnh/video bé trong
                  suốt quá trình chăm sóc.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Họ và tên <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Minh Anh"
                  {...register('ownerName')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.ownerName && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.ownerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Số điện thoại <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    {...register('ownerPhone')}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {errors.ownerPhone && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.ownerPhone.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email nhận hóa đơn điện tử (không bắt buộc)
                </label>
                <input
                  type="email"
                  placeholder="tenban@email.com"
                  {...register('ownerEmail')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.ownerEmail && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.ownerEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Column */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-teal-100 bg-white p-6 shadow-card">
            <h3 className="text-base font-bold text-slate-900">
              Tóm tắt lịch hẹn
            </h3>

            <div className="mt-4 space-y-3 rounded-2xl bg-[#F0FDFA] p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Hình thức</span>
                <span className="font-semibold text-teal-800">
                  {activeType === 'spa' ? 'Spa / Grooming' : 'Khách sạn 24/7'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Gói chọn</span>
                <span className="text-right font-semibold text-slate-900">
                  {pricingSummary.serviceName}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Định mức</span>
                <span className="font-medium text-slate-700">
                  {pricingSummary.tierNote}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">
                Tổng chi phí dự kiến
              </span>
              <span className="text-2xl font-extrabold text-teal-700">
                {formatVnd(pricingSummary.estimatedPrice)}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              * Thanh toán trực tiếp tại PawPalace sau khi kiểm tra tình trạng
              thực tế của bé.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 ${
                activeType === 'spa'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <CalendarCheck2 className="h-4.5 w-4.5" />
              <span>
                {submitting ? 'Đang gửi lịch hẹn...' : 'Xác nhận đặt lịch ngay'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
