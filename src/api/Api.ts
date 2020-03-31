/**
 * Api functions
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import defaultConfigFn from '../default-config';
import TimeApi from './Time';
import State from 'deep-state-observer';
import dayjs from 'dayjs';
import {
  Config,
  Period,
  Scroll,
  ChartInternalTimeLevel,
  ChartInternalTime,
  ScrollType,
  ScrollTypeHorizontal,
  Row,
  Item
} from '../types';
import { mergeDeep } from '@neuronet.io/vido/helpers';
const lib = 'gantt-schedule-timeline-calendar';

function mergeActions(userConfig, defaultConfig) {
  const defaultConfigActions = mergeDeep({}, defaultConfig.actions);
  const userActions = mergeDeep({}, userConfig.actions);
  let allActionNames = [...Object.keys(defaultConfigActions), ...Object.keys(userActions)];
  allActionNames = allActionNames.filter(i => allActionNames.includes(i));
  const actions = {};
  for (const actionName of allActionNames) {
    actions[actionName] = [];
    if (typeof defaultConfigActions[actionName] !== 'undefined' && Array.isArray(defaultConfigActions[actionName])) {
      actions[actionName] = [...defaultConfigActions[actionName]];
    }
    if (typeof userActions[actionName] !== 'undefined' && Array.isArray(userActions[actionName])) {
      actions[actionName] = [...actions[actionName], ...userActions[actionName]];
    }
  }
  delete userConfig.actions;
  delete defaultConfig.actions;
  return actions;
}

export function stateFromConfig(userConfig: Config) {
  const defaultConfig: Config = defaultConfigFn();
  const actions = mergeActions(userConfig, defaultConfig);
  const state = { config: mergeDeep({}, defaultConfig, userConfig) };
  state.config.actions = actions;
  // @ts-ignore
  return (this.state = new State(state, { delimeter: '.' }));
}

const publicApi = {
  name: lib,
  stateFromConfig,
  mergeDeep,
  date(time) {
    return time ? dayjs(time) : dayjs();
  },
  setPeriod(period: Period): number {
    this.state.update('config.chart.time.period', period);
    return this.state.get('config.chart.time.zoom');
  },
  dayjs
};
export default publicApi;

export interface Api {
  name: string;
  debug: boolean;
  setVido(Vido: any): void;
  log(...args: any[]): void;
  mergeDeep: typeof mergeDeep;
  getClass(name: string): string;
  allActions: any[];
  getActions(name: string): any;
  isItemInViewport(item: Item, left: number, right: number): boolean;
  prepareItems(items: Item[]): Item[];
  fillEmptyRowValues(rows: Row[]): Row[];
  itemsOnTheSameLevel(item1: Item, item2: Item): boolean;
  itemsOverlaps(item1: Item, item2: Item): boolean;
  itemOverlapsWithOthers(item: Item, items: Item[]): boolean;
  fixOverlappedItems(items: Item[]): void;
  recalculateRowsHeights(rows: Row[]): number;
  generateParents(rows: any, parentName?: string): {};
  fastTree(rowParents: any, node: any, parents?: any[]): any;
  makeTreeMap(rows: any, items: any): any;
  getFlatTreeMapById(treeMap: any, flatTreeMapById?: {}): {};
  flattenTreeMap(treeMap: any, rows?: any[]): any[];
  getRowsFromMap(flatTreeMap: any, rows: any): any;
  getRowsFromIds(ids: any, rows: any): any[];
  getRowsWithParentsExpanded(flatTreeMap: any, flatTreeMapById: any, rows: any): any[];
  getRowsHeight(rows: any): number;
  /**
   * Get visible rows - get rows that are inside current viewport (height)
   *
   * @param {array} rowsWithParentsExpanded rows that have parent expanded- they are visible
   */
  getVisibleRows(rowsWithParentsExpanded: Row[]): Row[];
  normalizeMouseWheelEvent(
    event: MouseWheelEvent
  ): {
    x: number;
    y: number;
    z: number;
    event: MouseWheelEvent;
  };
  time: TimeApi;
  scrollToTime(toTime: number, centered?: boolean): number;
  getSVGIconSrc(svg: any): any;
  destroy(): void;
}

export function getInternalApi(state) {
  let $state = state.get();
  let unsubscribes = [];
  let vido;
  const iconsCache = {};
  const api = {
    name: lib,
    debug: false,

    setVido(Vido) {
      vido = Vido;
    },

    log(...args) {
      if (this.debug) {
        console.log.call(console, ...args);
      }
    },

    mergeDeep,

    getClass(name: string) {
      let simple = `${lib}__${name}`;
      if (name === this.name) {
        simple = this.name;
      }
      return simple;
    },

    allActions: [],

    getActions(name: string) {
      if (!this.allActions.includes(name)) this.allActions.push(name);
      let actions = state.get('config.actions.' + name);
      if (typeof actions === 'undefined') {
        actions = [];
      }
      return actions.slice();
    },

    isItemInViewport(item: Item, left: number, right: number) {
      return (
        (item.time.start >= left && item.time.start < right) ||
        (item.time.end >= left && item.time.end < right) ||
        (item.time.start <= left && item.time.end >= right)
      );
    },

    prepareItems(items: Item[]) {
      const defaultItemHeight = state.get('config.chart.item.height');
      for (const item of items) {
        item.time.start = +item.time.start;
        item.time.end = +item.time.end;
        item.id = String(item.id);
        if (typeof item.height !== 'number') item.height = defaultItemHeight;
        item.actualHeight = item.height;
        if (typeof item.top !== 'number') item.top = 0;
        if (!item.gap) item.gap = {};
        if (typeof item.gap.top !== 'number') item.gap.top = state.get('config.chart.item.gap.top');
        if (typeof item.gap.bottom !== 'number') item.gap.bottom = state.get('config.chart.item.gap.bottom');
        item.outerHeight = item.actualHeight + item.gap.top + item.gap.bottom;
      }
      return items;
    },

    fillEmptyRowValues(rows: Row[]) {
      let top = 0;
      for (const rowId in rows) {
        const row = rows[rowId];
        row._internal = {
          parents: [],
          children: [],
          items: []
        };
        if (typeof row.height !== 'number') {
          row.height = $state.config.list.row.height;
        }
        row.actualHeight = row.height;
        if (typeof row.expanded !== 'boolean') {
          row.expanded = false;
        }
        row.top = top;
        if (typeof row.gap !== 'object') row.gap = {};
        if (typeof row.gap.top !== 'number') row.gap.top = 0;
        if (typeof row.gap.bottom !== 'number') row.gap.bottom = 0;
        row.outerHeight = row.actualHeight + row.gap.top + row.gap.bottom;
        top += row.outerHeight;
      }
      return rows;
    },

    itemsOnTheSameLevel(item1: Item, item2: Item) {
      const item1Bottom = item1.top + item1.outerHeight;
      const item2Bottom = item2.top + item2.outerHeight;
      if (item2.top <= item1.top && item2Bottom > item1.top) return true;
      if (item2.top >= item1.top && item2.top < item1Bottom) return true;
      if (item2.top >= item1.top && item2Bottom < item1Bottom) return true;
      return false;
    },

    itemsOverlaps(item1: Item, item2: Item): boolean {
      if (this.itemsOnTheSameLevel(item1, item2)) {
        if (item2.time.start >= item1.time.start && item2.time.start <= item1.time.end) return true;
        if (item2.time.end >= item1.time.start && item2.time.end <= item1.time.end) return true;
        if (item2.time.start >= item1.time.start && item2.time.end <= item1.time.end) return true;
        if (item2.time.start <= item1.time.start && item2.time.end >= item1.time.end) return true;
        return false;
      }
      return false;
    },

    itemOverlapsWithOthers(item: Item, items: Item[]): boolean {
      for (const item2 of items) {
        if (item.id !== item2.id && this.itemsOverlaps(item, item2)) return true;
      }
      return false;
    },

    fixOverlappedItems(items: Item[]) {
      if (items.length === 0) return;
      let index = 0;
      for (let item of items) {
        if (index && this.itemOverlapsWithOthers(item, items)) {
          item.top = 0;
          while (this.itemOverlapsWithOthers(item, items)) {
            item.top += 1;
          }
        }
        index++;
      }
    },

    recalculateRowsHeights(rows: Row[]): number {
      let top = 0;
      for (const row of rows) {
        let actualHeight = 0;
        this.fixOverlappedItems(row._internal.items);
        for (const item of row._internal.items) {
          actualHeight = Math.max(actualHeight, item.top + item.outerHeight);
        }
        if (actualHeight < row.height) actualHeight = row.height;
        row.actualHeight = actualHeight;
        row.outerHeight = row.actualHeight + row.gap.top + row.gap.bottom;
        row.top = top;
        top += row.outerHeight;
      }
      return top;
    },

    generateParents(rows, parentName = 'parentId') {
      const parents = {};
      for (const row of rows) {
        const parentId = row[parentName] !== undefined && row[parentName] !== null ? row[parentName] : '';
        if (parents[parentId] === undefined) {
          parents[parentId] = {};
        }
        parents[parentId][row.id] = row;
      }
      return parents;
    },

    fastTree(rowParents, node, parents = []) {
      const children = rowParents[node.id];
      node._internal.parents = parents;
      if (typeof children === 'undefined') {
        node._internal.children = [];
        return node;
      }
      if (node.id !== '') {
        parents = [...parents, node.id];
      }
      node._internal.children = Object.values(children);
      for (const childrenId in children) {
        const child = children[childrenId];
        this.fastTree(rowParents, child, parents);
      }
      return node;
    },

    makeTreeMap(rows, items) {
      const itemParents = this.generateParents(items, 'rowId');
      for (const row of rows) {
        row._internal.items = itemParents[row.id] !== undefined ? Object.values(itemParents[row.id]) : [];
      }
      const rowParents = this.generateParents(rows);
      const tree = { id: '', _internal: { children: [], parents: [], items: [] } };
      return this.fastTree(rowParents, tree);
    },

    getFlatTreeMapById(treeMap, flatTreeMapById = {}) {
      for (const child of treeMap._internal.children) {
        flatTreeMapById[child.id] = child;
        this.getFlatTreeMapById(child, flatTreeMapById);
      }
      return flatTreeMapById;
    },

    flattenTreeMap(treeMap, rows = []) {
      for (const child of treeMap._internal.children) {
        rows.push(child.id);
        this.flattenTreeMap(child, rows);
      }
      return rows;
    },

    getRowsFromMap(flatTreeMap, rows) {
      return flatTreeMap.map(node => rows[node.id]);
    },

    getRowsFromIds(ids, rows) {
      const result = [];
      for (const id of ids) {
        result.push(rows[id]);
      }
      return result;
    },

    getRowsWithParentsExpanded(flatTreeMap, flatTreeMapById, rows) {
      if (
        !flatTreeMap ||
        !flatTreeMapById ||
        !rows ||
        flatTreeMap.length === 0 ||
        flatTreeMapById.length === 0 ||
        Object.keys(rows).length === 0
      ) {
        return [];
      }
      const rowsWithParentsExpanded = [];
      next: for (const rowId of flatTreeMap) {
        for (const parentId of flatTreeMapById[rowId]._internal.parents) {
          const parent = rows[parentId];
          if (!parent || !parent.expanded) {
            continue next;
          }
        }
        rowsWithParentsExpanded.push(rowId);
      }
      return rowsWithParentsExpanded;
    },

    getRowsHeight(rows) {
      let height = 0;
      for (const row of rows) {
        if (row) height += row.height;
      }
      return height;
    },

    /**
     * Get visible rows - get rows that are inside current viewport (height)
     *
     * @param {array} rowsWithParentsExpanded rows that have parent expanded- they are visible
     */
    getVisibleRows(rowsWithParentsExpanded) {
      if (rowsWithParentsExpanded.length === 0) return [];
      const visibleRows = [];
      let topRow = state.get('config.scroll.vertical.data');
      if (!topRow) topRow = rowsWithParentsExpanded[0];
      const innerHeight = state.get('_internal.innerHeight');
      let strictTopRow = rowsWithParentsExpanded.find(row => row.id === topRow.id);
      let index = rowsWithParentsExpanded.indexOf(strictTopRow);
      if (index === undefined) return [];
      let currentRowsOffset = 0;
      for (let len = rowsWithParentsExpanded.length; index <= len; index++) {
        const row = rowsWithParentsExpanded[index];
        if (row === undefined) continue;
        if (currentRowsOffset <= innerHeight) {
          row.top = currentRowsOffset;
          visibleRows.push(row);
        }
        currentRowsOffset += row.height;
        if (currentRowsOffset >= innerHeight) {
          break;
        }
      }
      return visibleRows;
    },

    /**
     * Normalize mouse wheel event to get proper scroll metrics
     *
     * @param {Event} event mouse wheel event
     */
    normalizeMouseWheelEvent(event) {
      // @ts-ignore
      let x = event.deltaX || 0;
      // @ts-ignore
      let y = event.deltaY || 0;
      // @ts-ignore
      let z = event.deltaZ || 0;
      // @ts-ignore
      const mode = event.deltaMode;
      const lineHeight = state.get('config.list.rowHeight');
      let scale = 1;
      switch (mode) {
        case 1:
          if (lineHeight) {
            scale = lineHeight;
          }
          break;
        case 2:
          // @ts-ignore
          scale = window.height;
          break;
      }
      x *= scale;
      y *= scale;
      z *= scale;
      return { x, y, z, event };
    },

    time: new TimeApi(state),

    scrollToTime(toTime: number, centered = true): number {
      const time: ChartInternalTime = state.get('_internal.chart.time');
      let pos = 0;
      state.update('config.scroll.horizontal', (scrollHorizontal: ScrollTypeHorizontal) => {
        let leftGlobal = toTime;
        if (centered) {
          const chartWidth = state.get('_internal.chart.dimensions.width');
          const halfChartTime = (chartWidth / 2) * time.timePerPixel;
          leftGlobal = toTime - halfChartTime;
        }
        scrollHorizontal.data = this.time.findDateAtTime(leftGlobal, time.allDates[time.level]);
        let dataIndex = time.allDates[time.level].indexOf(scrollHorizontal.data);
        const max = time.allDates[time.level].length - scrollHorizontal.lastPageCount;
        if (dataIndex > max) {
          dataIndex = max;
        }
        scrollHorizontal.dataIndex = dataIndex;
        scrollHorizontal.posPx = this.time.calculateScrollPosPxFromTime(
          scrollHorizontal.data.leftGlobal,
          time,
          scrollHorizontal
        );
        const maxPos = scrollHorizontal.maxPosPx - scrollHorizontal.innerSize;
        if (scrollHorizontal.posPx > maxPos) scrollHorizontal.posPx = maxPos;
        pos = scrollHorizontal.posPx;
        return scrollHorizontal;
      });
      return pos;
    },

    getSVGIconSrc(svg) {
      if (typeof iconsCache[svg] === 'string') return iconsCache[svg];
      iconsCache[svg] = 'data:image/svg+xml;base64,' + btoa(svg);
      return iconsCache[svg];
    },

    /**
     * Destroy things to release memory
     */
    destroy() {
      $state = undefined;
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
      unsubscribes = [];
      if (api.debug) {
        // @ts-ignore
        delete window.state;
      }
    }
  };

  if (api.debug) {
    // @ts-ignore
    window.state = state;
    // @ts-ignore
    window.api = api;
  }

  return api;
}
