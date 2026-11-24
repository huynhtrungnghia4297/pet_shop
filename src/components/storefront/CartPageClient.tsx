'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatVnd } from '@/lib/utils';

export function CartPageClient() {
  const {
    items,
    subtotal,
    shippingFee,
    totalAmount,
    updateQuantity,
    removeItem,
  } = useCart();

  const remainingForFreeShip = Math.max(0, 500000 - subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Hãy chọn thêm hạt dinh dưỡng, sữa tắm thảo mộc hoặc phụ kiện xinh
            xắn cho bé nhé.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <span>Khám phá Cửa hàng</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra lại số lượng và phân loại sản phẩm trước khi thanh toán.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tiếp tục mua sắm</span>
        </Link>
      </div>

      {/* Free Shipping Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-100 bg-[#F0FDFA] px-5 py-3.5 text-sm text-teal-800">
        <Truck className="h-5 w-5 shrink-0 text-teal-600" />
        {remainingForFreeShip === 0 ? (
          <span>
            Tuyệt vời! Đơn hàng của bạn đã đủ điều kiện{' '}
            <strong>Miễn phí vận chuyển toàn quốc</strong>.
          </span>
        ) : (
          <span>
            Mua thêm <strong>{formatVnd(remainingForFreeShip)}</strong> để được{' '}
            <strong>Miễn phí vận chuyển</strong>.
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Items Table */}
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <Link
                  href={`/shop/${item.slug}`}
                  className="text-base font-bold text-slate-900 hover:text-teal-600"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  Phân loại: {item.variantLabel}
                </p>
                <p className="mt-2 text-sm font-bold text-teal-700">
                  {formatVnd(item.unitPrice)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        item.quantity - 1
                      )
                    }
                    className="p-2 text-slate-600 hover:text-teal-600"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        item.quantity + 1
                      )
                    }
                    disabled={item.quantity >= item.maxStock}
                    className="p-2 text-slate-600 hover:text-teal-600 disabled:opacity-40"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-28 text-right text-sm font-extrabold text-slate-900">
                  {formatVnd(item.unitPrice * item.quantity)}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-teal-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">
                  {formatVnd(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng</span>
                <span className="font-semibold text-emerald-600">
                  {shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-teal-700">{formatVnd(totalAmount)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
