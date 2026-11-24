import { CheckoutClient } from '@/components/storefront/CheckoutClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Thanh toán đơn hàng',
  description: 'Hoàn tất thanh toán đơn hàng thú cưng tại PawPalace.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
