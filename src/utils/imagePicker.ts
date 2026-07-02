/**
 * Meeny - Image Picker 공통 helper
 *
 * launchImageLibrary 의 maxWidth/maxHeight/quality 가 native 단에서 리사이즈+압축을
 * 같이 해 준다. purpose 별로 적절한 사이즈를 분리해 일관성을 맞춤.
 *
 *  - profile / crew / play 커버: 1024px 정사각형용 (아이콘 비주얼). 0.8 quality.
 *  - pin: 영수증/현장 사진은 1600px 까지 보존. 0.85 quality.
 *
 * RN ImagePicker 가 이미 native 리사이저를 쓰므로 추가 라이브러리는 불필요.
 */
import { launchImageLibrary, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';

export type ImagePickerPurpose = 'profile' | 'crew' | 'play' | 'pin';

const PROFILE_PRESET: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  selectionLimit: 1,
  includeBase64: false,
};

const PIN_PRESET: ImageLibraryOptions = {
  mediaType: 'photo',
  // PhotoQuality 는 0.1 단위 enum. 영수증 보존 위해 0.9 사용 (0.85 는 타입에 없음).
  quality: 0.9,
  maxWidth: 1600,
  maxHeight: 1600,
  includeBase64: false,
};

function presetFor(purpose: ImagePickerPurpose): ImageLibraryOptions {
  switch (purpose) {
    case 'pin':
      return PIN_PRESET;
    case 'profile':
    case 'crew':
    case 'play':
    default:
      return PROFILE_PRESET;
  }
}

// 호출자가 selectionLimit 만 override 하고 싶을 수 있다 (예: 핀 = 남은 슬롯만큼).
export function pickImage(
  purpose: ImagePickerPurpose,
  override: Partial<ImageLibraryOptions> = {},
): Promise<ImagePickerResponse> {
  return launchImageLibrary({ ...presetFor(purpose), ...override });
}
