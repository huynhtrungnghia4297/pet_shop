'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { formatDateVi, formatVnd, ORDER_STATUS_META } from '@/lib/utils';
import { orderService } from '@/services/orderService';
import type { OrderDto, OrderStatus } from '@/types';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'shipping',
  'completed',
  'cancelled',
];

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const res = await orderService.getAll();
    if (res.success) {
      setOrders(res.data);
      if (res.data[0]) {
        setExpandedId((prev) => prev ?? res.data[0].id);
      }
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    return orderService.subscribe(() => void loadOrders());
  }, [loadOrders]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Quản lý Đơn hàng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xem chi tiết sản phẩm khách hàng đặt mua và cập nhật tiến độ giao hàng
          từ Chờ xử lý đến Hoàn thành.
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            statusFilter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả ({orders.length})
        </button>
        {ORDER_STATUSES.map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {ORDER_STATUS_META[st].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Accordion List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            Không có đơn hàng nào thuộc trạng thái này.
          </div>
        ) : (
          filtered.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            const isExpanded = expandedId === order.id;
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft"
              >
                <div className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-700">
                        {order.orderCode}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản QR'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateVi(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {order.customerName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-teal-600" />
                        {order.customerPhone}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-sky-600" />
                        {order.shippingAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] text-slate-500">Tổng tiền</p>
                      <p className="text-lg font-extrabold text-teal-700">
                        {formatVnd(order.totalAmount)}
                      </p>
                    </div>

                    <select
                      aria-label={`Trạng thái đơn ${order.orderCode}`}
                      value={order.status}
                      onChange={(e) =>
                        void handleStatusChange(
                          order.id,
                          e.target.value as OrderStatus
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {ORDER_STATUS_META[st].label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 text-teal-600" />
                      <span>Chi tiết ({order.items.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Danh sách sản phẩm trong đơn
                    </p>
                    <div className="space-y-2.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white p-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {item.productName}
                              </p>
                              <p className="text-slate-500">
                                Phân loại: {item.variantLabel} • SL:{' '}
                                <strong>{item.quantity}</strong> ×{' '}
                                {formatVnd(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-teal-700">
                            {formatVnd(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.note && (
                      <p className="mt-3 text-xs text-slate-600">
                        <strong>Ghi chú khách hàng:</strong> {order.note}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
