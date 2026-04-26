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
  Modal,
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
  CURRENT_USER,
  createPlay,
  DOMESTIC_REGIONS,
  OVERSEAS_REGIONS,
  RegionGroup,
} from '../../api';
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
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionTab, setRegionTab] = useState<'domestic' | 'overseas'>('domestic');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [regionSearchQuery, setRegionSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 검색 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(regionSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [regionSearchQuery]);

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
    if (memberId === CURRENT_USER.id) return;
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
        regions: selectedRegions.length > 0 ? selectedRegions : undefined,
        members: selectedMembers,
        tags: customType ? [customType] : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '플레이 생성에 실패했습니다.');
    }
  };

  const toggleRegion = (groupLabel: string, region: string) => {
    // "전체" 선택 시 그룹 라벨만 저장 (예: "서울 성북구")
    const fullRegion = region === '전체' ? groupLabel : `${groupLabel} ${region}`;
    setSelectedRegions(prev =>
      prev.includes(fullRegion)
        ? prev.filter(r => r !== fullRegion)
        : [...prev, fullRegion]
    );
  };

  const removeRegion = (region: string) => {
    setSelectedRegions(prev => prev.filter(r => r !== region));
  };

  // 검색 필터링 로직 (디바운스 적용)
  const filteredRegions = useMemo(() => {
    const regions = regionTab === 'domestic' ? DOMESTIC_REGIONS : OVERSEAS_REGIONS;
    if (!debouncedQuery.trim()) return regions;

    const query = debouncedQuery.toLowerCase();
    return regions
      .map(group => ({
        ...group,
        regions: group.regions.filter(r =>
          r.toLowerCase().includes(query) ||
          group.label.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.regions.length > 0 || group.label.toLowerCase().includes(query));
  }, [regionTab, debouncedQuery]);

  // 검색어로 지역 선택 (검색 결과에서 직접 선택)
  const isRegionSelected = (groupLabel: string, region: string) => {
    const fullRegion = region === '전체' ? groupLabel : `${groupLabel} ${region}`;
    return selectedRegions.includes(fullRegion);
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
      <Text style={styles.inputLabel}>지역 선택 (선택)</Text>

      {/* 선택된 지역들 */}
      {selectedRegions.length > 0 && (
        <View style={styles.selectedRegionsContainer}>
          {selectedRegions.map(region => (
            <TouchableOpacity
              key={region}
              style={styles.selectedRegionChip}
              onPress={() => removeRegion(region)}
            >
              <Text style={styles.selectedRegionText}>{region}</Text>
              <Text style={styles.selectedRegionRemove}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 지역 추가 버튼 */}
      <TouchableOpacity
        style={styles.addRegionButton}
        onPress={() => {
          setRegionSearchQuery('');
          setDebouncedQuery('');
          setExpandedGroup(null);
          setShowRegionModal(true);
        }}
      >
        <Text style={styles.addRegionButtonText}>
          {selectedRegions.length > 0 ? '+ 지역 추가' : '지역 선택하기'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.locationHint}>
        여러 지역을 선택할 수 있어요
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
          const isCurrentUser = member.id === CURRENT_USER.id;
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

      {/* Region Selection Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.modalCloseBtn}>
              <XIcon />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>지역 선택</Text>
            <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.modalDoneBtn}>
              <Text style={styles.modalDoneText}>완료</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="지역 검색..."
              placeholderTextColor={colors.muted}
              value={regionSearchQuery}
              onChangeText={setRegionSearchQuery}
              autoCorrect={false}
            />
            {regionSearchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.searchClearBtn}
                onPress={() => setRegionSearchQuery('')}
              >
                <Text style={styles.searchClearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, regionTab === 'domestic' && styles.tabActive]}
              onPress={() => setRegionTab('domestic')}
            >
              <Text style={[styles.tabText, regionTab === 'domestic' && styles.tabTextActive]}>
                국내
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, regionTab === 'overseas' && styles.tabActive]}
              onPress={() => setRegionTab('overseas')}
            >
              <Text style={[styles.tabText, regionTab === 'overseas' && styles.tabTextActive]}>
                해외
              </Text>
            </TouchableOpacity>
          </View>

          {/* Region List */}
          <ScrollView style={styles.regionList} showsVerticalScrollIndicator={false}>
            {filteredRegions.length === 0 ? (
              <View style={styles.emptySearch}>
                <Text style={styles.emptySearchText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              filteredRegions.map((group: RegionGroup) => {
                const isExpanded = expandedGroup === group.label || debouncedQuery.length > 0;
                return (
                  <View key={group.label} style={styles.regionGroup}>
                    <TouchableOpacity
                      style={styles.regionGroupHeader}
                      onPress={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                    >
                      <Text style={styles.regionGroupLabel}>{group.label}</Text>
                      <Text style={styles.regionGroupArrow}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.regionItems}>
                        {group.regions.map(region => {
                          const isSelected = isRegionSelected(group.label, region);
                          return (
                            <TouchableOpacity
                              key={region}
                              style={[styles.regionItem, isSelected && styles.regionItemSelected]}
                              onPress={() => toggleRegion(group.label, region)}
                            >
                              <Text style={[styles.regionItemText, isSelected && styles.regionItemTextSelected]}>
                                {region}
                              </Text>
                              {isSelected && <CheckIcon color={colors.brand} size={14} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })
            )}
            <View style={{ height: insets.bottom + spacing.xl }} />
          </ScrollView>
        </View>
      </Modal>
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

  // Step 3: Region Selection
  selectedRegionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selectedRegionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  selectedRegionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand,
  },
  selectedRegionRemove: {
    fontSize: 16,
    color: colors.brand,
    fontWeight: '600',
  },
  addRegionButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addRegionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.secondary,
  },
  locationHint: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.md,
  },

  // Region Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  modalDoneBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.foreground,
  },
  searchClearBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchClearText: {
    fontSize: 20,
    color: colors.muted,
    fontWeight: '600',
  },
  emptySearch: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 15,
    color: colors.muted,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  regionList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  regionGroup: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  regionGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  regionGroupLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  regionGroupArrow: {
    fontSize: 12,
    color: colors.muted,
  },
  regionItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  regionItemSelected: {
    backgroundColor: colors.brandMuted,
    borderColor: colors.brand,
  },
  regionItemText: {
    fontSize: 14,
    color: colors.secondary,
  },
  regionItemTextSelected: {
    color: colors.brand,
    fontWeight: '500',
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
