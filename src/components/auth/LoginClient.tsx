'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MembershipBenefitsPanel } from '@/components/auth/MembershipBenefitsPanel';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, 'Vui lòng nhập số điện thoại hoặc email đã đăng ký'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginClient() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await login(values);
      if (res.success && res.data) {
        router.push('/member');
      } else {
        setErrorMessage(
          res.message || 'Thông tin đăng nhập không chính xác.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await loginDemo();
      if (res.success && res.data) {
        router.push('/member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <FadeInUp className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column: Membership Benefits */}
        <div className="lg:col-span-5">
          <MembershipBenefitsPanel />
        </div>

        {/* Right Column: Login Form */}
        <div className="lg:col-span-7">
          <div className="flex h-full flex-col justify-center rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft sm:p-10">
            <div>
              <span className="inline-block rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                Chào mừng trở lại
              </span>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Đăng nhập Thành viên PawPalace
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Theo dõi điểm tích lũy, hạng thẻ và hưởng ưu đãi giảm giá tự
                động khi đặt lịch &amp; mua sắm.
              </p>
            </div>

            {/* 1-Click Demo Account Box */}
            <div className="mt-6 rounded-2xl border border-teal-200/80 bg-[#F0FDFA] p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span>Trải nghiệm nhanh tài khoản Demo</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Nguyễn Trọng Nghĩa • <strong>0901234567</strong> • 150 điểm
                    (Silver)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDemoLogin()}
                  disabled={submitting}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-700 disabled:opacity-60"
                >
                  <span>Đăng nhập 1-Click</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-800"
              >
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="login-identifier"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Số điện thoại hoặc Email *
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="VD: 0901234567 hoặc nghia@pawpalace.vn"
                    {...register('identifier')}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của bạn"
                    {...register('password')}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-11 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Chưa có tài khoản thành viên?{' '}
              <Link
                href="/register"
                className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
              >
                Đăng ký nhận ngay 100 điểm thưởng →
              </Link>
            </p>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
