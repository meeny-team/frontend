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
import { ApiError } from '../../api/client';

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
  const { user, updateProfile } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [imageUri, setImageUri] = useState<string | null>(user?.profileImage ?? null);
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

        if (response.assets?.[0]?.uri) {
          requestAnimationFrame(() => {
            setImageUri(response.assets![0].uri);
          });
        }
      }).catch(() => {
        Alert.alert('오류', '이미지를 선택할 수 없습니다.');
      });
    });
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateProfile({
        nickname,
        bio,
        profileImage: imageUri ?? '',
      });
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '프로필 저장에 실패했습니다.';
      Alert.alert('저장 실패', msg);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = nickname !== (user?.nickname ?? '') ||
    bio !== (user?.bio ?? '') ||
    imageUri !== (user?.profileImage ?? null);

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
            {saving ? '저장중...' : '저장'}
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
