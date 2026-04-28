/**
 * Meeny API Client
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { ApiResponse } from './schema';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:8080';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface BackendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;
let onAuthFailure: (() => void) | null = null;
let inflightRefresh: Promise<string | null> | null = null;

export function configureAuthBridge(opts: {
  refresh: RefreshHandler;
  onFailure: () => void;
}): void {
  refreshHandler = opts.refresh;
  onAuthFailure = opts.onFailure;
}

async function tryRefresh(): Promise<string | null> {
  if (!refreshHandler) return null;
  if (!inflightRefresh) {
    inflightRefresh = refreshHandler().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

async function fetchOnce<T>(
  path: string,
  options: RequestInit,
  token: string | null,
): Promise<{ response: Response; body: BackendResponse<T> | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (response.status === 204) {
    return { response, body: null };
  }
  const body = (await response.json().catch(() => null)) as BackendResponse<T> | null;
  return { response, body };
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await getToken();
  let { response, body } = await fetchOnce<T>(path, options, token);

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const newToken = await tryRefresh();
    if (newToken) {
      ({ response, body } = await fetchOnce<T>(path, options, newToken));
    } else {
      onAuthFailure?.();
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.code ?? 'UNKNOWN_ERROR',
      body?.message ?? `요청에 실패했습니다 (${response.status})`,
    );
  }

  return (body?.data ?? body) as T;
}

// Mock 함수 (다른 API 모듈에서 아직 사용 중)
const delay = (ms: number = 300) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

export async function apiCall<T>(mockData: T, delayMs: number = 300): Promise<ApiResponse<T>> {
  await delay(delayMs);
  return { status: 200, data: mockData };
}

export function apiError(message: string, status: number = 400): ApiResponse<null> {
  return { status, data: null, message };
}
