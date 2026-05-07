/**
 * Meeny - Image upload via S3 presigned URL
 *
 * 1) 백엔드에 POST /api/uploads/presigned-url → uploadUrl/publicUrl 발급
 * 2) 발급된 uploadUrl 로 RN 에서 직접 PUT (백엔드를 거치지 않음)
 * 3) 백엔드에는 publicUrl 만 저장
 *
 * uri 가 이미 https:// 로 시작하면 (백엔드에 이미 저장된 이미지를 다시 저장하는 케이스)
 * 그대로 반환 — 재업로드 안 함.
 */

import { request } from './http';

export type UploadPurpose = 'PROFILE' | 'CREW' | 'PIN';

export interface PickedImageAsset {
  uri: string;
  type?: string | null;
  fileName?: string | null;
}

interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresAt: string;
}

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function uploadPickedImage(
  asset: PickedImageAsset,
  purpose: UploadPurpose,
): Promise<string> {
  if (asset.uri.startsWith('http://') || asset.uri.startsWith('https://')) {
    return asset.uri;
  }

  const contentType = inferContentType(asset);

  const presigned = await request<PresignedUpload>('/api/uploads/presigned-url', {
    method: 'POST',
    body: { purpose, contentType },
  });

  const localResponse = await fetch(asset.uri);
  const blob = await localResponse.blob();

  const putResponse = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`S3 업로드 실패 (${putResponse.status})`);
  }

  return presigned.publicUrl;
}

function inferContentType(asset: PickedImageAsset): string {
  // RN/iOS 가 image/jpg 로 보내는 경우가 있어 표준화
  const raw = asset.type === 'image/jpg' ? 'image/jpeg' : asset.type ?? null;
  if (raw && (ALLOWED_CONTENT_TYPES as readonly string[]).includes(raw)) {
    return raw;
  }
  // type 누락 시 확장자에서 추론
  const lower = (asset.fileName ?? asset.uri).toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
