'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { formatVnd } from '@/lib/utils';
import { orderService } from '@/services/orderService';
import type { OrderDto } from '@/types';

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Vui lòng nhập họ tên người nhận'),
  customerPhone: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      'Số điện thoại Việt Nam không hợp lệ'
    ),
  shippingAddress: z
    .string()
    .trim()
    .min(10, 'Vui lòng nhập địa chỉ giao hàng chi tiết'),
  note: z.string().max(300).optional(),
  paymentMethod: z.enum(['cod', 'qr_transfer']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutClient() {
  const { items, subtotal, shippingFee, totalAmount, clearCart } = useCart();
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      shippingAddress: '',
      note: '',
      paymentMethod: 'cod',
    },
  });

  const selectedPayment = watch('paymentMethod');

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await orderService.create({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        shippingAddress: values.shippingAddress,
        note: values.note || undefined,
        paymentMethod: values.paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          productSlug: i.slug,
          imageUrl: i.imageUrl,
          variantLabel: i.variantLabel,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
        subtotal,
        shippingFee,
        totalAmount,
      });

      if (res.success) {
        setCreatedOrder(res.data);
        clearCart();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-teal-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <span className="mt-4 inline-block rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-700">
            Đặt hàng thành công • Tồn kho đã tự động cập nhật
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Cảm ơn {createdOrder.customerName} đã mua sắm!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Đơn hàng đã được gửi trực tiếp về hệ thống Quản trị PawPalace để
            đóng gói và giao nhanh cho bạn.
          </p>

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Mã đơn hàng
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-widest text-indigo-700">
              {createdOrder.orderCode}
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-5 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận</span>
              <span className="font-semibold text-slate-900">
                {createdOrder.customerName} — {createdOrder.customerPhone}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-slate-500">Địa chỉ</span>
              <span className="text-right font-medium text-slate-800">
                {createdOrder.shippingAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thanh toán</span>
              <span className="font-semibold text-slate-900">
                {createdOrder.paymentMethod === 'cod'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : 'Chuyển khoản QR'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-extrabold">
              <span>Tổng thanh toán</span>
              <span className="text-teal-700">
                {formatVnd(createdOrder.totalAmount)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/orders"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Xem đơn trong Quản trị Admin
            </Link>
            <Link
              href="/shop"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900">
            Chưa có sản phẩm để thanh toán
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành đặt hàng.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Quay lại Cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Thanh toán đơn hàng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hoàn tất thông tin giao hàng — tồn kho sẽ tự động cập nhật ngay khi
          đặt hàng.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-8 lg:grid-cols-12"
      >
        {/* Left: Shipping & Payment */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Thông tin giao hàng
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Minh Anh"
                  {...register('customerName')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  {...register('customerPhone')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Địa chỉ giao hàng chi tiết *
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  {...register('shippingAddress')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {errors.shippingAddress && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {errors.shippingAddress.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Ghi chú giao hàng (không bắt buộc)
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                  {...register('note')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Phương thức thanh toán
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  selectedPayment === 'cod'
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-teal-200'
                }`}
              >
                <input
                  type="radio"
                  value="cod"
                  {...register('paymentMethod')}
                  className="mt-1 accent-teal-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Truck className="h-4 w-4 text-teal-600" />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Kiểm tra sản phẩm rồi mới thanh toán tiền mặt cho shipper.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  selectedPayment === 'qr_transfer'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <input
                  type="radio"
                  value="qr_transfer"
                  {...register('paymentMethod')}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <QrCode className="h-4 w-4 text-indigo-600" />
                    <span>Chuyển khoản QR 24/7</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Quét mã VietQR xác nhận tự động nhanh chóng, an toàn.
                  </p>
                </div>
              </label>
            </div>

            {selectedPayment === 'qr_transfer' && (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-[#EFF6FF] p-4 text-xs text-slate-700">
                <p className="font-bold text-indigo-800">
                  Thông tin chuyển khoản PawPalace
                </p>
                <ul className="mt-2 space-y-1">
                  <li>
                    Ngân hàng: <strong>Vietcombank (VCB)</strong>
                  </li>
                  <li>
                    Số tài khoản: <strong>1028 6868 8888</strong>
                  </li>
                  <li>
                    Chủ tài khoản: <strong>CÔNG TY TNHH PAWPALACE VN</strong>
                  </li>
                  <li>
                    Nội dung: <strong>PAWPALACE + Số điện thoại của bạn</strong>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Items Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-teal-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-slate-900">
              Sản phẩm đặt mua ({items.length})
            </h2>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-700">
                    {formatVnd(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">
                  {formatVnd(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-emerald-600">
                  {shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold text-slate-900">
                <span>Tổng thanh toán</span>
                <span className="text-teal-700">{formatVnd(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-60"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>{submitting ? 'Đang tạo đơn hàng...' : 'Đặt hàng ngay'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
