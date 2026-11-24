import type {
  ApiResponse,
  AuthResponseDto,
  LoginRequestDto,
  MemberDto,
  MemberTier,
  RegisterRequestDto,
} from '@/types';
import {
  buildApiResponse,
  fetchApi,
  MOCK_MODE,
  readLocalRepository,
  subscribeDataSync,
  writeLocalRepository,
} from './apiClient';

export const MEMBERS_STORAGE_KEY = 'pawpalace_members_v1';
export const AUTH_SESSION_STORAGE_KEY = 'pawpalace_auth_session_v1';

interface StoredMemberRecord extends MemberDto {
  password: string;
}

export const MEMBER_TIER_RULES: Record<
  MemberTier,
  {
    minPoints: number;
    nextTier: MemberTier | null;
    nextTierPoints: number | null;
    discountPercent: number;
    label: string;
  }
> = {
  Silver: {
    minPoints: 0,
    nextTier: 'Gold',
    nextTierPoints: 500,
    discountPercent: 5,
    label: 'Hạng Bạc (Silver)',
  },
  Gold: {
    minPoints: 500,
    nextTier: 'Diamond',
    nextTierPoints: 1500,
    discountPercent: 10,
    label: 'Hạng Vàng (Gold)',
  },
  Diamond: {
    minPoints: 1500,
    nextTier: null,
    nextTierPoints: null,
    discountPercent: 15,
    label: 'Hạng Kim Cương (Diamond)',
  },
};

export function resolveTierAndDiscount(points: number): {
  tier: MemberTier;
  discountPercent: number;
} {
  if (points >= 1500) {
    return { tier: 'Diamond', discountPercent: 15 };
  }
  if (points >= 500) {
    return { tier: 'Gold', discountPercent: 10 };
  }
  return { tier: 'Silver', discountPercent: 5 };
}

export const DEMO_ACCOUNT_CREDENTIALS = {
  identifier: '0901234567',
  password: 'pawpalace123',
};

const SEED_MEMBERS: StoredMemberRecord[] = [
  {
    id: 'mem-demo-01',
    memberCode: 'PP-MEM-2026',
    fullName: 'Nguyễn Trọng Nghĩa',
    phone: '0901234567',
    email: 'nghia@pawpalace.vn',
    password: 'pawpalace123',
    petName: 'Mochi',
    petSpecies: 'dog',
    points: 150,
    tier: 'Silver',
    discountPercent: 5,
    joinedAt: '2026-10-15T09:00:00Z',
    pointHistory: [
      {
        id: 'ph-03',
        title: 'Hoàn thành Combo Tắm Vệ Sinh Toàn Diện',
        description: 'Tích điểm dịch vụ Spa cho bé Mochi',
        pointsDelta: 30,
        category: 'spa',
        createdAt: '2026-11-20T14:30:00Z',
      },
      {
        id: 'ph-02',
        title: 'Mua Hạt Royal Canin Mini Adult 2kg',
        description: 'Tích điểm đơn hàng cửa hàng PawPalace',
        pointsDelta: 20,
        category: 'shop',
        createdAt: '2026-11-08T10:15:00Z',
      },
      {
        id: 'ph-01',
        title: 'Quà tặng chào mừng Thành viên mới',
        description: 'Thưởng kích hoạt tài khoản PawPalace Club',
        pointsDelta: 100,
        category: 'bonus',
        createdAt: '2026-10-15T09:00:00Z',
      },
    ],
  },
];

function stripPassword(record: StoredMemberRecord): MemberDto {
  const { password: _password, ...member } = record;
  void _password;
  return member;
}

interface IAuthRepository {
  login(payload: LoginRequestDto): Promise<ApiResponse<AuthResponseDto | null>>;
  register(
    payload: RegisterRequestDto
  ): Promise<ApiResponse<AuthResponseDto | null>>;
  getCurrentMember(): Promise<ApiResponse<MemberDto | null>>;
  logout(): Promise<ApiResponse<boolean>>;
}

const mockAuthRepository: IAuthRepository = {
  async login(payload: LoginRequestDto) {
    const members = readLocalRepository<StoredMemberRecord[]>(
      MEMBERS_STORAGE_KEY,
      SEED_MEMBERS
    );

    const normalizedId = payload.identifier.trim().toLowerCase();
    const matched = members.find(
      (m) =>
        (m.phone.toLowerCase() === normalizedId ||
          (m.email && m.email.toLowerCase() === normalizedId)) &&
        m.password === payload.password
    );

    if (!matched) {
      return buildApiResponse(
        null,
        'Số điện thoại/Email hoặc mật khẩu không chính xác.',
        false
      );
    }

    const member = stripPassword(matched);
    const session: AuthResponseDto = {
      member,
      accessToken: `mock-jwt-${member.id}-${Date.now()}`,
    };
    writeLocalRepository(AUTH_SESSION_STORAGE_KEY, session);
    return buildApiResponse(session, 'Đăng nhập thành công');
  },

  async register(payload: RegisterRequestDto) {
    const members = readLocalRepository<StoredMemberRecord[]>(
      MEMBERS_STORAGE_KEY,
      SEED_MEMBERS
    );

    const normalizedPhone = payload.phone.trim();
    const normalizedEmail = payload.email?.trim().toLowerCase();

    const phoneExists = members.some((m) => m.phone === normalizedPhone);
    if (phoneExists) {
      return buildApiResponse(
        null,
        'Số điện thoại này đã được đăng ký thành viên PawPalace.',
        false
      );
    }

    if (
      normalizedEmail &&
      members.some((m) => m.email?.toLowerCase() === normalizedEmail)
    ) {
      return buildApiResponse(
        null,
        'Email này đã được sử dụng cho một tài khoản khác.',
        false
      );
    }

    const now = new Date().toISOString();
    const welcomePoints = 100;
    const { tier, discountPercent } = resolveTierAndDiscount(welcomePoints);

    const newRecord: StoredMemberRecord = {
      id: `mem-${Date.now()}`,
      memberCode: `PP-MEM-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: payload.fullName.trim(),
      phone: normalizedPhone,
      email: normalizedEmail || undefined,
      password: payload.password,
      petName: payload.petName?.trim() || undefined,
      petSpecies: payload.petSpecies || 'dog',
      points: welcomePoints,
      tier,
      discountPercent,
      joinedAt: now,
      pointHistory: [
        {
          id: `ph-${Date.now()}`,
          title: 'Quà tặng chào mừng Thành viên mới',
          description: 'Tặng ngay 100 điểm thưởng khi đăng ký PawPalace Club',
          pointsDelta: welcomePoints,
          category: 'bonus',
          createdAt: now,
        },
      ],
    };

    writeLocalRepository(MEMBERS_STORAGE_KEY, [newRecord, ...members]);

    const member = stripPassword(newRecord);
    const session: AuthResponseDto = {
      member,
      accessToken: `mock-jwt-${member.id}-${Date.now()}`,
    };
    writeLocalRepository(AUTH_SESSION_STORAGE_KEY, session);
    return buildApiResponse(
      session,
      'Đăng ký thành công! Bạn được tặng 100 điểm thưởng chào mừng.'
    );
  },

  async getCurrentMember() {
    if (typeof window === 'undefined') {
      return buildApiResponse(null, 'Chưa đăng nhập', true);
    }
    try {
      const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) return buildApiResponse(null, 'Chưa đăng nhập', true);
      const session = JSON.parse(raw) as AuthResponseDto;
      if (!session?.member) {
        return buildApiResponse(null, 'Chưa đăng nhập', true);
      }

      // Sync latest member record from members repository if present
      const members = readLocalRepository<StoredMemberRecord[]>(
        MEMBERS_STORAGE_KEY,
        SEED_MEMBERS
      );
      const latest = members.find((m) => m.id === session.member.id);
      return buildApiResponse(
        latest ? stripPassword(latest) : session.member,
        'Lấy thông tin thành viên thành công'
      );
    } catch {
      return buildApiResponse(null, 'Chưa đăng nhập', true);
    }
  },

  async logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('pawpalace:data-updated', {
          detail: { key: AUTH_SESSION_STORAGE_KEY },
        })
      );
    }
    return buildApiResponse(true, 'Đã đăng xuất');
  },
};

const apiAuthRepository: IAuthRepository = {
  login: (payload) =>
    fetchApi<AuthResponseDto | null>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    fetchApi<AuthResponseDto | null>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCurrentMember: () => fetchApi<MemberDto | null>('/auth/me'),
  logout: () =>
    fetchApi<boolean>('/auth/logout', {
      method: 'POST',
    }),
};

export const authService = {
  ...(MOCK_MODE ? mockAuthRepository : apiAuthRepository),
  subscribe(callback: () => void) {
    return subscribeDataSync(AUTH_SESSION_STORAGE_KEY, callback);
  },
};
