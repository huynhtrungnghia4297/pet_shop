import type { ApiResponse } from '@/types';

/**
 * ASP.NET Core Web API Configuration
 * Toggle NEXT_PUBLIC_MOCK_MODE=false in .env.local to connect directly to .NET Core Backend
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api';

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== 'false';

export const DATA_SYNC_EVENT = 'pawpalace:data-updated';

export function buildApiResponse<T>(
  data: T,
  message = 'Thành công',
  success = true
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generic HTTP Client matching ASP.NET Core Web API JSON (camelCase) contract
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as ApiResponse<T>;
}

/**
 * LocalStorage persistence adapter with SSR safety & instant cross-component sync
 */
export function readLocalRepository<T>(key: string, fallbackSeed: T): T {
  if (typeof window === 'undefined') {
    return fallbackSeed;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallbackSeed));
      return fallbackSeed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallbackSeed;
  }
}

export function writeLocalRepository<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent(DATA_SYNC_EVENT, { detail: { key } })
    );
  } catch (err) {
    console.error('Failed to persist local repository:', err);
  }
}

export function subscribeDataSync(
  key: string,
  callback: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (event: Event) => {
    const customEvent = event as CustomEvent<{ key?: string }>;
    if (!customEvent.detail?.key || customEvent.detail.key === key) {
      callback();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) {
      callback();
    }
  };

  window.addEventListener(DATA_SYNC_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(DATA_SYNC_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
