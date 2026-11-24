import Link from 'next/link';
import { Clock, Mail, MapPin, PawPrint, Phone, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-teal-100 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white">
                <PawPrint className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Paw<span className="text-teal-600">Palace</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Hệ sinh thái chăm sóc thú cưng chuẩn y khoa: Spa &amp; Grooming hữu
              cơ, Khách sạn thú cưng Camera 24/7 và Cửa hàng dinh dưỡng chính
              hãng cho chó mèo.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Quy trình khử khuẩn chuẩn phòng khám</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              Dịch vụ nổi bật
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/services"
                  className="transition-colors hover:text-teal-600"
                >
                  Spa &amp; Grooming cho Chó / Mèo
                </Link>
              </li>
              <li>
                <Link
                  href="/pet-hotel"
                  className="transition-colors hover:text-teal-600"
                >
                  Khách sạn thú cưng 24/7
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-teal-600"
                >
                  Cửa hàng Dinh dưỡng &amp; Phụ kiện
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="transition-colors hover:text-teal-600"
                >
                  Đặt lịch chăm sóc trực tuyến
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              Khách hàng &amp; Quản trị
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/cart"
                  className="transition-colors hover:text-teal-600"
                >
                  Giỏ hàng của bạn
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="transition-colors hover:text-teal-600"
                >
                  Thanh toán đơn hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-indigo-600"
                >
                  Cổng Quản trị Chủ Shop (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              Liên hệ PawPalace
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span>68 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-teal-600" />
                <span>028 3888 6868 (Hotline tư vấn)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-teal-600" />
                <span>care@pawpalace.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-teal-600" />
                <span>08:00 – 21:00 (Thứ 2 – Chủ Nhật)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} PawPalace Pet Care &amp; Boutique. Đã đăng ký bản quyền.</p>
          <p>Kiến trúc Next.js App Router • Sẵn sàng tích hợp ASP.NET Core Web API</p>
        </div>
      </div>
    </footer>
  );
}
