'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  Crown,
  Eye,
  HeartPulse,
  PawPrint,
  Phone,
  Plus,
  Scale,
  Search,
  Sparkles,
} from 'lucide-react';
import { PetProfileDrawer } from '@/components/admin/PetProfileDrawer';
import { formatDateVi } from '@/lib/utils';
import { petService } from '@/services/petService';
import type { PetProfileDto } from '@/types';

export function AdminPetsClient() {
  const [pets, setPets] = useState<PetProfileDto[]>([]);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>(
    'all'
  );
  const [vipOnly, setVipOnly] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetProfileDto | null>(null);

  const loadPets = useCallback(async () => {
    const res = await petService.getAll();
    if (res.success) {
      setPets(res.data);
      // Keep open drawer pet synced if updated
      setSelectedPet((prev) =>
        prev ? res.data.find((p) => p.id === prev.id) ?? prev : null
      );
    }
  }, []);

  useEffect(() => {
    void loadPets();
    return petService.subscribe(() => void loadPets());
  }, [loadPets]);

  const filteredPets = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return pets.filter((pet) => {
      if (kw) {
        const hay = `${pet.name} ${pet.breed} ${pet.ownerName} ${pet.ownerPhone} ${pet.petCode}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (speciesFilter !== 'all' && pet.species !== speciesFilter) {
        return false;
      }
      if (vipOnly && pet.visitCount < 3) return false;
      return true;
    });
  }, [pets, search, speciesFilter, vipOnly]);

  const vipCount = useMemo(
    () => pets.filter((p) => p.visitCount >= 3).length,
    [pets]
  );
  const allergyCount = useMemo(
    () =>
      pets.filter(
        (p) =>
          p.allergies &&
          !p.allergies.toLowerCase().includes('không ghi nhận')
      ).length,
    [pets]
  );

  const openCreateDrawer = () => {
    setSelectedPet(null);
    setDrawerOpen(true);
  };

  const openPetDetail = (pet: PetProfileDto) => {
    setSelectedPet(pet);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Hồ sơ Thú cưng (Pet CRM)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi cân nặng, cảnh báo dị ứng, tính cách và lịch sử Spa/Khách
            sạn được đồng bộ tự động từ lịch hẹn.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Thêm hồ sơ bé mới</span>
        </button>
      </div>

      {/* Quick CRM Stats Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <PawPrint className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng hồ sơ bé</p>
            <p className="text-xl font-extrabold text-slate-900">
              {pets.length} bé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Khách VIP thân thiết (≥ 3 lần)
            </p>
            <p className="text-xl font-extrabold text-indigo-700">
              {vipCount} bé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Cần lưu ý dị ứng / da nhạy cảm
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {allergyCount} bé
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bé, giống, tên chủ nuôi hoặc số điện thoại..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all' as const, label: 'Tất cả loài' },
            { id: 'dog' as const, label: 'Chó' },
            { id: 'cat' as const, label: 'Mèo' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setSpeciesFilter(btn.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                speciesFilter === btn.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setVipOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              vipOnly
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Khách VIP (≥ 3 lần)</span>
          </button>
        </div>
      </div>

      {/* Pet CRM Cards Grid */}
      {filteredPets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Không tìm thấy hồ sơ thú cưng phù hợp bộ lọc.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredPets.map((pet) => {
            const hasAllergyAlert =
              pet.allergies &&
              !pet.allergies.toLowerCase().includes('không ghi nhận');
            const isVip = pet.visitCount >= 3;

            return (
              <article
                key={pet.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all hover:border-teal-200 hover:shadow-card"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                      <Image
                        src={pet.avatarUrl}
                        alt={`${pet.name} - ${pet.breed}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-slate-900">
                            {pet.name}
                          </h2>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {pet.species === 'dog' ? 'Chó' : 'Mèo'}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isVip
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                          }`}
                        >
                          {isVip && <Crown className="h-3 w-3" />}
                          <span>
                            {isVip
                              ? `Khách VIP • ${pet.visitCount} lần`
                              : `Đã đến ${pet.visitCount} lần`}
                          </span>
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs font-medium text-slate-600">
                        {pet.breed} • {pet.gender === 'female' ? 'Cái' : 'Đực'}{' '}
                        • {pet.ageText}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                          <Scale className="h-3.5 w-3.5" />
                          {pet.weightKg} kg
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-indigo-500" />
                          <strong className="text-slate-800">
                            {pet.ownerName}
                          </strong>{' '}
                          • {pet.ownerPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Advisory Alert Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hasAllergyAlert && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{pet.allergies}</span>
                      </span>
                    )}
                    {pet.temperament && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/70 bg-amber-50/70 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>{pet.temperament}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <span className="text-[11px] text-slate-500">
                    Ghé gần nhất:{' '}
                    <strong className="text-slate-700">
                      {formatDateVi(pet.lastVisitDate)}
                    </strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => openPetDetail(pet)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-600 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Xem hồ sơ &amp; Lịch sử</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Slide-over Pet CRM Drawer */}
      <PetProfileDrawer
        isOpen={drawerOpen}
        pet={selectedPet}
        onClose={() => setDrawerOpen(false)}
        onSaved={(saved) => {
          setSelectedPet(saved);
          void loadPets();
        }}
      />
    </div>
  );
}
