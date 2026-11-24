import { RegisterClient } from '@/components/auth/RegisterClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Đăng ký Thành viên PawPalace — Nhận 100 Điểm Thưởng',
  description:
    'Đăng ký miễn phí thành viên PawPalace Club để nhận ngay 100 điểm thưởng chào mừng và ưu đãi giảm giá lên đến 15% cho Spa, Khách sạn thú cưng & Cửa hàng.',
  path: '/register',
});

export default function RegisterPage() {
  return <RegisterClient />;
}
