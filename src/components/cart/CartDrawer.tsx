'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatVnd } from '@/lib/utils';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    shippingFee,
    totalAmount,
  } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs"
          />

          {/* Slide-over panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            aria-label="Giỏ hàng nhanh"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Giỏ hàng của bạn
                  </h2>
                  <p className="text-xs text-slate-500">
                    Miễn phí vận chuyển cho đơn từ 500.000₫
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng giỏ hàng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">
                    Giỏ hàng đang trống
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Khám phá thức ăn dinh dưỡng, sữa tắm thảo mộc và đồ chơi cho
                    bé yêu nhé!
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  >
                    <span>Đi tới Cửa hàng</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={closeDrawer}
                            className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-teal-600"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Phân loại: {item.variantLabel}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-teal-700">
                            {formatVnd(item.unitPrice)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.variantId,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1 text-slate-600 hover:text-teal-600"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-slate-800">
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
                                className="p-1 text-slate-600 hover:text-teal-600 disabled:opacity-40"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.productId, item.variantId)
                              }
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Totals */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-slate-900">
                      {formatVnd(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-emerald-600">
                      {shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                    <span>Tổng thanh toán</span>
                    <span className="text-teal-700">
                      {formatVnd(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Xem giỏ hàng
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                  >
                    <span>Thanh toán</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
