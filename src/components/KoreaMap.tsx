/**
 * Korea SVG Map Component
 * 한국 시도 지도 (실제 SVG path 데이터)
 * 줌인/줌아웃 + 팬 지원
 * Source: @svg-maps/south-korea (CC BY 4.0)
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { colors } from '../design';
import { KOREA_MAP_PATHS, KOREA_MAP_VIEWBOX } from '../data/koreaMapPaths';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KoreaMapProps {
  selectedProvince: string | null;
  onSelectProvince: (provinceId: string) => void;
  width?: number;
  height?: number;
  fillContainer?: boolean; // 컨테이너 전체 채우기
}

// Label positions for each province (manually positioned for best visibility)
const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  'seoul': { x: 135, y: 138 },
  'incheon': { x: 75, y: 160 },
  'gyeonggi': { x: 175, y: 85 },
  'gangwon': { x: 360, y: 85 },
  'sejong': { x: 200, y: 248 },
  'daejeon': { x: 215, y: 285 },
  'north-chungcheong': { x: 290, y: 235 },
  'south-chungcheong': { x: 115, y: 305 },
  'north-jeolla': { x: 150, y: 385 },
  'gwangju': { x: 165, y: 432 },
  'south-jeolla': { x: 105, y: 510 },
  'north-gyeongsang': { x: 410, y: 230 },
  'daegu': { x: 340, y: 365 },
  'south-gyeongsang': { x: 310, y: 445 },
  'ulsan': { x: 420, y: 378 },
  'busan': { x: 385, y: 425 },
  'jeju': { x: 170, y: 600 },
};

export default function KoreaMap({
  selectedProvince,
  onSelectProvince,
  width,
  height,
  fillContainer,
}: KoreaMapProps) {
  // Calculate dimensions maintaining aspect ratio (524:631)
  const mapWidth = width || Math.min(SCREEN_WIDTH - 32, 340);
  const mapHeight = height || mapWidth * (631 / 524);

  return (
    <View style={[
      styles.container,
      fillContainer ? styles.fillContainer : { width: mapWidth, height: mapHeight }
    ]}>
      <ReactNativeZoomableView
        maxZoom={3}
        minZoom={0.8}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        style={styles.zoomContainer}
        contentWidth={mapWidth}
        contentHeight={mapHeight}
      >
        <Svg
          width={mapWidth}
          height={mapHeight}
          viewBox={KOREA_MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Province paths */}
          <G>
            {KOREA_MAP_PATHS.map((province) => {
              const isSelected = selectedProvince === province.id;

              return (
                <Path
                  key={province.id}
                  d={province.path}
                  fill={isSelected ? colors.brand : colors.elevated}
                  stroke={isSelected ? colors.brandLight : colors.border}
                  strokeWidth={isSelected ? 2 : 0.8}
                  onPress={() => onSelectProvince(province.id)}
                />
              );
            })}
          </G>

          {/* Province labels */}
          <G>
            {KOREA_MAP_PATHS.map((province) => {
              const pos = LABEL_POSITIONS[province.id];
              if (!pos) return null;

              const isSelected = selectedProvince === province.id;

              return (
                <SvgText
                  key={`label-${province.id}`}
                  x={pos.x}
                  y={pos.y}
                  fill={isSelected ? colors.foreground : colors.secondary}
                  fontSize={isSelected ? 13 : 10}
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                  onPress={() => onSelectProvince(province.id)}
                >
                  {province.nameKo}
                </SvgText>
              );
            })}
          </G>
        </Svg>
      </ReactNativeZoomableView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  fillContainer: {
    flex: 1,
    width: '100%',
  },
  zoomContainer: {
    flex: 1,
  },
});
