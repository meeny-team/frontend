/**
 * Meeny — 플레이 핀 지도 뷰
 *
 * 좌표가 있는 핀만 마커로 표시한다. 마커 색은 카테고리 색을 그대로 재사용.
 * 마커 탭 시 상위에서 pin 상세로 이동시킬 수 있도록 onPressPin 콜백으로 위임.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, spacing, radius } from '../../design';
import { CATEGORY_COLORS, CATEGORY_LABELS, Pin } from '../../api';

interface Props {
  pins: Pin[];
  onPressPin: (pinId: string) => void;
  height?: number;
}

// 좌표가 없는 핀은 지도에서 제외되므로 초기 카메라도 좌표가 있는 것만으로 계산한다.
function computeRegion(withCoords: Array<{ latitude: number; longitude: number }>) {
  if (withCoords.length === 0) {
    // 서울시청 근처 (기본값). 사용자가 확대/이동해 실제 위치로 이동.
    return { latitude: 37.5665, longitude: 126.978, latitudeDelta: 0.5, longitudeDelta: 0.5 };
  }
  const lats = withCoords.map(p => p.latitude);
  const lngs = withCoords.map(p => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  // 최소 delta 를 두어 한 점만 있어도 너무 붙지 않게. 여유 마진 1.5배.
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02);
  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export function PlayPinMap({ pins, onPressPin, height = 340 }: Props) {
  const pinsWithCoords = useMemo(
    () => pins.filter((p): p is Pin & { latitude: number; longitude: number } =>
      typeof p.latitude === 'number' && typeof p.longitude === 'number'
    ),
    [pins],
  );

  const region = useMemo(() => computeRegion(pinsWithCoords), [pinsWithCoords]);
  const missingCount = pins.length - pinsWithCoords.length;

  if (pinsWithCoords.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyText}>지도에 표시할 위치가 없어요</Text>
        <Text style={styles.emptyHint}>
          핀 추가 시 카카오맵에서 장소를 선택하면 지도에 마커로 표시됩니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={[styles.map, { height }]}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
      >
        {pinsWithCoords.map(pin => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            description={`${CATEGORY_LABELS[pin.category]} · ${pin.location ?? ''}`.trim()}
            pinColor={CATEGORY_COLORS[pin.category]}
            onCalloutPress={() => onPressPin(pin.id)}
          />
        ))}
      </MapView>
      {missingCount > 0 && (
        <View style={styles.missingBanner}>
          <Text style={styles.missingText}>
            좌표가 없는 핀 {missingCount}개는 지도에 표시되지 않아요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.tertiary,
    textAlign: 'center',
  },
  missingBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  missingText: {
    fontSize: 12,
    color: colors.tertiary,
    textAlign: 'center',
  },
});
