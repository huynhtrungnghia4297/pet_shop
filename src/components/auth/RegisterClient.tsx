'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  PawPrint,
  Phone,
  User,
  UserPlus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MembershipBenefitsPanel } from '@/components/auth/MembershipBenefitsPanel';
import { FadeInUp } from '@/components/motion/MotionPrimitives';
import { useAuth } from '@/context/AuthContext';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Vui lòng nhập họ tên đầy đủ (tối thiểu 2 ký tự)'),
    phone: z
      .string()
      .trim()
      .regex(
        /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
        'Số điện thoại Việt Nam không hợp lệ (VD: 0912345678)'
      ),
    email: z
      .string()
      .trim()
      .email('Email không đúng định dạng')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
    petName: z.string().trim().max(40, 'Tên thú cưng tối đa 40 ký tự').optional(),
    petSpecies: z.enum(['dog', 'cat']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterClient() {
  const router = useRouter();
  const { register: registerMember } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      petName: '',
      petSpecies: 'dog',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await registerMember({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        password: values.password,
        petName: values.petName || undefined,
        petSpecies: values.petSpecies,
      });

      if (res.success && res.data) {
        router.push('/member?welcome=1');
      } else {
        setErrorMessage(res.message || 'Không thể đăng ký lúc này.');
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

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft sm:p-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-700">
                <Gift className="h-3.5 w-3.5" />
                <span>Tặng ngay +100 điểm thưởng chào mừng</span>
              </span>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Đăng ký Thành viên PawPalace
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Hoàn tất trong 30 giây để kích hoạt thẻ hội viên Silver và tích
                điểm ngay hôm nay.
              </p>
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
              className="mt-6 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Minh Anh"
                      {...register('fullName')}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="0912345678"
                      {...register('phone')}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email (không bắt buộc)
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="ban@email.com"
                    {...register('email')}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự"
                      {...register('password')}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700"
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

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Xác nhận mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      {...register('confirmPassword')}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Pet Info */}
              <div className="rounded-2xl border border-teal-100 bg-[#F0FDFA]/70 p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <PawPrint className="h-4 w-4 text-teal-600" />
                  <span>Thông tin bé cưng của bạn (giúp cá nhân hóa ưu đãi)</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Tên bé cưng
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Mochi, Bơ, Bông..."
                      {...register('petName')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Loài thú cưng
                    </label>
                    <select
                      {...register('petSpecies')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    >
                      <option value="dog">Chó</option>
                      <option value="cat">Mèo</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-60"
              >
                <UserPlus className="h-4.5 w-4.5" />
                <span>
                  {submitting
                    ? 'Đang tạo tài khoản...'
                    : 'Đăng ký & Nhận ngay 100 điểm thưởng'}
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Đã là thành viên PawPalace?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
