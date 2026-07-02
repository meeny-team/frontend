/**
 * Meeny — 이 플레이의 핀 사진 중 하나를 커버로 고르는 모달
 *
 * PlaySettings 커버 섹션에서 사용. fetchPinsByPlayId 로 핀 목록을 받아
 * 각 핀의 images 를 flatMap 해 그리드로 노출. 사용자가 하나 탭하면 onSelect(url).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../design';
import { fetchPinsByPlayId } from '../../api';

interface Props {
  visible: boolean;
  playId: string;
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.lg;
const GRID_GAP = spacing.sm;
const CELL_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

export function PinImagePickerModal({ visible, playId, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    let canceled = false;
    setLoading(true);
    (async () => {
      const res = await fetchPinsByPlayId(playId);
      if (canceled) return;
      // dedupe: 같은 이미지 URL 이 여러 핀에 등장할 수 있음
      const seen = new Set<string>();
      const list: string[] = [];
      for (const pin of res.data) {
        for (const url of pin.images ?? []) {
          if (!seen.has(url)) {
            seen.add(url);
            list.push(url);
          }
        }
      }
      setImages(list);
      setLoading(false);
    })();
    return () => { canceled = true; };
  }, [visible, playId]);

  const grid = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < images.length; i += 3) {
      rows.push(images.slice(i, i + 3));
    }
    return rows;
  }, [images]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grip} />
          <View style={styles.header}>
            <Text style={styles.title}>핀 사진에서 선택</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>불러오는 중...</Text>
              </View>
            ) : images.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyText}>이 플레이의 핀에 등록된 사진이 없어요</Text>
              </View>
            ) : (
              grid.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.row}>
                  {row.map(url => (
                    <TouchableOpacity
                      key={url}
                      style={styles.cell}
                      onPress={() => { onSelect(url); onClose(); }}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: url }} style={styles.cellImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    maxHeight: '80%',
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  closeText: {
    fontSize: 14,
    color: colors.secondary,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: GRID_PADDING,
    gap: GRID_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.elevated,
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondary,
  },
});
