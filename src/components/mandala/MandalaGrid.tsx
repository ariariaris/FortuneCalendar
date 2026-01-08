// マンダラ81マスグリッドコンポーネント
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MandalaChart, MandalaElement, MandalaAction } from '../../types/mandala';
import { MandalaCell } from './MandalaCell';
import { TIMEFRAME_COLORS } from '../../types/mandala';

interface Props {
  chart: MandalaChart;
  onCellPress?: (type: 'center' | 'element' | 'action', id: string, content: string) => void;
  onCellLongPress?: (type: 'center' | 'element' | 'action', id: string, content: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 9;
const PADDING = 8;

export const MandalaGrid: React.FC<Props> = ({ chart, onCellPress, onCellLongPress }) => {
  const cellSize = useMemo(() => Math.floor((SCREEN_WIDTH - PADDING * 2) / GRID_SIZE), []);
  const elementColor = TIMEFRAME_COLORS[chart.timeframe];

  // 3x3ブロックの位置マッピング (0-7: 時計回り、上から)
  const ELEMENT_POSITIONS = [
    { row: 0, col: 0 }, // A: 左上
    { row: 0, col: 1 }, // B: 上中央
    { row: 0, col: 2 }, // C: 右上
    { row: 1, col: 2 }, // D: 右中央
    { row: 2, col: 2 }, // E: 右下
    { row: 2, col: 1 }, // F: 下中央
    { row: 2, col: 0 }, // G: 左下
    { row: 1, col: 0 }, // H: 左中央
  ];

  // 81マスグリッドを構築
  const renderGrid = () => {
    const rows: React.ReactNode[] = [];

    for (let gridRow = 0; gridRow < GRID_SIZE; gridRow++) {
      const cells: React.ReactNode[] = [];

      for (let gridCol = 0; gridCol < GRID_SIZE; gridCol++) {
        // 中央の中央（最終目標）
        if (gridRow === 4 && gridCol === 4) {
          cells.push(
            <MandalaCell
              key={`${gridRow}-${gridCol}`}
              content={chart.centerGoal}
              isCenter
              size={cellSize}
              onPress={() => onCellPress?.('center', chart.id, chart.centerGoal)}
            />
          );
          continue;
        }

        // 中央ブロック（3x3）の要素名表示
        if (gridRow >= 3 && gridRow <= 5 && gridCol >= 3 && gridCol <= 5) {
          const elemIdx = getElementIndexFromCenterBlock(gridRow - 3, gridCol - 3);
          if (elemIdx !== -1) {
            const elem = chart.elements[elemIdx];
            cells.push(
              <MandalaCell
                key={`${gridRow}-${gridCol}`}
                content={elem?.title || ''}
                isElementCenter
                elementColor={elementColor}
                size={cellSize}
                onPress={() => elem && onCellPress?.('element', elem.id, elem.title)}
              />
            );
            continue;
          }
        }

        // 外周ブロックの処理
        const blockRow = Math.floor(gridRow / 3);
        const blockCol = Math.floor(gridCol / 3);
        const localRow = gridRow % 3;
        const localCol = gridCol % 3;

        // 中央ブロック以外
        if (!(blockRow === 1 && blockCol === 1)) {
          const elemIdx = ELEMENT_POSITIONS.findIndex(
            (p) => p.row === blockRow && p.col === blockCol
          );

          if (elemIdx !== -1) {
            const elem = chart.elements[elemIdx];
            if (localRow === 1 && localCol === 1) {
              // 各ブロックの中央は要素名
              cells.push(
                <MandalaCell
                  key={`${gridRow}-${gridCol}`}
                  content={elem?.title || ''}
                  isElementCenter
                  elementColor={elementColor}
                  size={cellSize}
                  onPress={() => elem && onCellPress?.('element', elem.id, elem.title)}
                />
              );
            } else {
              // アクションセル
              const actionIdx = getActionIndex(localRow, localCol);
              const action = elem?.actions[actionIdx];
              cells.push(
                <MandalaCell
                  key={`${gridRow}-${gridCol}`}
                  content={action?.content || ''}
                  status={action?.status}
                  size={cellSize}
                  onPress={() => action && onCellPress?.('action', action.id, action.content)}
                  onLongPress={() => action && onCellLongPress?.('action', action.id, action.content)}
                />
              );
            }
            continue;
          }
        }

        // その他（空セル）
        cells.push(
          <MandalaCell
            key={`${gridRow}-${gridCol}`}
            content=""
            size={cellSize}
          />
        );
      }

      rows.push(
        <View key={gridRow} style={s.row}>
          {cells}
        </View>
      );
    }

    return rows;
  };

  // 中央ブロック（3x3）内での要素位置 → 要素インデックス
  const getElementIndexFromCenterBlock = (localRow: number, localCol: number): number => {
    if (localRow === 1 && localCol === 1) return -1; // 中央は最終目標
    const positions: [number, number, number][] = [
      [0, 0, 0], [0, 1, 1], [0, 2, 2],
      [1, 0, 7], [1, 2, 3],
      [2, 0, 6], [2, 1, 5], [2, 2, 4],
    ];
    const found = positions.find((p) => p[0] === localRow && p[1] === localCol);
    return found ? found[2] : -1;
  };

  // ローカル座標（3x3内）→ アクションインデックス (0-7)
  const getActionIndex = (localRow: number, localCol: number): number => {
    const mapping: number[][] = [
      [0, 1, 2],
      [7, -1, 3],
      [6, 5, 4],
    ];
    return mapping[localRow][localCol];
  };

  return (
    <ScrollView
      horizontal
      style={s.scrollH}
      contentContainerStyle={s.scrollContent}
      showsHorizontalScrollIndicator={false}
    >
      <ScrollView
        style={s.scrollV}
        contentContainerStyle={s.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderGrid()}
      </ScrollView>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scrollH: {
    flex: 1,
  },
  scrollV: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gridContainer: {
    padding: PADDING,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});

export default MandalaGrid;
