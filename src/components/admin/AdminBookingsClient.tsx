'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  HeartPulse,
  Home,
  Phone,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { PetProfileDrawer } from '@/components/admin/PetProfileDrawer';
import { BOOKING_STATUS_META, formatDateVi, formatVnd } from '@/lib/utils';
import { bookingService } from '@/services/bookingService';
import { petService } from '@/services/petService';
import type {
  BookingDto,
  BookingStatus,
  BookingType,
  PetProfileDto,
} from '@/types';

const STATUS_OPTIONS: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

function matchPetProfile(
  booking: BookingDto,
  pets: PetProfileDto[]
): PetProfileDto | null {
  const targetPhone = booking.ownerPhone.replace(/\s+/g, '').trim();
  const targetName = booking.petName.trim().toLowerCase();
  return (
    pets.find(
      (p) =>
        p.ownerPhone.replace(/\s+/g, '').trim() === targetPhone &&
        p.name.trim().toLowerCase() === targetName
    ) ?? null
  );
}

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [pets, setPets] = useState<PetProfileDto[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | BookingType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [drawerPet, setDrawerPet] = useState<PetProfileDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [bRes, pRes] = await Promise.all([
      bookingService.getAll(),
      petService.getAll(),
    ]);
    if (bRes.success) setBookings(bRes.data);
    if (pRes.success) {
      setPets(pRes.data);
      setDrawerPet((prev) =>
        prev ? pRes.data.find((p) => p.id === prev.id) ?? prev : null
      );
    }
  }, []);

  useEffect(() => {
    void loadData();
    const u1 = bookingService.subscribe(() => void loadData());
    const u2 = petService.subscribe(() => void loadData());
    return () => {
      u1();
      u2();
    };
  }, [loadData]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (typeFilter !== 'all' && b.type !== typeFilter) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, typeFilter, statusFilter]);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await bookingService.updateStatus(id, status);
  };

  const handleOpenPetProfile = async (booking: BookingDto) => {
    const existing = matchPetProfile(booking, pets);
    if (existing) {
      setDrawerPet(existing);
      setDrawerOpen(true);
      return;
    }

    // Auto-create/sync profile on-demand if not yet in CRM
    const synced = await petService.syncFromBooking(booking);
    if (synced.success && synced.data) {
      setDrawerPet(synced.data);
      setDrawerOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Quản lý Lịch hẹn Spa &amp; Khách sạn
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Nhận diện nhanh khách quen từ Hồ sơ Thú cưng (Pet CRM), xem lưu ý sức
          khỏe và tự động cập nhật lịch sử chăm sóc khi duyệt/hoàn thành lịch.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: 'Tất cả lịch hẹn' },
            { id: 'spa' as const, label: 'Spa & Grooming' },
            { id: 'hotel' as const, label: 'Khách sạn thú cưng' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setTypeFilter(btn.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                typeFilter === btn.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | BookingStatus)
          }
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none"
        >
          <option value="all">Mọi trạng thái</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {BOOKING_STATUS_META[st].label}
            </option>
          ))}
        </select>
      </div>

      {/* Booking Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Không có lịch hẹn nào khớp bộ lọc.
          </div>
        ) : (
          filtered.map((bk) => {
            const meta = BOOKING_STATUS_META[bk.status];
            const matchedPet = matchPetProfile(bk, pets);
            const isReturning = matchedPet && matchedPet.visitCount >= 2;
            const hasAllergy =
              matchedPet?.allergies &&
              !matchedPet.allergies.toLowerCase().includes('không ghi nhận');

            return (
              <article
                key={bk.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700">
                        {bk.bookingCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                          bk.type === 'spa'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {bk.type === 'spa' ? (
                          <Sparkles className="h-3 w-3" />
                        ) : (
                          <Home className="h-3 w-3" />
                        )}
                        {bk.type === 'spa' ? 'Spa / Grooming' : 'Khách sạn'}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>

                      {/* CRM Returning vs First-time Recognition Badge */}
                      {isReturning ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <UserCheck className="h-3 w-3" />
                          Khách quen • Đã đến {matchedPet.visitCount} lần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                          Lần đầu đến
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      {bk.serviceName}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                      <span>
                        Thú cưng:{' '}
                        <strong className="text-slate-900">
                          {bk.petName}
                        </strong>{' '}
                        ({bk.petSpecies === 'dog' ? 'Chó' : 'Mèo'} {bk.petBreed}{' '}
                        • {bk.petWeightKg}kg)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5 text-teal-600" />
                        {bk.type === 'spa'
                          ? `${bk.appointmentTime} — ${formatDateVi(bk.appointmentDate)}`
                          : `${formatDateVi(bk.appointmentDate)} → ${formatDateVi(bk.checkOutDate || '')} (${bk.nights} đêm)`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-sky-600" />
                        {bk.ownerName} — {bk.ownerPhone}
                      </span>
                    </div>

                    {/* Quick CRM Allergy Warning & Booking Health Notes */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {hasAllergy && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {matchedPet.allergies}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleOpenPetProfile(bk)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/80 px-2.5 py-1 text-[11px] font-semibold text-teal-800 transition-colors hover:bg-teal-600 hover:text-white"
                      >
                        <HeartPulse className="h-3.5 w-3.5" />
                        <span>Xem hồ sơ &amp; Ghi chú bé</span>
                      </button>
                    </div>

                    {bk.healthNotes && (
                      <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <strong>Ghi chú lịch hẹn:</strong> {bk.healthNotes}
                      </p>
                    )}
                  </div>

                  {/* Right Price & Status Updater */}
                  <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 pt-3 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] text-slate-500">
                        Chi phí dự kiến
                      </p>
                      <p className="text-lg font-extrabold text-teal-700">
                        {formatVnd(bk.estimatedPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`status-${bk.id}`}
                        className="text-xs font-medium text-slate-500"
                      >
                        Trạng thái:
                      </label>
                      <select
                        id={`status-${bk.id}`}
                        value={bk.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            bk.id,
                            e.target.value as BookingStatus
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {BOOKING_STATUS_META[st].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Quick Pet Profile & Health Notes Drawer */}
      <PetProfileDrawer
        isOpen={drawerOpen}
        pet={drawerPet}
        onClose={() => setDrawerOpen(false)}
        onSaved={(saved) => {
          setDrawerPet(saved);
          void loadData();
        }}
      />
    </div>
  );
}
