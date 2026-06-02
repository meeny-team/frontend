/**
 * Meeny - 카테고리별 지출 통계 카드
 *
 * 백엔드 GET /api/plays/{id}/stats 또는 /api/crews/{id}/stats 결과를
 * 카테고리 색상 progress bar 로 표시. 차트 라이브러리 없이 RN 기본 View 만 사용.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../design';
import { CategoryStats } from '../api/stats';
import { CATEGORY_LABELS, CATEGORY_COLORS, formatCurrency } from '../api';

interface Props {
  stats: CategoryStats;
  title?: string;
}

export function CategoryStatsCard({ stats, title = '카테고리별 지출' }: Props) {
  if (stats.totalAmount === 0) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.total}>{formatCurrency(stats.totalAmount)}</Text>
      </View>
      {stats.byCategory.map(stat => (
        <View key={stat.category} style={styles.row}>
          <View style={styles.rowHead}>
            <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[stat.category] }]} />
            <Text style={styles.label}>{CATEGORY_LABELS[stat.category]}</Text>
            <Text style={styles.amount}>{formatCurrency(stat.totalAmount)}</Text>
            <Text style={styles.percentage}>{stat.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(2, stat.percentage)}%`,
                  backgroundColor: CATEGORY_COLORS[stat.category],
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  row: {
    marginBottom: spacing.sm,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: colors.secondary,
  },
  amount: {
    fontSize: 13,
    color: colors.foreground,
    marginRight: spacing.sm,
  },
  percentage: {
    fontSize: 12,
    color: colors.tertiary,
    minWidth: 32,
    textAlign: 'right',
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.elevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
