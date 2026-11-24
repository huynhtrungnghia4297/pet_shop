'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck2,
  Cat,
  Check,
  Clock,
  Dog,
  Sparkles,
} from 'lucide-react';
import { FadeInUp, ScaleOnHover } from '@/components/motion/MotionPrimitives';
import { SPA_SERVICES } from '@/data/seedData';
import { formatVnd } from '@/lib/utils';

const SPECIES_TABS = [
  { id: 'dog' as const, label: 'Dịch vụ cho Chó', icon: Dog },
  { id: 'cat' as const, label: 'Dịch vụ cho Mèo', icon: Cat },
];

export function SpaServicesClient() {
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat'>('dog');

  const filteredPackages = SPA_SERVICES.filter(
    (pkg) => pkg.petSpecies === selectedSpecies
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Species Switcher with Framer Motion layoutId */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Chọn đối tượng thú cưng"
          className="inline-flex rounded-2xl border border-teal-100 bg-white p-1.5 shadow-soft"
        >
          {SPECIES_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = selectedSpecies === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setSelectedSpecies(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                  active ? 'text-white' : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="spaSpeciesTabIndicator"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-teal-600 shadow-sm"
                  />
                )}
                <Icon className="relative z-10 h-4.5 w-4.5" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Packages Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSpecies}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="mt-10 grid gap-8 lg:grid-cols-2"
        >
          {filteredPackages.map((pkg) => (
            <ScaleOnHover key={pkg.id} liftY={-4} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft transition-shadow hover:border-teal-200 hover:shadow-card">
                {/* Clean Image Frame */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.imageUrl}
                    alt={`${pkg.name} dành cho ${selectedSpecies === 'dog' ? 'Chó' : 'Mèo'} tại PawPalace`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Separated Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Khoảng {pkg.durationMinutes} phút</span>
                    </span>
                    {pkg.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Được chọn nhiều nhất</span>
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {pkg.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {pkg.tagline}
                  </p>

                  {/* Highlights */}
                  <ul className="mt-5 space-y-2.5">
                    {pkg.highlights.map((step) => (
                      <li
                        key={step}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Transparent Weight-Tier Pricing */}
                  <div className="mt-6 rounded-2xl border border-teal-100 bg-[#F0FDFA]/70 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-teal-800">
                      Bảng giá minh bạch theo hạng cân
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {pkg.tiers.map((tier) => (
                        <div
                          key={tier.label}
                          className="rounded-xl border border-white bg-white px-3 py-2.5 text-center shadow-2xs"
                        >
                          <div className="text-[11px] font-medium text-slate-500">
                            {tier.label}
                          </div>
                          <div className="mt-1 text-sm font-bold text-teal-700">
                            {formatVnd(tier.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-2">
                    <Link
                      href={`/booking?type=spa&service=${pkg.id}&pet=${pkg.petSpecies}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                    >
                      <CalendarCheck2 className="h-4.5 w-4.5" />
                      <span>Đặt lịch gói này</span>
                    </Link>
                  </div>
                </div>
              </article>
            </ScaleOnHover>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Summary Pricing Table */}
      <FadeInUp className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            Bảng tổng hợp giá dịch vụ Spa cho{' '}
            {selectedSpecies === 'dog' ? 'Chó' : 'Mèo'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Giá đã bao gồm sữa tắm thảo mộc hữu cơ, không phát sinh phụ phí ẩn.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <th className="rounded-tl-xl px-4 py-3.5">Gói dịch vụ</th>
                <th className="px-4 py-3.5 text-right">Dưới 5kg</th>
                <th className="px-4 py-3.5 text-right">5 – 10kg</th>
                <th className="px-4 py-3.5 text-right">10 – 20kg</th>
                <th className="px-4 py-3.5 text-right">Trên 20kg</th>
                <th className="rounded-tr-xl px-4 py-3.5 text-right">Đặt lịch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-teal-50/30">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {pkg.name}
                  </td>
                  {pkg.tiers.map((tier) => (
                    <td
                      key={tier.label}
                      className="px-4 py-4 text-right font-medium text-slate-700"
                    >
                      {formatVnd(tier.price)}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/booking?type=spa&service=${pkg.id}&pet=${pkg.petSpecies}`}
                      className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-600 hover:text-white"
                    >
                      Chọn gói
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInUp>
    </div>
  );
}
