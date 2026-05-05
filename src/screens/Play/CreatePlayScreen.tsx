/**
 * Meeny - Create Play Screen
 * 온보딩 퍼널 스타일 플레이 생성
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Line, Path, Polyline, Circle } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  PLAY_TYPE_LABELS,
  PlayType,
  getCrewById,
  getUserById,
  createPlay,
} from '../../api';
import { useAuth } from '../../auth/Auth';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type RouteProps = RouteProp<AuthorizedStackParamList, 'CreatePlay'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 4;

// ============ Icons ============

function XIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function CheckIcon({ color = colors.foreground, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

const PLAY_TYPES: PlayType[] = ['travel', 'date', 'hangout', 'daily'];

export default function CreatePlayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { crewId } = route.params;
  const { user } = useAuth();
  // mock 데이터의 userId 는 string("u1"), 백엔드 user.id 는 number → 비교 시 string 으로 통일
  const myId = user ? String(user.id) : null;

  const crew = getCrewById(crewId);
  const crewMembers = useMemo(() => {
    if (!crew) return [];
    return crew.members.map(id => getUserById(id)).filter(u => u !== undefined);
  }, [crew]);

  // Form state
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PlayType | null>(null);
  const [customType, setCustomType] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(crew?.members || []);
  const [locationName, setLocationName] = useState('');

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const toggleMember = (memberId: string) => {
    if (memberId === myId) return;
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setSelectedMembers(crew?.members || []);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStep(step + 1);
        slideAnim.setValue(SCREEN_WIDTH);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStep(step - 1);
        slideAnim.setValue(-SCREEN_WIDTH);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      navigation.goBack();
    }
  };

  const handleCreate = async () => {
    try {
      await createPlay({
        crewId,
        title: title.trim(),
        type: type || 'etc',
        dateRange: {
          start: startDate || new Date().toISOString().split('T')[0],
          end: endDate || undefined,
        },
        region: locationName || undefined,
        members: selectedMembers,
        tags: customType ? [customType] : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '플레이 생성에 실패했습니다.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        const hasType = type !== null || customType.trim().length > 0;
        return title.trim().length > 0 && hasType;
      case 2:
        return true; // Date is optional
      case 3:
        return true; // Location is optional
      case 4:
        return selectedMembers.length > 0;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return '어떤 플레이인가요?';
      case 2: return '언제 하나요?';
      case 3: return '어디서 하나요?';
      case 4: return '누구와 함께하나요?';
      default: return '';
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [1, TOTAL_STEPS],
    outputRange: ['25%', '100%'],
  });

  // ============ Render Steps ============

  const handleTypeSelect = (t: PlayType) => {
    setType(t);
    setCustomType('');
  };

  const handleCustomTypeChange = (text: string) => {
    setCustomType(text);
    if (text.trim().length > 0) {
      setType(null);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.inputLabel}>플레이 제목</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="예: 제주도 2박3일"
        placeholderTextColor={colors.muted}
        value={title}
        onChangeText={setTitle}
        maxLength={30}
        autoFocus
      />
      <Text style={styles.charCount}>{title.length}/30</Text>

      <Text style={[styles.inputLabel, { marginTop: spacing['2xl'] }]}>유형 선택</Text>
      <View style={styles.typeList}>
        {PLAY_TYPES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBar, type === t && styles.typeBarActive]}
            onPress={() => handleTypeSelect(t)}
          >
            <Text style={[styles.typeBarText, type === t && styles.typeBarTextActive]}>
              {PLAY_TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={[styles.typeBar, styles.customTypeBar, customType.trim().length > 0 && styles.typeBarActive]}>
          <TextInput
            style={styles.customTypeInput}
            placeholder="직접 입력"
            placeholderTextColor={colors.muted}
            value={customType}
            onChangeText={handleCustomTypeChange}
            maxLength={20}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.inputLabel}>시작 날짜</Text>
      <TextInput
        style={styles.dateInput}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.muted}
        value={startDate}
        onChangeText={setStartDate}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>종료 날짜 (선택)</Text>
      <TextInput
        style={styles.dateInput}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.muted}
        value={endDate}
        onChangeText={setEndDate}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.dateHint}>
        종료 날짜는 당일 플레이면 비워두세요
      </Text>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.inputLabel}>위치 (선택)</Text>
      <TextInput
        style={styles.locationInput}
        placeholder="예: 제주도, 강남역, 홍대입구"
        placeholderTextColor={colors.muted}
        value={locationName}
        onChangeText={setLocationName}
      />
      <Text style={styles.locationHint}>
        플레이가 진행되는 주요 장소를 입력하세요
      </Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.memberHeader}>
        <Text style={styles.inputLabel}>참여 멤버</Text>
        <TouchableOpacity onPress={selectAllMembers}>
          <Text style={styles.selectAllText}>전체 선택</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.memberCount}>{selectedMembers.length}명 선택됨</Text>

      <ScrollView style={styles.memberScroll} showsVerticalScrollIndicator={false}>
        {crewMembers.map(member => {
          if (!member) return null;
          const isSelected = selectedMembers.includes(member.id);
          const isCurrentUser = member.id === myId;
          return (
            <TouchableOpacity
              key={member.id}
              style={[styles.memberItem, isSelected && styles.memberItemSelected]}
              onPress={() => toggleMember(member.id)}
              disabled={isCurrentUser}
            >
              <View style={[styles.memberAvatar, isSelected && styles.memberAvatarSelected]}>
                <Text style={[styles.memberAvatarText, isSelected && styles.memberAvatarTextSelected]}>
                  {member.nickname[0]}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, isSelected && styles.memberNameSelected]}>
                  {member.nickname}
                  {isCurrentUser && <Text style={styles.memberYou}> (나)</Text>}
                </Text>
                {member.bio && (
                  <Text style={styles.memberBio} numberOfLines={1}>{member.bio}</Text>
                )}
              </View>
              {isSelected && (
                <View style={styles.memberCheck}>
                  <CheckIcon color={colors.brand} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          {step === 1 ? <XIcon /> : <ChevronLeftIcon />}
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>{step} / {TOTAL_STEPS}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.titleSection}>
        <Text style={styles.stepTitle}>{getStepTitle()}</Text>
      </View>

      {/* Step Content */}
      <Animated.View
        style={[
          styles.stepContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </Animated.View>

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={step === TOTAL_STEPS ? handleCreate : handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === TOTAL_STEPS ? '플레이 만들기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.tertiary,
  },
  headerRight: {
    width: 44,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  progressBg: {
    height: 4,
    backgroundColor: colors.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 2,
  },

  // Title
  titleSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.5,
  },

  // Step Content
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },

  // Input Labels
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  // Step 1: Title & Type
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: 18,
    fontWeight: '500',
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  typeList: {
    gap: spacing.sm,
  },
  typeBar: {
    height: 48,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  typeBarActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  typeBarText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.secondary,
  },
  typeBarTextActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  customTypeBar: {
    padding: 0,
  },
  customTypeInput: {
    flex: 1,
    height: 48,
    padding: 0,
    fontSize: 15,
    color: colors.foreground,
  },

  // Step 2: Date
  dateInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateHint: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.lg,
  },

  // Step 3: Location
  locationInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationHint: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.md,
  },

  // Step 4: Members
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  memberScroll: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  memberItemSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: colors.brand,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  memberAvatarTextSelected: {
    color: colors.foreground,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  memberNameSelected: {
    color: colors.brand,
  },
  memberYou: {
    fontWeight: '400',
    color: colors.tertiary,
  },
  memberBio: {
    fontSize: 13,
    color: colors.tertiary,
    marginTop: 2,
  },
  memberCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.brand,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
});
