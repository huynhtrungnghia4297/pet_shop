import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Quản trị hệ thống PawPalace',
  description: 'Khu vực quản trị sản phẩm, lịch hẹn Spa/Khách sạn và đơn hàng PawPalace.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
