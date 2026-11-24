import { Suspense } from 'react';
import { MemberProfileClient } from '@/components/auth/MemberProfileClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Hồ sơ Thành viên & Điểm thưởng',
  description:
    'Xem thẻ thành viên ảo PawPalace, hạng thẻ Silver/Gold/Diamond, tiến trình lên hạng và lịch sử tích điểm.',
  path: '/member',
  noIndex: true,
});

export default function MemberPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-slate-500">
          Đang tải hồ sơ thành viên...
        </div>
      }
    >
      <MemberProfileClient />
    </Suspense>
  );
}
