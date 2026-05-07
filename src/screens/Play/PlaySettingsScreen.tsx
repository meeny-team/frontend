/**
 * Meeny - Play Settings Screen
 * 플레이 설정 (제목, 태그, 멤버 수정)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Path, Line, Polyline } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import {
  PLAY_TYPE_LABELS,
  REGIONS,
  PlayType,
  Play,
  Crew,
  fetchPlayById,
  fetchCrewById,
  updatePlay,
  deletePlay,
} from '../../api';
import { useAuth } from '../../auth/Auth';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type RouteProps = RouteProp<AuthorizedStackParamList, 'PlaySettings'>;

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function CheckIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

function XIcon({ size = 16, color = colors.foreground }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

function PlusIcon({ size = 14, color = colors.foreground }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.negative} strokeWidth={2}>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

const PLAY_TYPES: PlayType[] = ['travel', 'date', 'hangout', 'daily', 'etc'];

export default function PlaySettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { playId } = route.params;
  const { user } = useAuth();
  // mock 데이터의 userId 는 string("u1"), 백엔드 user.id 는 number → 비교 시 string 으로 통일
  const myId = user ? String(user.id) : null;

  const [play, setPlay] = useState<Play | null>(null);
  const [crew, setCrew] = useState<Crew | null>(null);
  const crewMembers = useMemo(() => crew?.members ?? [], [crew]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<PlayType>('travel');
  const [region, setRegion] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const playRes = await fetchPlayById(playId);
      if (canceled || !playRes.data) return;
      const p = playRes.data;
      setPlay(p);
      setTitle(p.title);
      setType(p.type);
      setRegion(p.region ?? '');
      setTags(p.tags ?? []);
      setSelectedMemberIds(p.members.map(m => m.id));

      const crewRes = await fetchCrewById(p.crewId);
      if (canceled || !crewRes.data) return;
      setCrew(crewRes.data);
    })();
    return () => {
      canceled = true;
    };
  }, [playId]);

  if (!play || !crew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>플레이를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const toggleMember = (memberId: string) => {
    if (memberId === myId) return;
    setSelectedMemberIds((prev: string[]) =>
      prev.includes(memberId)
        ? prev.filter((id: string) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // 변경된 필드만 PATCH /api/plays/{playId} 로 전송. 백엔드는 부분 업데이트를 허용.
  const handleSave = async () => {
    if (!play || saving) return;
    const patch: Partial<{
      title: string;
      type: PlayType;
      region: string;
      tags: string[];
      memberIds: string[];
    }> = {};
    if (title.trim() !== play.title) patch.title = title.trim();
    if (type !== play.type) patch.type = type;
    const prevRegion = play.region ?? '';
    if (region !== prevRegion) patch.region = region;
    const prevTags = play.tags ?? [];
    if (
      tags.length !== prevTags.length ||
      tags.some((t, i) => t !== prevTags[i])
    ) patch.tags = tags;
    const prevMemberIds = play.members.map(m => m.id);
    const sortedNew = [...selectedMemberIds].sort();
    const sortedOld = [...prevMemberIds].sort();
    if (
      sortedNew.length !== sortedOld.length ||
      sortedNew.some((id, i) => id !== sortedOld[i])
    ) patch.memberIds = selectedMemberIds;

    if (Object.keys(patch).length === 0) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    const res = await updatePlay(playId, patch);
    setSaving(false);
    if (!res.data) {
      Alert.alert('저장 실패', res.message ?? '플레이를 저장하지 못했습니다.');
      return;
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      '플레이 삭제',
      '이 플레이를 삭제하시겠습니까? 모든 핀과 정산 기록이 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (deleting) return;
            setDeleting(true);
            const res = await deletePlay(playId);
            setDeleting(false);
            if (!res.data) {
              Alert.alert('삭제 실패', res.message ?? '플레이를 삭제하지 못했습니다.');
              return;
            }
            // 상세 화면이 사라진 플레이를 다시 조회하지 않도록 두 단계 뒤로.
            navigation.goBack();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isValid = title.trim().length > 0 && selectedMemberIds.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플레이 설정</Text>
        <TouchableOpacity
          style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          <Text style={styles.saveButtonText}>{saving ? '저장 중...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>플레이 제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="플레이 제목"
            placeholderTextColor={colors.muted}
            maxLength={30}
          />
        </View>

        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>유형</Text>
          <View style={styles.typeGrid}>
            {PLAY_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, type === t && styles.typeOptionActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                  {PLAY_TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Region */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>지역</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.regionRow}>
              {REGIONS.filter(r => r !== '전체').map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.regionChip, region === r && styles.regionChipActive]}
                  onPress={() => setRegion(region === r ? '' : r)}
                >
                  <Text style={[styles.regionText, region === r && styles.regionTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>태그</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <XIcon size={12} color={colors.brand} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="새 태그 입력"
              placeholderTextColor={colors.muted}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.tagAddButton} onPress={addTag}>
              <PlusIcon size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>참여 멤버</Text>
            <Text style={styles.memberCount}>{selectedMemberIds.length}명</Text>
          </View>
          <View style={styles.memberList}>
            {crewMembers.map(member => {
              if (!member) return null;
              const isSelected = selectedMemberIds.includes(member.id);
              const isCurrentUser = member.id === myId;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberItem,
                    isSelected && styles.memberItemSelected,
                  ]}
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
                  </View>
                  {isSelected && (
                    <View style={styles.memberCheck}>
                      <CheckIcon color={colors.brand} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Delete */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.saveButtonDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <TrashIcon />
            <Text style={styles.deleteButtonText}>
              {deleting ? '삭제 중...' : '플레이 삭제'}
            </Text>
          </TouchableOpacity>
        </View>

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
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary,
  },
  typeTextActive: {
    color: colors.foreground,
  },
  regionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  regionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionChipActive: {
    backgroundColor: colors.brandMuted,
    borderColor: colors.brand,
  },
  regionText: {
    fontSize: 13,
    color: colors.secondary,
  },
  regionTextActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '500',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagAddButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleOption: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  toggleOptionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  toggleTextActive: {
    color: colors.brand,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.tertiary,
  },
  memberCount: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
  memberList: {
    gap: spacing.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  memberItemSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandMuted,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: colors.brand,
  },
  memberAvatarText: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
  },
  memberNameSelected: {
    color: colors.brand,
  },
  memberYou: {
    fontWeight: '400',
    color: colors.tertiary,
  },
  memberCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerSection: {
    padding: spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.negative,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.negative,
  },
  errorText: {
    fontSize: 14,
    color: colors.negative,
    textAlign: 'center',
    marginTop: 100,
  },
});
