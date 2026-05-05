/**
 * Meeny - Home Screen
 * 모노 캘린더 스타일: 심플하지만 절제된 세련미
 * 성능 최적화: 컴포넌트 분리 + 메모이제이션
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';
import {
  Crew,
  formatCurrency,
  fetchMyCrews,
  joinCrewByCode,
  getPlaysByCrewId,
  getPlayTotalAmount,
} from '../../api';
import { useAuth } from '../../auth/Auth';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type NavigationProp = NativeStackNavigationProp<AuthorizedStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 14;
const GRID_PADDING = 20;
const SMALL_CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

// ============ Icons (메모이제이션) ============

const SettingsIcon = memo(({ size = 22, color = colors.tertiary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
));

const ChevronRightIcon = memo(({ size = 16, color = colors.muted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
));

const XIcon = memo(({ size = 20, color = colors.tertiary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
));

const PlusIcon = memo(({ size = 20, color = colors.brand }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
));

// ============ 초대 코드 모달 (분리된 컴포넌트) ============

interface JoinModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

const JoinModal = memo(({ visible, onClose, onJoinSuccess }: JoinModalProps) => {
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;

    setIsJoining(true);
    try {
      const response = await joinCrewByCode(code.trim());
      if (response.status === 200) {
        setCode('');
        onClose();
        onJoinSuccess();
      }
    } catch (error) {
      console.error('Failed to join crew:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>초대 코드 입력</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalClose}>
              <XIcon size={18} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDesc}>받은 6자리 코드를 입력해주세요</Text>

          <TextInput
            style={styles.codeInput}
            placeholder="XXXXXX"
            placeholderTextColor={colors.placeholder}
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.modalBtn, (!code || isJoining) && styles.modalBtnDisabled]}
            onPress={handleJoin}
            disabled={!code || isJoining}
            activeOpacity={0.8}
          >
            <Text style={styles.modalBtnText}>
              {isJoining ? '참여 중...' : '참여하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// ============ 크루 카드 (메모이제이션) ============

interface HeroCrewCardProps {
  crew: Crew;
  onPress: () => void;
}

const HeroCrewCard = memo(({ crew, onPress }: HeroCrewCardProps) => {
  const plays = getPlaysByCrewId(crew.id);
  const totalAmount = plays.reduce((sum, play) => sum + getPlayTotalAmount(play.id), 0);
  const hasImage = crew.coverImage && crew.coverImage.length > 0;

  const content = (
    <>
      {hasImage && <View style={styles.heroOverlay} />}
      <View style={styles.heroContent}>
        <View style={styles.heroTop}>
          <View style={[styles.heroBadge, hasImage && styles.heroBadgeLight]}>
            <Text style={[styles.heroBadgeText, hasImage && styles.heroBadgeTextLight]}>최근 활동</Text>
          </View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={[styles.heroName, hasImage && styles.textLight]}>{crew.name}</Text>
          <Text style={[styles.heroMeta, hasImage && styles.textLightMuted]}>
            멤버 {crew.members.length}명
          </Text>
          <View style={styles.heroAmountRow}>
            <Text style={[styles.heroAmount, hasImage && styles.textLight]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  if (hasImage) {
    return (
      <TouchableOpacity style={styles.heroCardWrapper} onPress={onPress} activeOpacity={0.9}>
        <ImageBackground
          source={{ uri: crew.coverImage }}
          style={styles.heroCard}
          imageStyle={styles.heroImageStyle}
          resizeMode="cover"
          blurRadius={3}
        >
          {content}
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.heroCardWrapper, styles.heroCard, styles.heroCardNoImage]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {content}
    </TouchableOpacity>
  );
});

interface SmallCrewCardProps {
  crew: Crew;
  onPress: () => void;
}

const SmallCrewCard = memo(({ crew, onPress }: SmallCrewCardProps) => {
  const plays = getPlaysByCrewId(crew.id);
  const hasImage = crew.coverImage && crew.coverImage.length > 0;

  const content = (
    <>
      {hasImage && <View style={styles.smallOverlay} />}
      <View style={styles.smallContent}>
        <View style={styles.smallBottom}>
          <Text style={[styles.smallName, hasImage && styles.textLight]} numberOfLines={1}>
            {crew.name}
          </Text>
          <Text style={[styles.smallMeta, hasImage && styles.textLightMuted]}>
            {crew.members.length}명 · {plays.length}개
          </Text>
        </View>
      </View>
    </>
  );

  if (hasImage) {
    return (
      <TouchableOpacity style={styles.smallCardWrapper} onPress={onPress} activeOpacity={0.9}>
        <ImageBackground
          source={{ uri: crew.coverImage }}
          style={styles.smallCard}
          imageStyle={styles.smallImageStyle}
          resizeMode="cover"
          blurRadius={2}
        >
          {content}
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.smallCardWrapper, styles.smallCard, styles.smallCardNoImage]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {content}
    </TouchableOpacity>
  );
});

// ============ Main Screen ============

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [myCrews, setMyCrews] = useState<Crew[]>([]);

  const loadCrews = useCallback(async () => {
    try {
      const response = await fetchMyCrews();
      if (response.status === 200) {
        setMyCrews(response.data);
      }
    } catch (error) {
      console.error('Failed to load crews:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCrews();
    }, [loadCrews])
  );

  const heroCrew = myCrews[0];
  const otherCrews = myCrews.slice(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>meeny</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <SettingsIcon />
          </TouchableOpacity>
        </View>

        {/* Top Divider */}
        <View style={styles.topDivider} />

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingBig}>안녕! {user?.nickname ?? '게스트'}</Text>
          <Text style={styles.greetingSub}>오늘도 즐거운 하루 보내세요</Text>
        </View>

        {/* Crews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 크루</Text>
            {myCrews.length > 0 && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddOptions(true)}
                activeOpacity={0.7}
              >
                <PlusIcon size={16} />
              </TouchableOpacity>
            )}
          </View>

          {myCrews.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyVisual}>
                <View style={styles.emptyCircle}>
                  <View style={styles.emptyCircleInner} />
                </View>
                <View style={styles.emptyLine} />
                <View style={[styles.emptyCircle, styles.emptyCircleSmall]}>
                  <View style={[styles.emptyCircleInner, styles.emptyCircleInnerSmall]} />
                </View>
              </View>

              <Text style={styles.emptyTitle}>크루를 만들어보세요</Text>
              <Text style={styles.emptyDesc}>
                함께하는 사람들과 지출을 기록하고{'\n'}간편하게 정산할 수 있어요
              </Text>

              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('CreateCrew')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>새 크루 만들기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textBtn}
                  onPress={() => setShowJoinModal(true)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.textBtnText}>초대 코드가 있어요</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.crewsContainer}>
              {heroCrew && (
                <HeroCrewCard
                  crew={heroCrew}
                  onPress={() => navigation.navigate('CrewDetail', { crewId: heroCrew.id })}
                />
              )}

              {otherCrews.length > 0 && (
                <View style={styles.crewGrid}>
                  {otherCrews.map(crew => (
                    <SmallCrewCard
                      key={crew.id}
                      crew={crew}
                      onPress={() => navigation.navigate('CrewDetail', { crewId: crew.id })}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {/* Add Options Dialog */}
      <Modal
        visible={showAddOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddOptions(false)}
      >
        <TouchableOpacity
          style={styles.dialogOverlay}
          activeOpacity={1}
          onPress={() => setShowAddOptions(false)}
        >
          <View style={styles.dialogBox} onStartShouldSetResponder={() => true}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>크루 추가</Text>
              <TouchableOpacity onPress={() => setShowAddOptions(false)} style={styles.dialogClose}>
                <XIcon size={18} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.dialogOption}
              onPress={() => {
                setShowAddOptions(false);
                navigation.navigate('CreateCrew');
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.dialogOptionText}>새 크루 만들기</Text>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.dialogDivider} />

            <TouchableOpacity
              style={styles.dialogOption}
              onPress={() => {
                setShowAddOptions(false);
                setShowJoinModal(true);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.dialogOptionText}>초대 코드로 참여</Text>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Join Modal (분리된 컴포넌트) */}
      <JoinModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={loadCrews}
      />
    </View>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top Divider
  topDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },

  // Greeting
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greetingBig: {
    fontSize: 36,
    fontFamily: 'NanumPenScript-Regular',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.tertiary,
    letterSpacing: 0.5,
  },

  // Section
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Crews Container
  crewsContainer: {
    gap: GRID_GAP,
  },

  // Hero Card
  heroCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroCardNoImage: {
    backgroundColor: '#f5efe6',
  },
  heroImageStyle: {
    borderRadius: 20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  heroContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
  },
  heroBadge: {
    backgroundColor: colors.brandMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  heroBadgeLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand,
  },
  heroBadgeTextLight: {
    color: '#ffffff',
  },
  heroBottom: {},
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroMeta: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.brand,
  },

  // Small Card
  smallCardWrapper: {
    width: SMALL_CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  smallCard: {
    width: SMALL_CARD_WIDTH,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  smallCardNoImage: {
    backgroundColor: '#f5efe6',
  },
  smallImageStyle: {
    borderRadius: 16,
  },
  smallOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  smallContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  smallBottom: {},
  smallName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 2,
  },
  smallMeta: {
    fontSize: 12,
    color: colors.secondary,
  },

  // Light text
  textLight: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  textLightMuted: {
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Crew Grid
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.xl,
  },
  emptyVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    gap: 12,
  },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  emptyCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  emptyCircleInnerSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  emptyLine: {
    width: 24,
    height: 1.5,
    backgroundColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.tertiary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing['3xl'],
  },
  emptyActions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.foreground,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  textBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  textBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.tertiary,
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
  },
  dialogClose: {
    padding: spacing.xs,
  },
  dialogOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  dialogOptionText: {
    fontSize: 16,
    color: colors.foreground,
  },
  dialogDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.tertiary,
    marginBottom: spacing.xl,
  },
  codeInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  modalBtn: {
    backgroundColor: colors.brand,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.4,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandForeground,
  },
});
