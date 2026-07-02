/**
 * Meeny — 은행 선택 모달
 *
 * 프로필 편집에서 계좌 등록 시 사용. RN 내장 Modal + ScrollView 로 새 native dep 없이 구현.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../design';
import { BANKS } from '../../data/banks';

interface Props {
  visible: boolean;
  selectedCode?: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export function BankPickerModal({ visible, selectedCode, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.title}>은행 선택</Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {BANKS.map(bank => {
              const selected = bank.code === selectedCode;
              return (
                <TouchableOpacity
                  key={bank.code}
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => {
                    onSelect(bank.code);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    maxHeight: '75%',
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemSelected: {
    backgroundColor: colors.elevated,
  },
  itemText: {
    fontSize: 15,
    color: colors.foreground,
  },
  itemTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
});
