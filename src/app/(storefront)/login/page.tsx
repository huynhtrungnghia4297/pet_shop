import { LoginClient } from '@/components/auth/LoginClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Đăng nhập Thành viên PawPalace',
  description:
    'Đăng nhập tài khoản hội viên PawPalace để theo dõi điểm thưởng, hạng thẻ Silver/Gold/Diamond và nhận ưu đãi giảm giá đến 15%.',
  path: '/login',
});

export default function LoginPage() {
  return <LoginClient />;
}
