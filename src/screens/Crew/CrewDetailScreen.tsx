/**
 * Meeny - Crew Detail Screen
 * 크루 상세 (플레이 목록)
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  Switch,
  Alert,
  Share,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Path, Line, Circle, Polyline, Rect } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  getCrewById,
  getPlaysByCrewId,
  getUserById,
  getPlayTotalAmount,
  formatCurrency,
  formatDateRange,
  PLAY_TYPE_LABELS,
  Play,
  User,
} from '../../api';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type NavigationProp = NativeStackNavigationProp<AuthorizedStackParamList>;
type RouteProps = RouteProp<AuthorizedStackParamList, 'CrewDetail'>;

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

function SettingsIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth={2}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="23 4 23 10 17 10" />
      <Path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <Polyline points="16 6 12 2 8 6" />
      <Line x1="12" y1="2" x2="12" y2="15" />
    </Svg>
  );
}

function CopyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </Svg>
  );
}

const CameraIcon = memo(({ size = 24, color = colors.muted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <Circle cx="12" cy="13" r="4" />
    <Line x1="12" y1="5" x2="12" y2="3" />
    <Line x1="5" y1="8" x2="5" y2="8.01" />
    <Line x1="19" y1="8" x2="19" y2="8.01" />
  </Svg>
));

// 크루 이미지 미리보기
const CrewImagePreview = memo(({ uri }: { uri: string }) => (
  <Image
    source={{ uri }}
    style={crewImageStyles.preview}
    resizeMode="cover"
    fadeDuration={0}
  />
));

const crewImageStyles = StyleSheet.create({
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

interface PlayCardProps {
  play: Play;
  onPress: () => void;
}

function PlayCard({ play, onPress }: PlayCardProps) {
  const totalAmount = getPlayTotalAmount(play.id);

  return (
    <TouchableOpacity style={styles.playCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.playImageContainer}>
        {play.coverImage ? (
          <Image source={{ uri: play.coverImage }} style={styles.playImage} />
        ) : (
          <View style={[styles.playImage, styles.playImagePlaceholder]}>
            <Text style={styles.playImagePlaceholderText}>📍</Text>
          </View>
        )}
        <View style={styles.playTypeBadge}>
          <Text style={styles.playTypeBadgeText}>{PLAY_TYPE_LABELS[play.type]}</Text>
        </View>
      </View>
      <View style={styles.playInfo}>
        <Text style={styles.playTitle}>{play.title}</Text>
        <Text style={styles.playMeta}>
          {play.region || '미정'} · {formatDateRange(play.dateRange)}
        </Text>
        <Text style={styles.playAmount}>{formatCurrency(totalAmount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CrewDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { crewId } = route.params;

  const crew = getCrewById(crewId);
  const plays = getPlaysByCrewId(crewId);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [inviteEnabled, setInviteEnabled] = useState(true);
  const [inviteCode, setInviteCode] = useState(crew?.inviteCode || '');
  const [crewImageUri, setCrewImageUri] = useState<string | null>(crew?.coverImage || null);

  // Profile modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 크루 이미지 선택
  const handlePickCrewImage = useCallback(() => {
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
            setCrewImageUri(response.assets![0].uri);
          });
        }
      }).catch(() => {
        Alert.alert('오류', '이미지를 선택할 수 없습니다.');
      });
    });
  }, []);

  // Generate random invite code
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Handle regenerate invite code
  const handleRegenerateCode = () => {
    Alert.alert(
      '초대 코드 재생성',
      '기존 초대 코드는 더 이상 사용할 수 없게 됩니다. 재생성하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재생성',
          style: 'destructive',
          onPress: () => {
            const newCode = generateInviteCode();
            setInviteCode(newCode);
            Alert.alert('완료', '새 초대 코드가 생성되었습니다.');
          },
        },
      ]
    );
  };

  // Handle share invite
  const handleShareInvite = async () => {
    if (!crew) return;
    try {
      await Share.share({
        message: `${crew.name} 크루에 초대합니다!\n\n초대 코드: ${inviteCode}\n\nMeeny 앱에서 코드를 입력하세요.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Handle copy code
  const handleCopyCode = () => {
    // In real app, use Clipboard.setString(inviteCode)
    Alert.alert('복사됨', '초대 코드가 클립보드에 복사되었습니다.');
  };

  if (!crew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>크루를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{crew.name}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Members */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionLabel}>멤버 {crew.members.length}명</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.membersRow}>
              {crew.members.map(memberId => {
                const user = getUserById(memberId);
                if (!user) return null;
                return (
                  <TouchableOpacity
                    key={memberId}
                    style={styles.memberItem}
                    onPress={() => setSelectedUser(user)}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{user.nickname[0]}</Text>
                    </View>
                    <Text style={styles.memberName}>{user.nickname}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>


        {/* Plays */}
        <View style={styles.playsSection}>
          <View style={styles.playsSectionHeader}>
            <Text style={styles.sectionTitle}>플레이</Text>
            <TouchableOpacity
              style={styles.addPlayButton}
              onPress={() => navigation.navigate('CreatePlay', { crewId })}
            >
              <PlusIcon />
              <Text style={styles.addPlayText}>새 플레이</Text>
            </TouchableOpacity>
          </View>

          {plays.map(play => (
            <PlayCard
              key={play.id}
              play={play}
              onPress={() => navigation.navigate('PlayDetail', { playId: play.id })}
            />
          ))}

          {plays.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>아직 플레이가 없어요</Text>
              <Text style={styles.emptySubtext}>첫 플레이를 시작해보세요!</Text>
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + spacing['3xl'] }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ width: 40 }} />
            <Text style={styles.modalTitle}>프로필</Text>
            <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.modalCloseButton}>
              <XIcon />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <View style={styles.profileContent}>
              {/* Avatar */}
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarLargeText}>{selectedUser.nickname[0]}</Text>
              </View>

              {/* Name */}
              <Text style={styles.profileName}>{selectedUser.nickname}</Text>

              {/* Bio */}
              <View style={styles.profileBioCard}>
                <Text style={styles.profileBio}>
                  {selectedUser.bio || '아직 자기소개가 없습니다.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ width: 40 }} />
            <Text style={styles.modalTitle}>크루 설정</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.modalCloseButton}>
              <XIcon />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Crew Image Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>크루 이미지</Text>
              <View style={styles.crewImageSection}>
                <TouchableOpacity
                  style={styles.crewImagePicker}
                  onPress={handlePickCrewImage}
                  activeOpacity={0.7}
                >
                  {crewImageUri ? (
                    <CrewImagePreview uri={crewImageUri} />
                  ) : (
                    <View style={styles.crewImagePlaceholder}>
                      <CameraIcon />
                      <Text style={styles.crewImagePlaceholderText}>사진</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Invite Code Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>초대 코드</Text>

              {/* Enable/Disable */}
              <View style={styles.settingsRow}>
                <View style={styles.settingsRowLeft}>
                  <Text style={styles.settingsRowTitle}>초대 허용</Text>
                  <Text style={styles.settingsRowSubtitle}>초대 코드로 새 멤버 가입 허용</Text>
                </View>
                <Switch
                  value={inviteEnabled}
                  onValueChange={setInviteEnabled}
                  trackColor={{ false: colors.border, true: colors.brand }}
                  thumbColor={colors.foreground}
                />
              </View>

              {inviteEnabled && (
                <>
                  {/* Current Code */}
                  <View style={styles.inviteCodeBox}>
                    <Text style={styles.inviteCodeLabel}>현재 초대 코드</Text>
                    <Text style={styles.inviteCodeValue}>{inviteCode}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.inviteActions}>
                    <TouchableOpacity style={styles.inviteActionButton} onPress={handleCopyCode}>
                      <CopyIcon />
                      <Text style={styles.inviteActionText}>복사</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inviteActionButton} onPress={handleRegenerateCode}>
                      <RefreshIcon />
                      <Text style={styles.inviteActionText}>재생성</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inviteActionButton} onPress={handleShareInvite}>
                      <ShareIcon />
                      <Text style={styles.inviteActionText}>공유</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Danger Zone */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>위험 구역</Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => {
                  Alert.alert(
                    '크루 나가기',
                    '정말 이 크루를 나가시겠습니까?',
                    [
                      { text: '취소', style: 'cancel' },
                      { text: '나가기', style: 'destructive' },
                    ]
                  );
                }}
              >
                <Text style={styles.dangerButtonText}>크루 나가기</Text>
              </TouchableOpacity>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  membersSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  membersRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  memberItem: {
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  memberName: {
    fontSize: 12,
    color: colors.secondary,
  },
  playsSection: {
    padding: spacing.lg,
  },
  playsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  addPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  addPlayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  playCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playImageContainer: {
    position: 'relative',
  },
  playImage: {
    width: 100,
    height: 100,
  },
  playImagePlaceholder: {
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playImagePlaceholderText: {
    fontSize: 28,
  },
  playTypeBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  playTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.foreground,
  },
  playInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  playTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  playMeta: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  playAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.tertiary,
  },
  errorText: {
    fontSize: 14,
    color: colors.negative,
    textAlign: 'center',
    marginTop: 100,
  },
  // Modal styles
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
  },
  settingsSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  crewImageSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  crewImagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  crewImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  crewImagePlaceholderText: {
    fontSize: 12,
    color: colors.muted,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingsRowLeft: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
  },
  settingsRowSubtitle: {
    fontSize: 13,
    color: colors.tertiary,
  },
  inviteCodeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  inviteCodeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brand,
    letterSpacing: 4,
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  inviteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.negative,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.negative,
  },
  // Profile modal styles
  profileContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  profileAvatarLargeText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.foreground,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.lg,
  },
  profileBioCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileBio: {
    fontSize: 15,
    color: colors.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
});
