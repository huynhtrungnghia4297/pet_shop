import { PET_AVATAR_PRESETS, SEED_PET_PROFILES } from '@/data/seedData';
import type {
  ApiResponse,
  BookingDto,
  CreatePetProfileDto,
  PetProfileDto,
  PetVisitLogDto,
  UpdatePetProfileDto,
} from '@/types';
import {
  buildApiResponse,
  fetchApi,
  MOCK_MODE,
  readLocalRepository,
  subscribeDataSync,
  writeLocalRepository,
} from './apiClient';

export const PETS_STORAGE_KEY = 'pawpalace_pets_v1';

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').trim();
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

interface IPetRepository {
  getAll(): Promise<ApiResponse<PetProfileDto[]>>;
  getById(id: string): Promise<ApiResponse<PetProfileDto | null>>;
  findByOwnerAndName(
    ownerPhone: string,
    petName: string
  ): Promise<ApiResponse<PetProfileDto | null>>;
  create(payload: CreatePetProfileDto): Promise<ApiResponse<PetProfileDto>>;
  update(
    id: string,
    payload: UpdatePetProfileDto
  ): Promise<ApiResponse<PetProfileDto | null>>;
  addVisitLog(
    petId: string,
    log: Omit<PetVisitLogDto, 'id'>
  ): Promise<ApiResponse<PetProfileDto | null>>;
  syncFromBooking(
    booking: BookingDto,
    options?: { staffNote?: string }
  ): Promise<ApiResponse<PetProfileDto>>;
  remove(id: string): Promise<ApiResponse<boolean>>;
}

const mockPetRepository: IPetRepository = {
  async getAll() {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    return buildApiResponse(pets, 'Lấy danh sách hồ sơ thú cưng thành công');
  },

  async getById(id: string) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    const found = pets.find((p) => p.id === id) ?? null;
    return buildApiResponse(
      found,
      found ? 'Tìm thấy hồ sơ thú cưng' : 'Không tìm thấy hồ sơ thú cưng',
      Boolean(found)
    );
  },

  async findByOwnerAndName(ownerPhone: string, petName: string) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    const targetPhone = normalizePhone(ownerPhone);
    const targetName = normalizeName(petName);
    const found =
      pets.find(
        (p) =>
          normalizePhone(p.ownerPhone) === targetPhone &&
          normalizeName(p.name) === targetName
      ) ?? null;
    return buildApiResponse(
      found,
      found ? 'Tìm thấy hồ sơ' : 'Khách hàng mới',
      Boolean(found)
    );
  },

  async create(payload: CreatePetProfileDto) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const defaultAvatar =
      PET_AVATAR_PRESETS.find((a) => a.species === payload.species)?.url ||
      PET_AVATAR_PRESETS[0].url;

    const newPet: PetProfileDto = {
      id: `pet-${Date.now()}`,
      petCode: `PP-PET-${String(pets.length + 1).padStart(3, '0')}`,
      name: payload.name.trim(),
      species: payload.species,
      breed: payload.breed.trim(),
      gender: payload.gender,
      birthDate: payload.birthDate || undefined,
      ageText: payload.ageText.trim() || 'Chưa rõ tuổi',
      weightKg: Number(payload.weightKg),
      avatarUrl: payload.avatarUrl.trim() || defaultAvatar,
      ownerName: payload.ownerName.trim(),
      ownerPhone: normalizePhone(payload.ownerPhone),
      ownerEmail: payload.ownerEmail?.trim() || undefined,
      allergies: payload.allergies?.trim() || undefined,
      temperament: payload.temperament?.trim() || undefined,
      healthNotes: payload.healthNotes?.trim() || undefined,
      visitCount: 1,
      lastVisitDate: today,
      visitHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    writeLocalRepository(PETS_STORAGE_KEY, [newPet, ...pets]);
    return buildApiResponse(newPet, 'Tạo hồ sơ thú cưng mới thành công');
  },

  async update(id: string, payload: UpdatePetProfileDto) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    let updatedPet: PetProfileDto | null = null;
    const nextList = pets.map((pet) => {
      if (pet.id !== id) return pet;
      updatedPet = {
        ...pet,
        ...payload,
        weightKg:
          payload.weightKg !== undefined
            ? Number(payload.weightKg)
            : pet.weightKg,
        updatedAt: new Date().toISOString(),
      };
      return updatedPet;
    });

    if (!updatedPet) {
      return buildApiResponse(null, 'Không tìm thấy hồ sơ thú cưng', false);
    }

    writeLocalRepository(PETS_STORAGE_KEY, nextList);
    return buildApiResponse(updatedPet, 'Cập nhật hồ sơ thú cưng thành công');
  },

  async addVisitLog(petId: string, log: Omit<PetVisitLogDto, 'id'>) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    let updatedPet: PetProfileDto | null = null;
    const newLog: PetVisitLogDto = {
      ...log,
      id: `vl-${Date.now()}`,
    };

    const nextList = pets.map((pet) => {
      if (pet.id !== petId) return pet;
      updatedPet = {
        ...pet,
        weightKg: log.weightKgAtVisit || pet.weightKg,
        visitCount: pet.visitCount + 1,
        lastVisitDate: log.date,
        visitHistory: [newLog, ...pet.visitHistory],
        updatedAt: new Date().toISOString(),
      };
      return updatedPet;
    });

    if (!updatedPet) {
      return buildApiResponse(null, 'Không tìm thấy hồ sơ thú cưng', false);
    }

    writeLocalRepository(PETS_STORAGE_KEY, nextList);
    return buildApiResponse(updatedPet, 'Đã thêm lịch sử chăm sóc cho bé');
  },

  async syncFromBooking(
    booking: BookingDto,
    options?: { staffNote?: string }
  ) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    const now = new Date().toISOString();
    const targetPhone = normalizePhone(booking.ownerPhone);
    const targetName = normalizeName(booking.petName);

    const existingIndex = pets.findIndex(
      (p) =>
        normalizePhone(p.ownerPhone) === targetPhone &&
        normalizeName(p.name) === targetName
    );

    const defaultNote =
      options?.staffNote ||
      (booking.status === 'completed'
        ? `Hoàn thành dịch vụ ${booking.serviceName}. Bé hợp tác tốt.`
        : booking.healthNotes
          ? `Ghi chú khi đặt lịch: ${booking.healthNotes}`
          : `Đặt lịch ${booking.serviceName} qua hệ thống PawPalace.`);

    if (existingIndex > -1) {
      const existing = pets[existingIndex];
      const existingLogIdx = existing.visitHistory.findIndex(
        (v) => v.bookingCode && v.bookingCode === booking.bookingCode
      );

      let nextHistory: PetVisitLogDto[];
      let nextVisitCount = existing.visitCount;

      if (existingLogIdx > -1) {
        nextHistory = existing.visitHistory.map((v, idx) =>
          idx === existingLogIdx
            ? {
                ...v,
                status: booking.status,
                weightKgAtVisit: booking.petWeightKg,
                staffNote: options?.staffNote || v.staffNote,
              }
            : v
        );
      } else {
        const newLog: PetVisitLogDto = {
          id: `vl-${Date.now()}`,
          bookingCode: booking.bookingCode,
          date: booking.appointmentDate,
          serviceType: booking.type,
          serviceName: booking.serviceName,
          weightKgAtVisit: booking.petWeightKg,
          staffNote: defaultNote,
          status: booking.status,
        };
        nextHistory = [newLog, ...existing.visitHistory];
        nextVisitCount = existing.visitCount + 1;
      }

      const updatedPet: PetProfileDto = {
        ...existing,
        weightKg: booking.petWeightKg,
        lastVisitDate: booking.appointmentDate,
        visitCount: nextVisitCount,
        healthNotes:
          booking.healthNotes && !existing.healthNotes
            ? booking.healthNotes
            : existing.healthNotes,
        visitHistory: nextHistory,
        updatedAt: now,
      };

      const nextList = [...pets];
      nextList[existingIndex] = updatedPet;
      writeLocalRepository(PETS_STORAGE_KEY, nextList);
      return buildApiResponse(
        updatedPet,
        'Đã đồng bộ lịch sử chăm sóc cho thú cưng'
      );
    }

    // Create a brand new PetProfileDto automatically for first-time pet
    const fallbackAvatar =
      PET_AVATAR_PRESETS.find((a) => a.species === booking.petSpecies)?.url ||
      PET_AVATAR_PRESETS[0].url;

    const createdPet: PetProfileDto = {
      id: `pet-${Date.now()}`,
      petCode: `PP-PET-${String(pets.length + 1).padStart(3, '0')}`,
      name: booking.petName.trim(),
      species: booking.petSpecies,
      breed: booking.petBreed.trim(),
      gender: 'male',
      ageText: 'Chưa cập nhật tuổi',
      weightKg: booking.petWeightKg,
      avatarUrl: fallbackAvatar,
      ownerName: booking.ownerName.trim(),
      ownerPhone: targetPhone,
      ownerEmail: booking.ownerEmail,
      healthNotes: booking.healthNotes,
      visitCount: 1,
      lastVisitDate: booking.appointmentDate,
      visitHistory: [
        {
          id: `vl-${Date.now()}`,
          bookingCode: booking.bookingCode,
          date: booking.appointmentDate,
          serviceType: booking.type,
          serviceName: booking.serviceName,
          weightKgAtVisit: booking.petWeightKg,
          staffNote: defaultNote,
          status: booking.status,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    writeLocalRepository(PETS_STORAGE_KEY, [createdPet, ...pets]);
    return buildApiResponse(
      createdPet,
      'Đã tự động tạo hồ sơ thú cưng mới từ lịch hẹn'
    );
  },

  async remove(id: string) {
    const pets = readLocalRepository<PetProfileDto[]>(
      PETS_STORAGE_KEY,
      SEED_PET_PROFILES
    );
    writeLocalRepository(
      PETS_STORAGE_KEY,
      pets.filter((p) => p.id !== id)
    );
    return buildApiResponse(true, 'Đã xóa hồ sơ thú cưng');
  },
};

const apiPetRepository: IPetRepository = {
  getAll: () => fetchApi<PetProfileDto[]>('/pets'),
  getById: (id) => fetchApi<PetProfileDto | null>(`/pets/${id}`),
  findByOwnerAndName: (ownerPhone, petName) =>
    fetchApi<PetProfileDto | null>(
      `/pets/lookup?phone=${encodeURIComponent(ownerPhone)}&name=${encodeURIComponent(petName)}`
    ),
  create: (payload) =>
    fetchApi<PetProfileDto>('/pets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    fetchApi<PetProfileDto | null>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  addVisitLog: (petId, log) =>
    fetchApi<PetProfileDto | null>(`/pets/${petId}/visits`, {
      method: 'POST',
      body: JSON.stringify(log),
    }),
  syncFromBooking: (booking, options) =>
    fetchApi<PetProfileDto>('/pets/sync-from-booking', {
      method: 'POST',
      body: JSON.stringify({ booking, ...options }),
    }),
  remove: (id) =>
    fetchApi<boolean>(`/pets/${id}`, {
      method: 'DELETE',
    }),
};

export const petService = {
  ...(MOCK_MODE ? mockPetRepository : apiPetRepository),
  subscribe(callback: () => void) {
    return subscribeDataSync(PETS_STORAGE_KEY, callback);
  },
};
