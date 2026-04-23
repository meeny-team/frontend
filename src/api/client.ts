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

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
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
