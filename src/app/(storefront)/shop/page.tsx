import { ShoppingBag } from 'lucide-react';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { ShopCatalogClient } from '@/components/storefront/ShopCatalogClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Cửa Hàng Thức Ăn, Sữa Tắm, Quần Áo & Đồ Chơi Thú Cưng',
  description:
    'Mua sắm thức ăn dinh dưỡng, sữa tắm thảo mộc, quần áo phụ kiện và đồ chơi chính hãng cho chó mèo tại PawPalace. Miễn phí giao hàng đơn từ 500.000₫.',
  path: '/shop',
});

export default function ShopPage() {
  return (
    <>
      <section className="border-b border-teal-100 bg-gradient-to-b from-[#F0FDFA] to-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInUp>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>100% Chính Hãng • Miễn Phí Ship Đơn Từ 500.000₫</span>
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cửa hàng Dinh dưỡng &amp; Phụ kiện Thú cưng
            </h1>
            <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-600 sm:text-base">
              Lọc nhanh theo danh mục, đối tượng chó mèo và khoảng giá để tìm
              đúng sản phẩm bé yêu thích.
            </p>
          </FadeInUp>
        </div>
      </section>

      <ShopCatalogClient />
    </>
  );
}
