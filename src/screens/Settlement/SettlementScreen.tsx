/**
 * Meeny - Settlement Screen
 * 정산 현황 - 핀 단위 상세 보기 + 양방향 확인
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Polyline, Path, Circle, Line } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  getPlayById,
  getCrewById,
  getUserById,
  getPinsByPlayId,
  getPlayTotalAmount,
  getPlayAverageAmount,
  formatCurrency,
  CURRENT_USER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  Pin,
} from '../../api';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type RouteProps = RouteProp<AuthorizedStackParamList, 'Settlement'>;

// 정산 상태 타입
type SettlementStatus = 'pending' | 'sent' | 'completed';

// 각 정산 항목의 상태를 관리하기 위한 키
interface SettlementItemKey {
  pinId: string;
  fromUserId: string;
  toUserId: string;
}

interface SettlementItemState {
  status: SettlementStatus;
  sentAt?: string;
  completedAt?: string;
}

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function ChevronDownIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

function ChevronUpIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Polyline points="18 15 12 9 6 15" />
    </Svg>
  );
}

function ArrowRightIcon({ color = colors.brand }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

function CheckIcon({ color = colors.positive }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth={2}>
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Line x1="22" y1="2" x2="11" y2="13" />
      <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  );
}

type TabType = 'all' | 'pending' | 'completed';

export default function SettlementScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { playId } = route.params;

  const play = getPlayById(playId);
  const crew = play ? getCrewById(play.crewId) : undefined;
  const pins = getPinsByPlayId(playId);
  const totalAmount = getPlayTotalAmount(playId);
  const avgAmount = getPlayAverageAmount(playId);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedPins, setExpandedPins] = useState<Set<string>>(new Set());

  // 정산 상태 관리 (실제로는 서버에서 가져와야 함)
  // 예시: 흑돼지 술값(pin1b)에서 서연(u2)이 나(u1)에게 이미 "보냈음" 표시
  const [settlementStates, setSettlementStates] = useState<Record<string, SettlementItemState>>({
    'pin1b:u2:u1': { status: 'sent', sentAt: '2024-03-16T10:00:00Z' },  // 서연 → 나: 확인 대기중
  });

  // 정산 키 생성
  const getSettlementKey = (pinId: string, fromUserId: string, toUserId: string) =>
    `${pinId}:${fromUserId}:${toUserId}`;

  // 정산 상태 가져오기
  const getSettlementState = (pinId: string, fromUserId: string, toUserId: string): SettlementItemState => {
    const key = getSettlementKey(pinId, fromUserId, toUserId);
    return settlementStates[key] || { status: 'pending' };
  };

  // 각 핀의 정산 항목 계산
  const pinSettlements = useMemo(() => {
    return pins.map(pin => {
      const paidBy = pin.settlement.paidBy;
      const payer = getUserById(paidBy);

      // 결제자가 아닌 사람들이 결제자에게 보내야 할 금액
      const settlements = pin.settlement.splits
        .filter(split => split.userId !== paidBy && split.amount > 0)
        .map(split => ({
          pinId: pin.id,
          from: split.userId,
          to: paidBy,
          amount: split.amount,
        }));

      return {
        pin,
        payer,
        settlements,
      };
    }).filter(item => item.settlements.length > 0);
  }, [pins]);

  // 전체 정산 통계 계산
  const stats = useMemo(() => {
    let pendingCount = 0;
    let sentCount = 0;
    let completedCount = 0;
    let pendingAmount = 0;
    let completedAmount = 0;

    pinSettlements.forEach(({ pin, settlements }) => {
      settlements.forEach(s => {
        const state = getSettlementState(s.pinId, s.from, s.to);
        if (state.status === 'pending') {
          pendingCount++;
          pendingAmount += s.amount;
        } else if (state.status === 'sent') {
          sentCount++;
          pendingAmount += s.amount;
        } else {
          completedCount++;
          completedAmount += s.amount;
        }
      });
    });

    const totalCount = pendingCount + sentCount + completedCount;
    return { pendingCount, sentCount, completedCount, totalCount, pendingAmount, completedAmount };
  }, [pinSettlements, settlementStates]);

  // 보내기 (발신자)
  const handleSend = (pinId: string, fromUserId: string, toUserId: string) => {
    const key = getSettlementKey(pinId, fromUserId, toUserId);
    setSettlementStates(prev => ({
      ...prev,
      [key]: { status: 'sent', sentAt: new Date().toISOString() },
    }));
  };

  // 보내기 취소 (발신자)
  const handleCancelSend = (pinId: string, fromUserId: string, toUserId: string) => {
    Alert.alert(
      '보내기 취소',
      '정말 보내기를 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: () => {
            const key = getSettlementKey(pinId, fromUserId, toUserId);
            setSettlementStates(prev => ({
              ...prev,
              [key]: { status: 'pending' },
            }));
          },
        },
      ]
    );
  };

  // 받기 확인 (수신자)
  const handleConfirmReceive = (pinId: string, fromUserId: string, toUserId: string, amount: number) => {
    const fromUser = getUserById(fromUserId);
    Alert.alert(
      '정산 확인',
      `${fromUser?.nickname}님에게 ${formatCurrency(amount)}을 받으셨나요?\n\n⚠️ 확인 후에는 되돌릴 수 없습니다.`,
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '받았음',
          style: 'default',
          onPress: () => {
            const key = getSettlementKey(pinId, fromUserId, toUserId);
            setSettlementStates(prev => ({
              ...prev,
              [key]: {
                status: 'completed',
                sentAt: prev[key]?.sentAt,
                completedAt: new Date().toISOString()
              },
            }));
          },
        },
      ]
    );
  };

  // 핀 확장/축소 토글
  const togglePin = (pinId: string) => {
    setExpandedPins(prev => {
      const next = new Set(prev);
      if (next.has(pinId)) {
        next.delete(pinId);
      } else {
        next.add(pinId);
      }
      return next;
    });
  };

  // 필터된 핀 정산 목록
  const filteredPinSettlements = useMemo(() => {
    if (activeTab === 'all') return pinSettlements;

    return pinSettlements.map(item => ({
      ...item,
      settlements: item.settlements.filter(s => {
        const state = getSettlementState(s.pinId, s.from, s.to);
        if (activeTab === 'pending') {
          return state.status === 'pending' || state.status === 'sent';
        }
        return state.status === 'completed';
      }),
    })).filter(item => item.settlements.length > 0);
  }, [pinSettlements, activeTab, settlementStates]);

  if (!play || !crew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>플레이를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const progressPercent = stats.totalCount > 0
    ? (stats.completedCount / stats.totalCount) * 100
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정산 현황</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Play Info */}
        <View style={styles.playInfo}>
          <Text style={styles.playTitle}>{play.title}</Text>
          <Text style={styles.crewName}>{crew.name}</Text>
        </View>

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
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>멤버</Text>
            <Text style={styles.statValue}>{play.members.length}명</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>정산 진행률</Text>
            <Text style={styles.progressCount}>
              {stats.completedCount}/{stats.totalCount}건 완료
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <View style={[styles.statusDot, styles.statusDotPending]} />
              <Text style={styles.progressStatText}>대기 {stats.pendingCount}</Text>
            </View>
            <View style={styles.progressStatItem}>
              <View style={[styles.statusDot, styles.statusDotSent]} />
              <Text style={styles.progressStatText}>확인중 {stats.sentCount}</Text>
            </View>
            <View style={styles.progressStatItem}>
              <View style={[styles.statusDot, styles.statusDotCompleted]} />
              <Text style={styles.progressStatText}>완료 {stats.completedCount}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              전체 ({stats.totalCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              미정산 ({stats.pendingCount + stats.sentCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              완료 ({stats.completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pin Settlements List */}
        <View style={styles.settlementsSection}>
          {filteredPinSettlements.length > 0 ? (
            filteredPinSettlements.map(({ pin, payer, settlements }) => {
              const isExpanded = expandedPins.has(pin.id);
              const categoryColor = CATEGORY_COLORS[pin.category];
              const completedCount = settlements.filter(s =>
                getSettlementState(s.pinId, s.from, s.to).status === 'completed'
              ).length;

              return (
                <View key={pin.id} style={styles.pinCard}>
                  {/* Pin Header */}
                  <TouchableOpacity
                    style={styles.pinHeader}
                    onPress={() => togglePin(pin.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pinInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                      <View style={styles.pinTitleArea}>
                        <Text style={styles.pinTitle}>{pin.title}</Text>
                        <Text style={styles.pinMeta}>
                          {CATEGORY_LABELS[pin.category]} · {formatCurrency(pin.amount)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pinHeaderRight}>
                      <Text style={styles.pinSettlementCount}>
                        {completedCount}/{settlements.length}
                      </Text>
                      {isExpanded ? <ChevronUpIcon color={colors.tertiary} /> : <ChevronDownIcon color={colors.tertiary} />}
                    </View>
                  </TouchableOpacity>

                  {/* Pin Settlement Details */}
                  {isExpanded && (
                    <View style={styles.pinSettlements}>
                      <View style={styles.payerInfo}>
                        <Text style={styles.payerLabel}>결제자</Text>
                        <View style={styles.payerUser}>
                          <View style={styles.miniAvatar}>
                            <Text style={styles.miniAvatarText}>{payer?.nickname[0]}</Text>
                          </View>
                          <Text style={styles.payerName}>{payer?.nickname}</Text>
                        </View>
                      </View>

                      {settlements.map((settlement, idx) => {
                        const fromUser = getUserById(settlement.from);
                        const toUser = getUserById(settlement.to);
                        const state = getSettlementState(settlement.pinId, settlement.from, settlement.to);
                        const isFromMe = settlement.from === CURRENT_USER.id;
                        const isToMe = settlement.to === CURRENT_USER.id;

                        return (
                          <View key={idx} style={styles.settlementItem}>
                            <View style={styles.settlementRow}>
                              {/* From User */}
                              <View style={styles.settlementUser}>
                                <View style={[styles.userAvatar, isFromMe && styles.userAvatarMe]}>
                                  <Text style={styles.userAvatarText}>{fromUser?.nickname[0]}</Text>
                                </View>
                                <Text style={styles.settlementUserName}>
                                  {fromUser?.nickname}
                                  {isFromMe && <Text style={styles.meTag}> (나)</Text>}
                                </Text>
                              </View>

                              {/* Arrow & Amount */}
                              <View style={styles.settlementCenter}>
                                <ArrowRightIcon color={state.status === 'completed' ? colors.positive : colors.brand} />
                                <Text style={[
                                  styles.settlementAmount,
                                  state.status === 'completed' && styles.settlementAmountCompleted
                                ]}>
                                  {formatCurrency(settlement.amount)}
                                </Text>
                              </View>

                              {/* To User */}
                              <View style={styles.settlementUser}>
                                <View style={[styles.userAvatar, styles.userAvatarReceiver, isToMe && styles.userAvatarMe]}>
                                  <Text style={styles.userAvatarText}>{toUser?.nickname[0]}</Text>
                                </View>
                                <Text style={styles.settlementUserName}>
                                  {toUser?.nickname}
                                  {isToMe && <Text style={styles.meTag}> (나)</Text>}
                                </Text>
                              </View>
                            </View>

                            {/* Status & Actions */}
                            <View style={styles.settlementActions}>
                              {state.status === 'pending' && (
                                <>
                                  {isFromMe ? (
                                    <TouchableOpacity
                                      style={styles.sendButton}
                                      onPress={() => handleSend(settlement.pinId, settlement.from, settlement.to)}
                                    >
                                      <SendIcon />
                                      <Text style={styles.sendButtonText}>보냈음</Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <View style={styles.statusBadge}>
                                      <ClockIcon />
                                      <Text style={styles.statusBadgeText}>대기중</Text>
                                    </View>
                                  )}
                                </>
                              )}

                              {state.status === 'sent' && (
                                <>
                                  {isFromMe ? (
                                    <TouchableOpacity
                                      style={styles.cancelButton}
                                      onPress={() => handleCancelSend(settlement.pinId, settlement.from, settlement.to)}
                                    >
                                      <Text style={styles.cancelButtonText}>취소</Text>
                                    </TouchableOpacity>
                                  ) : isToMe ? (
                                    <TouchableOpacity
                                      style={styles.receiveButton}
                                      onPress={() => handleConfirmReceive(settlement.pinId, settlement.from, settlement.to, settlement.amount)}
                                    >
                                      <CheckIcon color={colors.foreground} />
                                      <Text style={styles.receiveButtonText}>받았음</Text>
                                    </TouchableOpacity>
                                  ) : null}
                                  <View style={[styles.statusBadge, styles.statusBadgeSent]}>
                                    <ClockIcon />
                                    <Text style={[styles.statusBadgeText, styles.statusBadgeTextSent]}>확인 대기</Text>
                                  </View>
                                </>
                              )}

                              {state.status === 'completed' && (
                                <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                                  <CheckIcon color={colors.positive} />
                                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextCompleted]}>완료</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>
                {activeTab === 'completed' ? '✨' : '📋'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'completed' ? '아직 완료된 정산이 없어요' :
                 activeTab === 'pending' ? '모든 정산이 완료되었어요!' :
                 '정산할 내역이 없어요'}
              </Text>
            </View>
          )}
        </View>

        {/* Summary */}
        {stats.totalCount > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>정산 요약</Text>
            <View style={styles.summaryCards}>
              <View style={[styles.summaryCard, styles.summaryCardPending]}>
                <Text style={styles.summaryCardLabel}>미정산</Text>
                <Text style={styles.summaryCardValue}>{formatCurrency(stats.pendingAmount)}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardCompleted]}>
                <Text style={styles.summaryCardLabel}>완료</Text>
                <Text style={[styles.summaryCardValue, styles.summaryCardValueCompleted]}>
                  {formatCurrency(stats.completedAmount)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: insets.bottom + spacing['3xl'] }} />
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
  playInfo: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  crewName: {
    fontSize: 14,
    color: colors.secondary,
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
    fontSize: 11,
    color: colors.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  progressSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.elevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.positive,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  progressStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotPending: {
    backgroundColor: colors.muted,
  },
  statusDotSent: {
    backgroundColor: colors.warning,
  },
  statusDotCompleted: {
    backgroundColor: colors.positive,
  },
  progressStatText: {
    fontSize: 12,
    color: colors.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  settlementsSection: {
    padding: spacing.lg,
  },
  pinCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  pinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  pinTitleArea: {
    flex: 1,
  },
  pinTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 2,
  },
  pinMeta: {
    fontSize: 12,
    color: colors.tertiary,
  },
  pinHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pinSettlementCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  pinSettlements: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    backgroundColor: colors.elevated,
  },
  payerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  payerLabel: {
    fontSize: 12,
    color: colors.tertiary,
    marginRight: spacing.md,
  },
  payerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  payerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  settlementItem: {
    marginBottom: spacing.lg,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementUser: {
    alignItems: 'center',
    width: 70,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userAvatarReceiver: {
    backgroundColor: colors.brandMuted,
  },
  userAvatarMe: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  settlementUserName: {
    fontSize: 12,
    color: colors.secondary,
  },
  meTag: {
    color: colors.brand,
    fontWeight: '600',
  },
  settlementCenter: {
    alignItems: 'center',
    flex: 1,
  },
  settlementAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 4,
  },
  settlementAmountCompleted: {
    color: colors.positive,
    textDecorationLine: 'line-through',
  },
  settlementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  receiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.positive,
    borderRadius: radius.full,
  },
  receiveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
  statusBadgeSent: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.muted,
  },
  statusBadgeTextSent: {
    color: colors.warning,
  },
  statusBadgeTextCompleted: {
    color: colors.positive,
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
    fontSize: 15,
    color: colors.secondary,
  },
  summarySection: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  summaryCardPending: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: colors.positive,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: spacing.xs,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  summaryCardValueCompleted: {
    color: colors.positive,
  },
  errorText: {
    fontSize: 14,
    color: colors.negative,
    textAlign: 'center',
    marginTop: 100,
  },
});
