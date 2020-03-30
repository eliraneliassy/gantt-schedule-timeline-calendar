/**
 * Selection plugin helpers
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

export interface RectStyle {
  [key: string]: any;
}

export interface Options {
  enabled?: boolean;
  grid?: boolean;
  items?: boolean;
  rows?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  selecting?: (data, type: string) => void;
  deselecting?: (data, type: string) => void;
  selected?: (data, type) => void;
  deselected?: (data, type) => void;
  canSelect?: (type, state, all) => any[];
  canDeselect?: (type, state, all) => any[];
}

export interface Items {
  [key: string]: string[];
}

interface SelectingData {
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  startX?: number;
  startY?: number;
  startCell?: any;
  selecting?: boolean;
  selected?: Items;
}

export interface SelectState {
  selecting?: Items;
  selected?: Items;
}

export function prepareOptions(options) {
  const defaultOptions: Options = {
    enabled: true,
    grid: false,
    items: true,
    rows: false,
    horizontal: true,
    vertical: true,
    selecting() {},
    deselecting() {},
    selected() {},
    deselected() {},
    canSelect(type, currently, all) {
      return currently;
    },
    canDeselect(type, currently, all) {
      return [];
    }
  };
  options = { ...defaultOptions, ...options } as Options;
  return options;
}

export const selectionTypesIdGetters = {
  'chart-timeline-grid-row': props => props.row.id,
  'chart-timeline-grid-row-cell': props => props.id,
  'chart-timeline-items-row': props => props.row.id,
  'chart-timeline-items-row-item': props => props.item.id
};
