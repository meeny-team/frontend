/**
 * Meeny - Play Detail Screen
 * 플레이 상세 (핀 타임라인)
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  getPlayById,
  getCrewById,
  getPinsByPlayId,
  getUserById,
  getPlayTotalAmount,
  getPlayAverageAmount,
  getPlayMembers,
  formatCurrency,
  formatDateRange,
  PLAY_TYPE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CURRENT_USER,
  Pin,
  User,
} from '../../api';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type NavigationProp = NativeStackNavigationProp<AuthorizedStackParamList>;
type RouteProps = RouteProp<AuthorizedStackParamList, 'PlayDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function PencilIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
}

function CircleDollarIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <Line x1="12" y1="18" x2="12" y2="6" />
    </Svg>
  );
}

function SettingsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

interface PinCardProps {
  pin: Pin;
  onPress: () => void;
  onPressAuthor?: () => void;
}

function PinCard({ pin, onPress, onPressAuthor }: PinCardProps) {
  const author = getUserById(pin.authorId);
  const categoryColor = CATEGORY_COLORS[pin.category];

  const displayName = author?.nickname;
  const displayInitial = author?.nickname?.[0];

  return (
    <TouchableOpacity style={styles.pinCard} onPress={onPress} activeOpacity={0.7}>
      {/* Timeline Dot */}
      <View style={styles.timelineDot}>
        <View style={[styles.dot, { backgroundColor: categoryColor }]} />
        <View style={styles.timeline} />
      </View>

      {/* Content */}
      <View style={styles.pinContent}>
        {/* Author */}
        <View style={styles.pinAuthor}>
          <TouchableOpacity onPress={onPressAuthor} disabled={!onPressAuthor} activeOpacity={0.7}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{displayInitial}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressAuthor} disabled={!onPressAuthor} activeOpacity={0.7}>
            <Text style={styles.authorName}>{displayName}</Text>
          </TouchableOpacity>
        </View>

        {/* Image */}
        {pin.images && pin.images.length > 0 && (
          <Image source={{ uri: pin.images[0] }} style={styles.pinImage} />
        )}

        {/* Info */}
        <View style={styles.pinInfo}>
          <View style={styles.pinHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {CATEGORY_LABELS[pin.category]}
              </Text>
            </View>
            <Text style={styles.pinAmount}>{formatCurrency(pin.amount)}</Text>
          </View>
          <Text style={styles.pinTitle}>{pin.title}</Text>
          {pin.memo && <Text style={styles.pinMemo}>{pin.memo}</Text>}
          {pin.location && <Text style={styles.pinLocation}>📍 {pin.location}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PlayDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { playId } = route.params;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const play = getPlayById(playId);
  const crew = play ? getCrewById(play.crewId) : undefined;
  const pins = getPinsByPlayId(playId);
  const totalAmount = getPlayTotalAmount(playId);
  const avgAmount = getPlayAverageAmount(playId);
  const playMembers = getPlayMembers(playId);

  // Check if current user is a member of this crew
  const isMember = crew?.members.includes(CURRENT_USER.id) ?? false;

  if (!play) {
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{play.title}</Text>
        {isMember ? (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('PlaySettings', { playId })}
          >
            <SettingsIcon />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {play.coverImage ? (
            <Image source={{ uri: play.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Text style={styles.coverPlaceholderText}>{play.title[0]}</Text>
            </View>
          )}
          <View style={styles.coverGradient} />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{PLAY_TYPE_LABELS[play.type]}</Text>
            <Text style={styles.infoDot}>·</Text>
            <Text style={styles.infoLabel}>{play.region || '미정'}</Text>
            <Text style={styles.infoDot}>·</Text>
            <Text style={styles.infoLabel}>
              {formatDateRange(play.dateRange)}
            </Text>
          </View>

          {/* Tags */}
          {play.tags && play.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {play.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Members - only visible to crew members */}
        {isMember && (
          <View style={styles.membersSection}>
            <Text style={styles.membersLabel}>참여 멤버 ({playMembers.length}명)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.membersRow}>
                {playMembers.map(member => (
                  <View key={member.id} style={styles.memberChip}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{member.nickname[0]}</Text>
                    </View>
                    <Text style={styles.memberName}>{member.nickname}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>총 금액</Text>
            <Text style={styles.statValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>1인당 평균</Text>
            <Text style={styles.statValue}>{formatCurrency(avgAmount)}</Text>
          </View>
        </View>

        {/* Pins Timeline */}
        <View style={styles.pinsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>핀 타임라인</Text>
            {isMember && (
              <View style={styles.sectionActions}>
                <TouchableOpacity
                  style={styles.sectionIconButton}
                  onPress={() => navigation.navigate('AddPin', { playId })}
                >
                  <PencilIcon color={colors.brand} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sectionIconButton}
                  onPress={() => navigation.navigate('Settlement', { playId })}
                >
                  <CircleDollarIcon color={colors.brand} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {pins.map(pin => {
            const author = getUserById(pin.authorId);
            return (
              <PinCard
                key={pin.id}
                pin={pin}
                onPress={() => navigation.navigate('PinDetail', { pinId: pin.id })}
                onPressAuthor={author ? () => setSelectedUser(author) : undefined}
              />
            );
          })}
          {pins.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📍</Text>
              <Text style={styles.emptyText}>아직 핀이 없어요</Text>
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <View style={{ width: 40 }} />
            <Text style={styles.modalTitle}>프로필</Text>
            <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.modalCloseButton}>
              <XIcon />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <View style={styles.profileContent}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarLargeText}>{selectedUser.nickname[0]}</Text>
              </View>
              <Text style={styles.profileName}>{selectedUser.nickname}</Text>
              <View style={styles.profileBioCard}>
                <Text style={styles.profileBio}>
                  {selectedUser.bio || '아직 자기소개가 없습니다.'}
                </Text>
              </View>
            </View>
          )}
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  headerRight: {
    width: 40,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: colors.elevated,
  },
  coverPlaceholder: {
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.muted,
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  coverActions: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
  },
  coverActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  infoDot: {
    fontSize: 14,
    color: colors.muted,
    marginHorizontal: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.brandMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '500',
  },
  membersSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  membersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  membersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
    paddingLeft: 4,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground,
  },
  statsSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  pinsSection: {
    padding: spacing.lg,
  },
  sectionHeader: {
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
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCard: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineDot: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timeline: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  pinContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  pinImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  pinInfo: {
    padding: spacing.md,
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pinAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  pinTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  pinMemo: {
    fontSize: 13,
    color: colors.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  pinLocation: {
    fontSize: 12,
    color: colors.tertiary,
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
    fontSize: 14,
    color: colors.muted,
  },
  errorText: {
    fontSize: 14,
    color: colors.negative,
    textAlign: 'center',
    marginTop: 100,
  },
  // Profile modal styles
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
