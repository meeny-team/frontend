/**
 * 핀 생성 제출 흐름 훅.
 *
 * 관심사:
 *  - 이미지 업로드 (다중, 실패 시 조기 반환)
 *  - createPin 호출
 *  - 성공 시 analytics 이벤트 (pin_create)
 *  - 실패 시 사용자에게 Alert 안내
 *  - submitting 로딩 플래그
 *
 * 순수 데이터 인/아웃만 다루고, 성공/실패 후 어디로 navigate 할지는 caller 가 결정.
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { createPin, PickedImageAsset, PinCategory, uploadPickedImage } from '../../api';
import { captureEvent } from '../../analytics';

export interface SubmitPinInput {
  playId: string;
  category: PinCategory;
  title: string;
  memo: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  amount: number;
  paidBy: string;
  settlementType: 'equal' | 'custom';
  splits: { userId: string; amount: number }[];
  pickedAssets: PickedImageAsset[];
}

export interface UseAddPinSubmitResult {
  submitting: boolean;
  submit: (input: SubmitPinInput) => Promise<boolean>;
}

export function useAddPinSubmit(): UseAddPinSubmitResult {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (input: SubmitPinInput): Promise<boolean> => {
    if (submitting) return false;

    setSubmitting(true);

    let imageUrls: string[] | undefined;
    if (input.pickedAssets.length > 0) {
      try {
        imageUrls = await Promise.all(input.pickedAssets.map(a => uploadPickedImage(a, 'PIN')));
      } catch (e) {
        setSubmitting(false);
        const msg = e instanceof Error ? e.message : '이미지 업로드에 실패했습니다.';
        Alert.alert('업로드 실패', msg);
        return false;
      }
    }

    try {
      await createPin({
        playId: input.playId,
        amount: input.amount,
        category: input.category,
        title: input.title.trim(),
        memo: input.memo.trim() || undefined,
        location: input.locationName.trim() || undefined,
        // 카카오 place 를 고른 경우에만 좌표를 함께 보낸다. 텍스트로만 입력한 위치는 지도 마커에서 제외.
        latitude: input.latitude,
        longitude: input.longitude,
        images: imageUrls,
        settlement: {
          type: input.settlementType,
          paidBy: input.paidBy,
          splits: input.splits,
        },
      });
      captureEvent('pin_create', {
        category: input.category,
        settlement_type: input.settlementType,
        split_count: input.splits.length,
        has_location: !!input.locationName.trim(),
        has_coordinates: input.latitude !== undefined,
        image_count: imageUrls?.length ?? 0,
      });
      setSubmitting(false);
      return true;
    } catch {
      Alert.alert('오류', '핀 생성에 실패했습니다.');
      setSubmitting(false);
      return false;
    }
  }, [submitting]);

  return { submitting, submit };
}
