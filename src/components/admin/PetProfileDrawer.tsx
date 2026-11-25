'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarClock,
  Check,
  HeartPulse,
  Home,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Scale,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { PET_AVATAR_PRESETS } from '@/data/seedData';
import { BOOKING_STATUS_META, formatDateVi } from '@/lib/utils';
import { petService } from '@/services/petService';
import type {
  BookingType,
  CreatePetProfileDto,
  PetGender,
  PetProfileDto,
} from '@/types';

interface PetProfileDrawerProps {
  isOpen: boolean;
  pet: PetProfileDto | null; // null = create mode
  onClose: () => void;
  onSaved?: (saved: PetProfileDto) => void;
}

interface PetFormState {
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  gender: PetGender;
  ageText: string;
  weightKg: string;
  avatarUrl: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  allergies: string;
  temperament: string;
  healthNotes: string;
}

const EMPTY_PET_FORM: PetFormState = {
  name: '',
  species: 'dog',
  breed: '',
  gender: 'female',
  ageText: '1 tuổi',
  weightKg: '4.0',
  avatarUrl: PET_AVATAR_PRESETS[0].url,
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  allergies: '',
  temperament: '',
  healthNotes: '',
};

export function PetProfileDrawer({
  isOpen,
  pet,
  onClose,
  onSaved,
}: PetProfileDrawerProps) {
  const isCreateMode = !pet;
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [form, setForm] = useState<PetFormState>(EMPTY_PET_FORM);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceType: 'spa' as BookingType,
    serviceName: 'Combo Tắm Vệ Sinh Toàn Diện',
    weightKgAtVisit: '4.0',
    staffNote: '',
  });
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSavedNotice(null);
    setShowAddVisit(false);

    if (pet) {
      setIsEditing(false);
      setForm({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender,
        ageText: pet.ageText,
        weightKg: String(pet.weightKg),
        avatarUrl: pet.avatarUrl,
        ownerName: pet.ownerName,
        ownerPhone: pet.ownerPhone,
        ownerEmail: pet.ownerEmail || '',
        allergies: pet.allergies || '',
        temperament: pet.temperament || '',
        healthNotes: pet.healthNotes || '',
      });
      setVisitForm((prev) => ({
        ...prev,
        weightKgAtVisit: String(pet.weightKg),
        staffNote: '',
      }));
    } else {
      setIsEditing(true);
      setForm(EMPTY_PET_FORM);
    }
  }, [isOpen, pet]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.ownerName.trim() || !form.ownerPhone.trim()) {
      return;
    }

    setSaving(true);
    try {
      const payload: CreatePetProfileDto = {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || 'Chưa rõ giống',
        gender: form.gender,
        ageText: form.ageText.trim() || 'Chưa rõ tuổi',
        weightKg: Math.max(0.5, Number(form.weightKg) || 1),
        avatarUrl: form.avatarUrl.trim() || PET_AVATAR_PRESETS[0].url,
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        ownerEmail: form.ownerEmail.trim() || undefined,
        allergies: form.allergies.trim() || undefined,
        temperament: form.temperament.trim() || undefined,
        healthNotes: form.healthNotes.trim() || undefined,
      };

      if (pet) {
        const res = await petService.update(pet.id, payload);
        if (res.success && res.data) {
          setIsEditing(false);
          setSavedNotice('Đã cập nhật hồ sơ sức khỏe & cân nặng cho bé.');
          onSaved?.(res.data);
        }
      } else {
        const res = await petService.create(payload);
        if (res.success && res.data) {
          onSaved?.(res.data);
          onClose();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet || !visitForm.serviceName.trim()) return;
    setSaving(true);
    try {
      const res = await petService.addVisitLog(pet.id, {
        date: visitForm.date,
        serviceType: visitForm.serviceType,
        serviceName: visitForm.serviceName.trim(),
        weightKgAtVisit: Math.max(0.5, Number(visitForm.weightKgAtVisit) || pet.weightKg),
        staffNote:
          visitForm.staffNote.trim() ||
          'Đã hoàn tất chăm sóc, tình trạng sức khỏe ổn định.',
        status: 'completed',
      });
      if (res.success && res.data) {
        setShowAddVisit(false);
        setVisitForm((prev) => ({ ...prev, staffNote: '' }));
        setSavedNotice('Đã ghi nhận lịch sử chăm sóc mới và cập nhật cân nặng.');
        onSaved?.(res.data);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pet ? `Hồ sơ thú cưng ${pet.name}` : 'Thêm hồ sơ thú cưng mới'}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
          />

          {/* Slide-over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                  <PawPrint className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isCreateMode
                      ? 'Thêm hồ sơ Thú cưng mới'
                      : `Hồ sơ bé ${pet.name}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCreateMode
                      ? 'Lưu trữ thông tin sức khỏe, dị ứng & lịch sử chăm sóc'
                      : `${pet.petCode} • ${pet.breed} • Đã đến ${pet.visitCount} lần`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pet && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng hồ sơ"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {savedNotice && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{savedNotice}</span>
                </div>
              )}

              {isEditing ? (
                /* CREATE / EDIT FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Tên bé *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="VD: Mochi, Bơ..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Loài *
                      </label>
                      <select
                        value={form.species}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            species: e.target.value as 'dog' | 'cat',
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        <option value="dog">Chó</option>
                        <option value="cat">Mèo</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Giống thú cưng *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.breed}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, breed: e.target.value }))
                        }
                        placeholder="VD: Poodle Toy, Mèo ALN..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Giới tính
                        </label>
                        <select
                          value={form.gender}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              gender: e.target.value as PetGender,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                        >
                          <option value="female">Cái</option>
                          <option value="male">Đực</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Cân nặng (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={form.weightKg}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, weightKg: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Độ tuổi
                      </label>
                      <input
                        type="text"
                        value={form.ageText}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, ageText: e.target.value }))
                        }
                        placeholder="VD: 2 tuổi 4 tháng"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Avatar Presets */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ảnh đại diện bé (chọn nhanh hoặc dán URL)
                    </label>
                    <input
                      type="url"
                      value={form.avatarUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, avatarUrl: e.target.value }))
                      }
                      className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                    />
                    <div className="grid grid-cols-6 gap-2">
                      {PET_AVATAR_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, avatarUrl: preset.url }))
                          }
                          title={preset.label}
                          className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                            form.avatarUrl === preset.url
                              ? 'border-teal-600 ring-2 ring-teal-500/25'
                              : 'border-slate-200'
                          }`}
                        >
                          <Image
                            src={preset.url}
                            alt={preset.label}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Thông tin chủ nuôi
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Họ tên chủ nuôi *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.ownerName}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, ownerName: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          required
                          value={form.ownerPhone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, ownerPhone: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health & Grooming Notes */}
                  <div className="space-y-3 rounded-2xl border border-teal-100 bg-[#F0FDFA]/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Hồ sơ sức khỏe &amp; Ghi chú chăm sóc (Groomer)
                    </p>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Dị ứng thức ăn / sữa tắm
                      </label>
                      <input
                        type="text"
                        value={form.allergies}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, allergies: e.target.value }))
                        }
                        placeholder="VD: Dị ứng sữa tắm hương liệu nồng, ngũ cốc..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Tính cách &amp; Thói quen
                      </label>
                      <input
                        type="text"
                        value={form.temperament}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, temperament: e.target.value }))
                        }
                        placeholder="VD: Hiền lành, nhát tiếng máy sấy lớn..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Tình trạng da lông / Bệnh lý nền
                      </label>
                      <textarea
                        rows={3}
                        value={form.healthNotes}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, healthNotes: e.target.value }))
                        }
                        placeholder="Ghi chú tình trạng da, lịch sử tiêm phòng hoặc yêu cầu đặc biệt..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => (pet ? setIsEditing(false) : onClose())}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-60"
                    >
                      {saving
                        ? 'Đang lưu...'
                        : pet
                          ? 'Lưu thay đổi'
                          : 'Tạo hồ sơ bé'}
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW MODE: HEALTH CARD + VISIT LOGS TIMELINE */
                pet && (
                  <div className="space-y-6">
                    {/* Profile Header Card */}
                    <div className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-[#F0FDFA] to-white p-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-sm">
                        <Image
                          src={pet.avatarUrl}
                          alt={pet.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold text-slate-900">
                            {pet.name}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              pet.visitCount >= 3
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {pet.visitCount >= 3
                              ? `Khách VIP • ${pet.visitCount} lần`
                              : `Đã đến ${pet.visitCount} lần`}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                          {pet.species === 'dog' ? 'Chó' : 'Mèo'} • {pet.breed}{' '}
                          • {pet.gender === 'female' ? 'Cái' : 'Đực'} •{' '}
                          {pet.ageText}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-teal-700 shadow-2xs ring-1 ring-teal-100">
                            <Scale className="h-3.5 w-3.5" />
                            {pet.weightKg} kg
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs ring-1 ring-slate-200/80">
                            <User className="h-3.5 w-3.5 text-indigo-600" />
                            {pet.ownerName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs ring-1 ring-slate-200/80">
                            <Phone className="h-3.5 w-3.5 text-teal-600" />
                            {pet.ownerPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Health & Advisory Alerts */}
                    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <HeartPulse className="h-4 w-4 text-teal-600" />
                        <span>Lưu ý sức khỏe &amp; Tư vấn chăm sóc</span>
                      </p>

                      {pet.allergies && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3.5 py-2.5 text-xs text-rose-800">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                          <div>
                            <strong className="font-bold">Dị ứng:</strong>{' '}
                            {pet.allergies}
                          </div>
                        </div>
                      )}

                      {pet.temperament && (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5 text-xs text-indigo-900">
                          <strong className="font-bold">Tính cách:</strong>{' '}
                          {pet.temperament}
                        </div>
                      )}

                      <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-700">
                        <strong className="font-bold text-slate-900">
                          Ghi chú da lông / sức khỏe:
                        </strong>{' '}
                        {pet.healthNotes || 'Chưa có ghi chú đặc biệt.'}
                      </div>
                    </div>

                    {/* Visit History Timeline + Add Log Button */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <CalendarClock className="h-4 w-4 text-teal-600" />
                          <span>
                            Lịch sử sử dụng dịch vụ ({pet.visitHistory.length})
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAddVisit((prev) => !prev)}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Ghi nhận buổi mới</span>
                        </button>
                      </div>

                      {showAddVisit && (
                        <form
                          onSubmit={handleAddVisit}
                          className="mb-4 space-y-3 rounded-2xl border border-teal-200 bg-[#F0FDFA] p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                                Ngày chăm sóc
                              </label>
                              <input
                                type="date"
                                value={visitForm.date}
                                onChange={(e) =>
                                  setVisitForm((v) => ({
                                    ...v,
                                    date: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                                Cân nặng ghi nhận (kg)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={visitForm.weightKgAtVisit}
                                onChange={(e) =>
                                  setVisitForm((v) => ({
                                    ...v,
                                    weightKgAtVisit: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                                Loại hình
                              </label>
                              <select
                                value={visitForm.serviceType}
                                onChange={(e) =>
                                  setVisitForm((v) => ({
                                    ...v,
                                    serviceType: e.target.value as BookingType,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                              >
                                <option value="spa">Spa &amp; Grooming</option>
                                <option value="hotel">Khách sạn Thú cưng</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                                Tên dịch vụ
                              </label>
                              <input
                                type="text"
                                required
                                value={visitForm.serviceName}
                                onChange={(e) =>
                                  setVisitForm((v) => ({
                                    ...v,
                                    serviceName: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                              Ghi chú của Groomer / Nhân viên
                            </label>
                            <textarea
                              rows={2}
                              value={visitForm.staffNote}
                              onChange={(e) =>
                                setVisitForm((v) => ({
                                  ...v,
                                  staffNote: e.target.value,
                                }))
                              }
                              placeholder="VD: Tình trạng da lông hôm nay, phản ứng khi sấy, lưu ý lần tới..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddVisit(false)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={saving}
                              className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                              Lưu nhật ký
                            </button>
                          </div>
                        </form>
                      )}

                      {pet.visitHistory.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500">
                          Chưa có nhật ký buổi chăm sóc nào.
                        </p>
                      ) : (
                        <ol className="relative space-y-4 border-l-2 border-teal-100 pl-5">
                          {pet.visitHistory.map((log) => {
                            const statusMeta = log.status
                              ? BOOKING_STATUS_META[log.status]
                              : null;
                            return (
                              <li key={log.id} className="relative">
                                <span
                                  className={`absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                                    log.serviceType === 'spa'
                                      ? 'bg-teal-600'
                                      : 'bg-indigo-600'
                                  }`}
                                />
                                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                                      {log.serviceType === 'spa' ? (
                                        <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                                      ) : (
                                        <Home className="h-3.5 w-3.5 text-indigo-600" />
                                      )}
                                      {log.serviceName}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {formatDateVi(log.date)}
                                    </span>
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                      Cân nặng: {log.weightKgAtVisit}kg
                                    </span>
                                    {log.bookingCode && (
                                      <span className="font-mono text-indigo-600">
                                        {log.bookingCode}
                                      </span>
                                    )}
                                    {statusMeta && (
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badgeClass}`}
                                      >
                                        {statusMeta.label}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                    {log.staffNote}
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
