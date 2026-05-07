/**
 * Meeny - Create Crew Screen
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
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Line, Circle } from 'react-native-svg';
import { colors, spacing } from '../../design';
import { createCrew } from '../../api';

// ============ Icons (메모이제이션) ============

const XIcon = memo(({ size = 20, color = colors.tertiary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
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

// 이미지 컴포넌트 분리 (메모이제이션으로 불필요한 리렌더 방지)
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


// ============ Main Screen ============

export default function CreateCrewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = name.trim().length > 0;

  const handlePickImage = useCallback(() => {
    Keyboard.dismiss();

    // 키보드 닫힌 후 이미지 피커 실행
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
          // 이미지 선택 완료 후 다음 프레임에서 상태 업데이트
          requestAnimationFrame(() => {
            setImageUri(pickedUri);
          });
        }
      }).catch(() => {
        Alert.alert('오류', '이미지를 선택할 수 없습니다.');
      });
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await createCrew({
        name: name.trim(),
        coverImage: imageUri || undefined,
      });

      if (response.status === 200) {
        navigation.goBack();
      } else {
        Alert.alert('오류', response.message || '크루 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '크루 생성 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [name, imageUri, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          activeOpacity={0.6}
        >
          <XIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 크루</Text>
        <TouchableOpacity
          style={[styles.createBtn, (!isValid || isLoading) && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!isValid || isLoading}
          activeOpacity={0.6}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <Text style={[styles.createBtnText, !isValid && styles.createBtnTextDisabled]}>
              완료
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
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

        {/* Name Input */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.nameInput}
            placeholder="크루 이름"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            maxLength={20}
            textAlign="center"
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Text style={styles.nameHint}>예: 대학 동기, 회사 점심팟</Text>
        </View>

        <View style={{ height: insets.bottom + spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

// ============ Styles ============

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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  createBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.brand,
    letterSpacing: -0.2,
  },
  createBtnTextDisabled: {
    color: colors.muted,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    flexGrow: 1,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
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
    width: '100%',
    paddingHorizontal: spacing['3xl'],
    alignItems: 'center',
  },
  nameInput: {
    width: '100%',
    fontSize: 22,
    fontWeight: '400',
    color: colors.foreground,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    letterSpacing: -0.3,
  },
  nameHint: {
    fontSize: 13,
    color: colors.tertiary,
    marginTop: spacing.md,
    letterSpacing: -0.2,
  },
});
