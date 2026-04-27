/**
 * Meeny - Play Settings Screen
 * 플레이 설정 (제목, 태그, 멤버 수정)
 */

import React, { useState, useMemo } from 'react';
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
  getPlayById,
  getCrewById,
  getUserById,
  PLAY_TYPE_LABELS,
  DOMESTIC_REGIONS,
  OVERSEAS_REGIONS,
  RegionGroup,
  PlayType,
  CURRENT_USER,
} from '../../api';
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

  const play = getPlayById(playId);
  const crew = play ? getCrewById(play.crewId) : undefined;
  const crewMembers = useMemo(() => {
    if (!crew) return [];
    return crew.members.map(id => getUserById(id)).filter(u => u !== undefined);
  }, [crew]);

  const [title, setTitle] = useState(play?.title || '');
  const [type, setType] = useState<PlayType>(play?.type || 'travel');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(play?.regions || []);
  const [tags, setTags] = useState<string[]>(play?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(play?.members || []);

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

  if (!play || !crew) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>플레이를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const toggleMember = (memberId: string) => {
    if (memberId === CURRENT_USER.id) return;
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
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

  const handleSave = () => {
    // TODO: Actually save the changes
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
          onPress: () => {
            // TODO: Actually delete
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isValid = title.trim().length > 0 && selectedMembers.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>플레이 설정</Text>
        <TouchableOpacity
          style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text style={styles.saveButtonText}>저장</Text>
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
          {/* 주요 지역 빠른 선택 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.regionRow}>
              {DOMESTIC_REGIONS.slice(0, 5).flatMap((group: RegionGroup) =>
                group.regions.filter(r => r !== '전체').slice(0, 3).map(r => {
                  const fullRegion = `${group.label} ${r}`;
                  const isSelected = selectedRegions.includes(fullRegion);
                  return (
                    <TouchableOpacity
                      key={fullRegion}
                      style={[styles.regionChip, isSelected && styles.regionChipActive]}
                      onPress={() => toggleRegion(group.label, r)}
                    >
                      <Text style={[styles.regionText, isSelected && styles.regionTextActive]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
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
            <Text style={styles.memberCount}>{selectedMembers.length}명</Text>
          </View>
          <View style={styles.memberList}>
            {crewMembers.map(member => {
              if (!member) return null;
              const isSelected = selectedMembers.includes(member.id);
              const isCurrentUser = member.id === CURRENT_USER.id;
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
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <TrashIcon />
            <Text style={styles.deleteButtonText}>플레이 삭제</Text>
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
    fontSize: 13,
    fontWeight: '500',
    color: colors.brand,
  },
  selectedRegionRemove: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
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
