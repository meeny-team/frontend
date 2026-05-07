/**
 * Meeny - Profile Edit Screen
 * 모노 캘린더 스타일: 미니멀, 세련됨
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';
import { useAuth } from '../../auth/Auth';
import { getAccessToken } from '../../auth/session';
import { updateCurrentUser, isUploadableImageUrl } from '../../api';

// ============ Icons ============

const ChevronLeftIcon = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={1.5}>
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
));

const CameraIcon = memo(({ size = 24, color = colors.muted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Circle cx="12" cy="13" r="4" />
    <Line x1="12" y1="5" x2="12" y2="3" />
    <Line x1="5" y1="8" x2="5" y2="8.01" />
    <Line x1="19" y1="8" x2="19" y2="8.01" />
  </Svg>
));

// 이미지 컴포넌트 분리
const PreviewImage = memo(({ uri }: { uri: string }) => (
  <Image
    source={{ uri }}
    style={imageStyles.preview}
    resizeMode="cover"
    fadeDuration={0}
  />
));

const imageStyles = StyleSheet.create({
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, applyUser } = useAuth();

  const initialNickname = user?.nickname ?? '';
  const initialBio = user?.bio ?? '';
  const initialImage = user?.profileImage ?? null;

  const [nickname, setNickname] = useState(initialNickname);
  const [bio, setBio] = useState(initialBio);
  const [imageUri, setImageUri] = useState<string | null>(initialImage);
  const [saving, setSaving] = useState(false);

  const handlePickImage = useCallback(() => {
    Keyboard.dismiss();

    requestAnimationFrame(() => {
      launchImageLibrary({
        mediaType: 'photo',
        quality: 0.1,
        maxWidth: 100,
        maxHeight: 100,
        selectionLimit: 1,
        includeBase64: false,
      }).then(response => {
        if (response.didCancel || response.errorCode) {
          if (response.errorCode === 'permission') {
            Alert.alert('권한 필요', '설정에서 사진 접근 권한을 허용해주세요.');
          }
          return;
        }

        const pickedUri = response.assets?.[0]?.uri;
        if (pickedUri) {
          requestAnimationFrame(() => {
            setImageUri(pickedUri);
          });
        }
      }).catch(() => {
        Alert.alert('오류', '이미지를 선택할 수 없습니다.');
      });
    });
  }, []);

  // 프로필 저장: 변경된 필드만 PATCH /api/users/me 로 보냄. 게스트(토큰 없음)는 로컬 mock 만 갱신.
  const handleSave = async () => {
    if (saving) return;
    const patch: { nickname?: string; bio?: string; profileImage?: string } = {};
    if (nickname !== initialNickname) patch.nickname = nickname.trim();
    if (bio !== initialBio) patch.bio = bio;
    // 이미지 업로드용 S3 가 아직 배포 전이라, 디바이스 로컬 경로(file://)는 백엔드에 보내지 않는다.
    // 사용자가 새 이미지를 골랐어도 http(s) URL 이 아니면 변경 시도를 건너뛰고 안내 Alert.
    const imageChanged = imageUri !== initialImage;
    if (imageChanged && isUploadableImageUrl(imageUri)) {
      patch.profileImage = imageUri;
    } else if (imageChanged && imageUri && !isUploadableImageUrl(imageUri)) {
      Alert.alert('이미지 변경 보류', '이미지 업로드는 곧 지원 예정입니다. 다른 항목만 저장할게요.');
    }

    if (!getAccessToken()) {
      // 게스트 모드: 백엔드 호출 없이 화면만 닫는다.
      navigation.goBack();
      return;
    }

    setSaving(true);
    const res = await updateCurrentUser(patch);
    setSaving(false);
    if (!res.data) {
      Alert.alert('저장 실패', res.message ?? '프로필을 저장하지 못했습니다.');
      return;
    }
    // 백엔드가 응답한 최신 프로필을 컨텍스트에 반영. id 가 number 인 MemberProfile 형식으로 채워서 호환.
    applyUser({
      id: Number(res.data.id),
      nickname: res.data.nickname,
      email: null,
      profileImage: res.data.profileImage ?? null,
      bio: res.data.bio ?? null,
    });
    navigation.goBack();
  };

  const hasChanges = nickname !== initialNickname ||
    bio !== initialBio ||
    imageUri !== initialImage;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={[styles.saveText, (!hasChanges || saving) && styles.saveTextDisabled]}>
            {saving ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar - 크루 만들기와 동일한 스타일 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            {imageUri ? (
              <PreviewImage uri={imageUri} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <CameraIcon />
                <Text style={styles.imagePlaceholderText}>사진</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nickname */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>닉네임</Text>
          <TextInput
            style={styles.textInput}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor={colors.muted}
            maxLength={20}
          />
          <Text style={styles.charCount}>{nickname.length}/20</Text>
        </View>

        {/* Bio */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>소개</Text>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="자기소개를 입력하세요"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={100}
          />
          <Text style={styles.charCount}>{bio.length}/100</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  saveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.elevated,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  saveTextDisabled: {
    color: colors.muted,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.muted,
  },
  inputSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: spacing.md,
  },
  textInput: {
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioInput: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});
