import {
  Award,
  CheckCircle2,
  Crown,
  Gift,
  Sparkles,
} from 'lucide-react';

const TIERS = [
  {
    name: 'Silver',
    range: '0 – 499 điểm',
    discount: 'Giảm 5%',
    badgeClass: 'bg-white/15 text-teal-50 border-white/25',
  },
  {
    name: 'Gold',
    range: '500 – 1.499 điểm',
    discount: 'Giảm 10%',
    badgeClass: 'bg-sky-400/20 text-white border-sky-200/40',
  },
  {
    name: 'Diamond',
    range: 'Từ 1.500 điểm',
    discount: 'Giảm 15%',
    badgeClass: 'bg-indigo-400/30 text-white border-indigo-200/50',
  },
];

const PERKS = [
  'Tặng ngay 100 điểm thưởng chào mừng khi tạo tài khoản mới.',
  'Tích điểm tự động cho mọi lần đặt lịch Spa, Khách sạn 24/7 và mua sắm tại cửa hàng.',
  'Giảm giá trực tiếp từ 5% đến 15% theo hạng thẻ Silver → Gold → Diamond.',
  'Ưu tiên giữ khung giờ Spa cuối tuần và quà tặng sinh nhật dành riêng cho bé.',
];

export function MembershipBenefitsPanel() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-indigo-700 p-8 text-white shadow-card sm:p-10">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-teal-50 backdrop-blur-xs">
          <Crown className="h-3.5 w-3.5" />
          <span>PawPalace Member Club</span>
        </span>

        <h2 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">
          Đặc quyền hội viên dành riêng cho ba mẹ yêu thú cưng
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-teal-50/90">
          Mỗi buổi Spa thư giãn, kỳ nghỉ Khách sạn 24/7 hay đơn hàng dinh dưỡng
          đều tích lũy điểm thưởng giúp nâng hạng thẻ và tiết kiệm dài lâu.
        </p>

        {/* Tier Ladder */}
        <div className="mt-7 grid grid-cols-3 gap-2.5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-3 text-center backdrop-blur-xs ${tier.badgeClass}`}
            >
              <Award className="mx-auto h-4.5 w-4.5 opacity-90" />
              <p className="mt-1.5 text-sm font-bold">{tier.name}</p>
              <p className="mt-0.5 text-xs font-semibold text-teal-100">
                {tier.discount}
              </p>
              <p className="mt-0.5 text-[10px] opacity-80">{tier.range}</p>
            </div>
          ))}
        </div>

        {/* Perks List */}
        <ul className="mt-7 space-y-3">
          {PERKS.map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-2.5 text-sm text-teal-50"
            >
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-300" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Highlight Card */}
      <div className="mt-8 flex items-center gap-3.5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
          <Gift className="h-5 w-5" />
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ưu đãi thành viên mới</span>
          </p>
          <p className="mt-0.5 text-xs text-white/90">
            Đăng ký miễn phí hôm nay — nhận ngay <strong>+100 điểm</strong> và
            giảm ngay <strong>5%</strong> cho đơn đầu tiên.
          </p>
        </div>
      </div>
    </div>
  );
}
