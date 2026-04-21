/**
 * Meeny - Add Pin Screen
 * 온보딩 퍼널 스타일 핀 추가
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Line, Polyline, Circle, Path } from 'react-native-svg';
// Map removed due to New Architecture compatibility issues
// import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
// import Geolocation from '@react-native-community/geolocation';
import { colors, spacing, radius } from '../../design';
import {
  getPlayById,
  getCrewById,
  getUserById,
  CATEGORY_LABELS,
  PinCategory,
  CURRENT_USER,
  createPin,
} from '../../api';
import { searchPlaces, KakaoPlace } from '../../api/kakao';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type RouteProps = RouteProp<AuthorizedStackParamList, 'AddPin'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 2;

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

function SearchIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.tertiary} strokeWidth={2}>
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

const PIN_CATEGORIES: PinCategory[] = ['food', 'cafe', 'shopping', 'transport', 'stay', 'activity'];

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function AddPinScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { playId } = route.params;

  const play = getPlayById(playId);
  const crew = play ? getCrewById(play.crewId) : undefined;
  const members = useMemo(() => {
    if (!crew) return [];
    return crew.members.map(id => getUserById(id)).filter(u => u !== undefined);
  }, [crew]);

  // Form state
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<PinCategory | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<LocationCoords | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<string>(CURRENT_USER.id);
  const [participants, setParticipants] = useState<Set<string>>(
    new Set(members.map(m => m?.id).filter(Boolean) as string[])
  );
  const [settlementType, setSettlementType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  // Place search state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Amount parsing
  const numericAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric) {
      setAmount(parseInt(numeric, 10).toLocaleString('ko-KR'));
    } else {
      setAmount('');
    }
  };

  const toggleParticipant = (userId: string) => {
    setParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        if (newSet.size > 1) {
          newSet.delete(userId);
          setCustomSplits(splits => {
            const newSplits = { ...splits };
            delete newSplits[userId];
            return newSplits;
          });
        }
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllParticipants = () => {
    setParticipants(new Set(members.map(m => m?.id).filter(Boolean) as string[]));
  };

  const handleCustomSplitChange = (userId: string, value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    setCustomSplits(prev => ({
      ...prev,
      [userId]: numeric ? parseInt(numeric, 10).toLocaleString('ko-KR') : '',
    }));
  };

  // Place search on button press
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchPlaces(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery]);

  const handleSelectPlace = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setLocationName(place.place_name);
    setSearchQuery('');
    setSearchResults([]);
    setShowLocationModal(false);
  };

  const handleClearPlace = () => {
    setSelectedPlace(null);
    setLocationName('');
  };

  const openLocationSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowLocationModal(true);
  };

  const selectedParticipants = members.filter(m => m && participants.has(m.id));
  const participantCount = selectedParticipants.length;
  const equalSplitAmount = participantCount > 0 ? Math.floor(numericAmount / participantCount) : 0;

  const customTotal = useMemo(() => {
    return Array.from(participants).reduce((sum, id) => {
      const val = customSplits[id] || '0';
      return sum + (parseInt(val.replace(/,/g, ''), 10) || 0);
    }, 0);
  }, [customSplits, participants]);

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
    if (!category) return;

    try {
      const splits = selectedParticipants.map(m => ({
        userId: m!.id,
        amount: settlementType === 'equal'
          ? equalSplitAmount
          : parseInt((customSplits[m!.id] || '0').replace(/,/g, ''), 10) || 0,
      }));

      await createPin({
        playId,
        amount: numericAmount,
        category,
        title: title.trim(),
        memo: memo.trim() || undefined,
        location: locationName.trim() || undefined,
        settlement: {
          type: settlementType,
          paidBy,
          splits,
        },
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '핀 생성에 실패했습니다.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        const hasCategory = category !== null || customCategory.trim().length > 0;
        return hasCategory && title.trim().length > 0;
      case 2:
        const isSettlementValid = settlementType === 'equal' || customTotal === numericAmount;
        return participantCount > 0 && isSettlementValid;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return '기록 남기기';
      case 2: return '정산하기';
      default: return '';
    }
  };

  const handleCategorySelect = (cat: PinCategory) => {
    setCategory(cat);
    setCustomCategory('');
  };

  const handleCustomCategoryChange = (text: string) => {
    setCustomCategory(text);
    if (text.trim().length > 0) {
      setCategory(null);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [1, TOTAL_STEPS],
    outputRange: ['25%', '100%'],
  });

  const handleMapRegionChange = (region: any) => {
    setLocationCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  // ============ Render Steps ============

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Image Selection */}
      <Text style={styles.inputLabel}>사진</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        <View style={styles.imageRow}>
          <TouchableOpacity style={styles.imageAddButton}>
            <Text style={styles.imageAddIcon}>+</Text>
            <Text style={styles.imageAddText}>사진 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageAddButton}>
            <Text style={styles.imageAddIcon}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageAddButton}>
            <Text style={styles.imageAddIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Title */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>제목</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="무엇을 했나요?"
        placeholderTextColor={colors.muted}
        value={title}
        onChangeText={setTitle}
        maxLength={30}
      />

      {/* Category */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>카테고리</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {PIN_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.categoryChip, styles.customCategoryChip, customCategory.trim().length > 0 && styles.categoryChipActive]}>
            <TextInput
              style={styles.customCategoryChipInput}
              placeholder="직접 입력"
              placeholderTextColor={colors.muted}
              value={customCategory}
              onChangeText={handleCustomCategoryChange}
              maxLength={10}
            />
          </View>
        </View>
      </ScrollView>

      {/* Body/Memo */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>본문</Text>
      <TextInput
        style={[styles.titleInput, styles.bodyInput]}
        placeholder="어떤 경험이었나요?"
        placeholderTextColor={colors.muted}
        value={memo}
        onChangeText={setMemo}
        maxLength={500}
        multiline
      />
      <Text style={styles.charCount}>{memo.length}/500</Text>

      {/* Location */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>위치</Text>
      {selectedPlace ? (
        <View style={styles.selectedLocationRow}>
          <View style={styles.selectedLocationInfo}>
            <MapPinIcon />
            <Text style={styles.selectedLocationName}>{selectedPlace.place_name}</Text>
          </View>
          <TouchableOpacity onPress={handleClearPlace} style={styles.clearLocationButton}>
            <Text style={styles.clearLocationText}>삭제</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addLocationButton} onPress={openLocationSearch}>
          <MapPinIcon />
          <Text style={styles.addLocationText}>위치 추가</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: spacing['2xl'] }} />
    </ScrollView>
  );

  // Location Search Modal
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowLocationModal(false)}>
            <Text style={styles.modalCancel}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>위치 검색</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.modalSearchContainer}>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="장소, 상호명 검색"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.foreground} />
            ) : (
              <SearchIcon />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalResults}>
          {searchResults.map(place => (
            <TouchableOpacity
              key={place.id}
              style={styles.modalResultItem}
              onPress={() => handleSelectPlace(place)}
            >
              <MapPinIcon />
              <View style={styles.modalResultText}>
                <Text style={styles.modalResultName}>{place.place_name}</Text>
                <Text style={styles.modalResultAddress}>{place.road_address_name || place.address_name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Amount Input */}
      <Text style={styles.inputLabel}>금액</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>₩</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor={colors.muted}
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="number-pad"
          maxLength={15}
        />
      </View>
      <Text style={styles.amountHint}>무료라면 0원으로 두세요</Text>

      {/* Payer Selection */}
      <Text style={styles.inputLabel}>결제자</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.payerScroll}>
        <View style={styles.payerRow}>
          {members.map(member => {
            if (!member) return null;
            const isSelected = paidBy === member.id;
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.payerChip, isSelected && styles.payerChipActive]}
                onPress={() => setPaidBy(member.id)}
              >
                <View style={[styles.payerAvatar, isSelected && styles.payerAvatarActive]}>
                  <Text style={styles.payerAvatarText}>{member.nickname[0]}</Text>
                </View>
                <Text style={[styles.payerName, isSelected && styles.payerNameActive]}>
                  {member.nickname}
                  {member.id === CURRENT_USER.id && ' (나)'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Participants Selection */}
      <View style={styles.participantHeader}>
        <Text style={styles.inputLabel}>참여자 ({participantCount}명)</Text>
        <TouchableOpacity onPress={selectAllParticipants}>
          <Text style={styles.selectAllText}>전체 선택</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.participantsGrid}>
        {members.map(member => {
          if (!member) return null;
          const isSelected = participants.has(member.id);
          return (
            <TouchableOpacity
              key={member.id}
              style={[styles.participantChip, isSelected && styles.participantChipActive]}
              onPress={() => toggleParticipant(member.id)}
            >
              <View style={[styles.participantCheckbox, isSelected && styles.participantCheckboxActive]}>
                {isSelected && <CheckIcon color={colors.foreground} size={12} />}
              </View>
              <Text style={[styles.participantName, isSelected && styles.participantNameActive]}>
                {member.nickname}
                {member.id === CURRENT_USER.id && ' (나)'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Settlement Type */}
      <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>정산 방식</Text>
      <View style={styles.settlementToggle}>
        <TouchableOpacity
          style={[styles.settlementOption, settlementType === 'equal' && styles.settlementOptionActive]}
          onPress={() => setSettlementType('equal')}
        >
          <Text style={[styles.settlementOptionText, settlementType === 'equal' && styles.settlementOptionTextActive]}>
            1/N
          </Text>
          <Text style={styles.settlementOptionDesc}>{participantCount}명 균등 분할</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settlementOption, settlementType === 'custom' && styles.settlementOptionActive]}
          onPress={() => setSettlementType('custom')}
        >
          <Text style={[styles.settlementOptionText, settlementType === 'custom' && styles.settlementOptionTextActive]}>
            직접 입력
          </Text>
          <Text style={styles.settlementOptionDesc}>금액 직접 설정</Text>
        </TouchableOpacity>
      </View>

      {/* Settlement Details */}
      <View style={styles.settlementDetails}>
        {selectedParticipants.map(member => {
          if (!member) return null;
          const isPayer = member.id === paidBy;
          const isCurrentUser = member.id === CURRENT_USER.id;

          return (
            <View key={member.id} style={styles.splitRow}>
              <View style={styles.splitUser}>
                <View style={[styles.splitAvatar, isPayer && styles.splitAvatarPayer]}>
                  <Text style={styles.splitAvatarText}>{member.nickname[0]}</Text>
                </View>
                <View>
                  <Text style={styles.splitName}>
                    {member.nickname}
                    {isCurrentUser && ' (나)'}
                  </Text>
                  {isPayer && <Text style={styles.payerBadge}>결제자</Text>}
                </View>
              </View>
              {settlementType === 'equal' ? (
                <Text style={styles.splitAmount}>
                  ₩{equalSplitAmount.toLocaleString('ko-KR')}
                </Text>
              ) : (
                <TextInput
                  style={styles.splitInput}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  value={customSplits[member.id] || ''}
                  onChangeText={text => handleCustomSplitChange(member.id, text)}
                  keyboardType="number-pad"
                />
              )}
            </View>
          );
        })}

        {settlementType === 'custom' && (
          <View style={styles.settlementTotal}>
            <Text style={styles.settlementTotalLabel}>합계</Text>
            <Text
              style={[
                styles.settlementTotalAmount,
                customTotal === numericAmount ? styles.settlementTotalValid : styles.settlementTotalInvalid,
              ]}
            >
              ₩{customTotal.toLocaleString('ko-KR')} / ₩{numericAmount.toLocaleString('ko-KR')}
              {customTotal === numericAmount ? ' ✓' : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );

  if (!play || !crew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>플레이를 찾을 수 없습니다</Text>
      </View>
    );
  }

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
      </Animated.View>

      {/* Location Search Modal */}
      {renderLocationModal()}

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={step === TOTAL_STEPS ? handleCreate : handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === TOTAL_STEPS ? '핀 남기기' : '다음'}
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

  // Amount (Step 4)
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.brand,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
  },
  amountHint: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  // Images
  imageScroll: {
    marginBottom: spacing.sm,
  },
  imageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageAddButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAddIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.muted,
  },
  imageAddText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },

  // Category chips (horizontal)
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    height: 40,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  categoryChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary,
  },
  categoryChipTextActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  customCategoryChip: {
    paddingHorizontal: 0,
    minWidth: 80,
  },
  customCategoryChipInput: {
    height: 40,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.foreground,
  },

  // Body input
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    fontWeight: '400',
  },

  // Location button
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addLocationText: {
    fontSize: 15,
    color: colors.muted,
  },
  selectedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.brandMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  clearLocationButton: {
    padding: spacing.sm,
  },
  clearLocationText: {
    fontSize: 14,
    color: colors.negative,
  },

  // Location Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.brand,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.foreground,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResults: {
    flex: 1,
  },
  modalResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  modalResultText: {
    flex: 1,
  },
  modalResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 2,
  },
  modalResultAddress: {
    fontSize: 13,
    color: colors.tertiary,
  },

  // Step 2: Title & Memo
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
  memoInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    fontWeight: '400',
  },

  // Step 2: Location Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.foreground,
  },
  searchResults: {
    maxHeight: 250,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 13,
    color: colors.tertiary,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.brandMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  selectedPlaceInfo: {
    flex: 1,
  },
  selectedPlaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  selectedPlaceAddress: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 2,
  },
  selectedPlaceCategory: {
    fontSize: 12,
    color: colors.tertiary,
  },
  clearPlaceButton: {
    padding: spacing.sm,
  },
  placeDetails: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  placeDetailsLabel: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: 4,
  },
  placeDetailsValue: {
    fontSize: 14,
    color: colors.foreground,
  },
  emptyLocation: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyLocationText: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  emptyLocationHint: {
    fontSize: 14,
    color: colors.muted,
  },
  mapContainer: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Step 4: Settlement
  payerScroll: {
    marginBottom: spacing.xl,
  },
  payerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  payerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
    paddingLeft: 4,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  payerChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  payerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerAvatarActive: {
    backgroundColor: colors.brand,
  },
  payerAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  payerName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  payerNameActive: {
    color: colors.brand,
    fontWeight: '600',
  },

  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  participantChipActive: {
    borderColor: colors.positive,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  participantCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantCheckboxActive: {
    borderColor: colors.positive,
    backgroundColor: colors.positive,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  participantNameActive: {
    color: colors.foreground,
    fontWeight: '600',
  },

  settlementToggle: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  settlementOption: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  settlementOptionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  settlementOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  settlementOptionTextActive: {
    color: colors.brand,
  },
  settlementOptionDesc: {
    fontSize: 12,
    color: colors.tertiary,
  },

  settlementDetails: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  splitUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  splitAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitAvatarPayer: {
    backgroundColor: colors.brand,
  },
  splitAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  splitName: {
    fontSize: 14,
    color: colors.foreground,
  },
  payerBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand,
    marginTop: 2,
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brand,
  },
  splitInput: {
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    minWidth: 100,
    textAlign: 'right',
  },
  settlementTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settlementTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  settlementTotalAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  settlementTotalValid: {
    color: colors.positive,
  },
  settlementTotalInvalid: {
    color: colors.negative,
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
  errorText: {
    fontSize: 14,
    color: colors.negative,
    textAlign: 'center',
    marginTop: 100,
  },
});
