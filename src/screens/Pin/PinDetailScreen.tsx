/**
 * Meeny - Pin Detail Screen
 * 핀 상세
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Polyline, Line } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  fetchPinById,
  fetchPlayById,
  formatCurrency,
  formatDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  Pin,
  Play,
  MemberSummary,
} from '../../api';
import { useAuth } from '../../auth/Auth';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type RouteProps = RouteProp<AuthorizedStackParamList, 'PinDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
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

export default function PinDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { pinId } = route.params;
  const { user } = useAuth();
  // mock 데이터의 userId 는 string("u1"), 백엔드 user.id 는 number 라 비교 시 string 으로 통일
  const myId = user ? String(user.id) : null;

  const [pin, setPin] = useState<Pin | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [selectedUser, setSelectedUser] = useState<MemberSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let canceled = false;
      (async () => {
        const pinRes = await fetchPinById(pinId);
        if (canceled || !pinRes.data) return;
        setPin(pinRes.data);
        // 핀이 속한 플레이의 멤버 정보(닉네임 매핑) 가 필요해 같이 fetch
        const playRes = await fetchPlayById(pinRes.data.playId);
        if (canceled || !playRes.data) return;
        setPlay(playRes.data);
      })();
      return () => {
        canceled = true;
      };
    }, [pinId]),
  );

  // play.members 를 통해 임의의 userId → MemberSummary 매핑
  const memberMap = new Map((play?.members ?? []).map(m => [m.id, m]));
  const author = pin ? memberMap.get(pin.authorId) : undefined;
  const categoryColor = pin ? CATEGORY_COLORS[pin.category] : colors.muted;

  const getDisplayName = (userId: string) => memberMap.get(userId)?.nickname ?? '알 수 없음';
  const getDisplayInitial = (userId: string) => getDisplayName(userId)[0] ?? '?';

  if (!pin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>핀을 찾을 수 없습니다</Text>
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
        <TouchableOpacity
          style={styles.headerAuthor}
          onPress={() => {
            if (author) {
              setSelectedUser(author);
            }
          }}
          disabled={!author}
        >
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{getDisplayInitial(pin.authorId)}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{getDisplayName(pin.authorId)}</Text>
            <Text style={styles.authorTime}>{formatDate(pin.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Images */}
          {pin.images && pin.images.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroller}
            >
              {pin.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.pinImage} />
              ))}
            </ScrollView>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Category & Amount */}
            <View style={styles.contentHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {CATEGORY_LABELS[pin.category]}
                </Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(pin.amount)}</Text>
            </View>

            {/* Title & Memo */}
            <Text style={styles.title}>{pin.title}</Text>
            {pin.memo && <Text style={styles.memo}>{pin.memo}</Text>}
            {pin.location && <Text style={styles.location}>📍 {pin.location}</Text>}

            {/* Play Info */}
            {play && (
              <View style={styles.playInfo}>
                <Text style={styles.playLabel}>플레이</Text>
                <Text style={styles.playTitle}>{play.title}</Text>
              </View>
            )}
          </View>

          {/* Settlement Info */}
          {pin.settlement && (
            <View style={styles.settlementSection}>
              <Text style={styles.settlementTitle}>💰 정산 내역</Text>

              {/* Payer Info */}
              <View style={styles.payerInfo}>
                <Text style={styles.payerLabel}>결제자</Text>
                <View style={styles.payerInfoRow}>
                  <View style={styles.payerInfoAvatar}>
                    <Text style={styles.payerInfoAvatarText}>
                      {getDisplayInitial(pin.settlement.paidBy)}
                    </Text>
                  </View>
                  <Text style={styles.payerInfoName}>
                    {getDisplayName(pin.settlement.paidBy)}
                    {pin.settlement.paidBy === myId && ' (나)'}
                  </Text>
                  <Text style={styles.payerInfoAmount}>{formatCurrency(pin.amount)}</Text>
                </View>
              </View>

              {/* Split Details */}
              <View style={styles.splitSection}>
                <Text style={styles.splitLabel}>
                  {pin.settlement.type === 'equal' ? '1/N' : '커스텀'} · {pin.settlement.splits?.length || 0}명
                </Text>
                {pin.settlement.splits?.map(split => {
                  const isCurrentUser = split.userId === myId;
                  const isPayer = split.userId === pin.settlement.paidBy;
                  return (
                    <View key={split.userId} style={styles.splitItem}>
                      <View style={styles.splitItemUser}>
                        <View style={[styles.splitItemAvatar, isPayer && styles.splitItemAvatarPayer]}>
                          <Text style={styles.splitItemAvatarText}>{getDisplayInitial(split.userId)}</Text>
                        </View>
                        <Text style={styles.splitItemName}>
                          {getDisplayName(split.userId)}
                          {isCurrentUser && ' (나)'}
                        </Text>
                      </View>
                      <Text style={[styles.splitItemAmount, isPayer && styles.splitItemAmountPayer]}>
                        {formatCurrency(split.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
                <Text style={styles.profileAvatarLargeText}>{selectedUser.nickname[0] ?? '?'}</Text>
              </View>
              <Text style={styles.profileName}>{selectedUser.nickname}</Text>
              {/* MemberSummary 에 bio 없음 — 본인 화면 외엔 표시 X */}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerAuthor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  authorTime: {
    fontSize: 12,
    color: colors.tertiary,
  },
  headerRight: {
    width: 40,
  },
  imageScroller: {
    flexGrow: 0,
  },
  pinImage: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  content: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  memo: {
    fontSize: 15,
    color: colors.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  location: {
    fontSize: 14,
    color: colors.tertiary,
  },
  playInfo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  playTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
  },
  // Settlement styles
  settlementSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settlementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  payerInfo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  payerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerInfoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerInfoAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  payerInfoName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginLeft: spacing.sm,
  },
  payerInfoAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  splitSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  splitItemUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitItemAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitItemAvatarPayer: {
    backgroundColor: colors.brand,
  },
  splitItemAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  splitItemName: {
    fontSize: 13,
    color: colors.foreground,
    marginLeft: spacing.sm,
  },
  splitItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  splitItemAmountPayer: {
    color: colors.brand,
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
