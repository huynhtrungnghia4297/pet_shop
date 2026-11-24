import { CartPageClient } from '@/components/storefront/CartPageClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Giỏ hàng',
  description: 'Quản lý sản phẩm trong giỏ hàng của bạn tại PawPalace.',
  path: '/cart',
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
