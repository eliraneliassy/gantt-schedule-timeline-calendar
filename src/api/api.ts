/**
 * Api functions
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import defaultConfigFn from '../default-config';
import { Time } from './time';
import State from 'deep-state-observer';
import DeepState from 'deep-state-observer';
import dayjs from 'dayjs';
import {
  Config,
  Period,
  DataChartTime,
  ScrollTypeHorizontal,
  Row,
  Item,
  Vido,
  Items,
  DefaultItem,
  DataChartTimeLevelDate,
  ScrollTypeVertical,
} from '../gstc';
import helpers from '@neuronet.io/vido/helpers';
const mergeDeep = helpers.mergeDeep;

const lib = 'gantt-schedule-timeline-calendar';

export function getClass(name: string) {
  let simple = `${lib}__${name}`;
  if (name === lib) {
    simple = lib;
  }
  return simple;
}

function mergeActions(userConfig: Config, defaultConfig: Config) {
  const defaultConfigActions = mergeDeep({}, defaultConfig.actions);
  const userActions = mergeDeep({}, userConfig.actions);
  let allActionNames = [...Object.keys(defaultConfigActions), ...Object.keys(userActions)];
  allActionNames = allActionNames.filter((i) => allActionNames.includes(i));
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
  return (this.state = new State(state, { delimeter: '.', maxSimultaneousJobs: 1000 }));
}

export const publicApi = {
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
  dayjs,
};

export interface WheelResult {
  x: number;
  y: number;
  z: number;
  event: MouseWheelEvent;
}

export interface IconsCache {
  [key: string]: string;
}

export type Unsubscribes = (() => void)[];

export class Api {
  public name = lib;
  public debug = false;
  public state: DeepState;
  public time: Time;
  public vido: Vido;
  private iconsCache: IconsCache = {};
  private unsubscribes: Unsubscribes = [];

  constructor(state: DeepState) {
    this.state = state;
    this.time = new Time(this.state, this);
    if (this.debug) {
      // @ts-ignore
      window.state = state;
      // @ts-ignore
      window.api = api;
    }
  }

  setVido(Vido: Vido) {
    this.vido = Vido;
  }

  log(...args) {
    if (this.debug) {
      console.log.call(console, ...args);
    }
  }

  mergeDeep = mergeDeep;
  getClass = getClass;
  allActions = [];

  getActions(name: string) {
    if (!this.allActions.includes(name)) this.allActions.push(name);
    let actions = this.state.get('config.actions.' + name);
    if (typeof actions === 'undefined') {
      actions = [];
    }
    return actions.slice();
  }

  isItemInViewport(item: Item, leftGlobal: number, rightGlobal: number) {
    return item.time.start <= rightGlobal && item.time.end >= leftGlobal;
  }

  prepareItems(items: Item[]) {
    const defaultItemHeight = this.state.get('config.chart.item.height');
    const itemsObj: Items = this.state.get('config.chart.items');
    for (const item of items) {
      // linked items should have links to each others
      if (item.linkedWith && item.linkedWith.length) {
        for (const itemId of item.linkedWith) {
          const currentItem: Item = itemsObj[itemId];
          if (!currentItem.linkedWith) currentItem.linkedWith = [];
          if (!currentItem.linkedWith.includes(item.id)) currentItem.linkedWith.push(item.id);
        }
      }
      item.time.start = +item.time.start;
      item.time.end = +item.time.end;
      item.id = String(item.id);
      const defaultItem: DefaultItem = this.state.get('config.chart.item');
      if (typeof item.height !== 'number') item.height = defaultItemHeight;
      if (!item.$data)
        item.$data = {
          actualHeight: 0,
          outerHeight: 0,
          time: null,
          position: {
            left: 0,
            actualLeft: 0,
            right: 0,
            actualRight: 0,
            top: item.top || 0,
            actualTop: item.top || 0,
          },
          width: -1,
          actualWidth: -1,
          detached: false,
        };
      if (!item.$data.time)
        item.$data.time = {
          startDate: this.time.date(item.time.start),
          endDate: this.time.date(item.time.end),
        };
      item.$data.actualHeight = item.height;
      if (typeof item.top !== 'number') item.top = 0;
      if (!item.gap) item.gap = {};
      if (typeof item.gap.top !== 'number') item.gap.top = defaultItem.gap.top;
      if (typeof item.gap.bottom !== 'number') item.gap.bottom = defaultItem.gap.bottom;
      if (typeof item.minWidth !== 'number') item.minWidth = defaultItem.minWidth;
      item.$data.outerHeight = item.$data.actualHeight + item.gap.top + item.gap.bottom;
      item.$data.position.actualTop = item.$data.position.top + item.gap.top;
    }
    return items;
  }

  fillEmptyRowValues(rows: Row[]) {
    const defaultHeight = this.state.get('config.list.row.height');
    let top = 0;
    for (const rowId in rows) {
      const row = rows[rowId];
      row.$data = {
        parents: [],
        children: [],
        topPercent: 0,
        items: [],
        actualHeight: 0,
        outerHeight: 0,
      };
      if (typeof row.height !== 'number') {
        row.height = defaultHeight;
      }
      row.$data.actualHeight = row.height;
      if (typeof row.expanded !== 'boolean') {
        row.expanded = false;
      }
      row.top = top;
      if (typeof row.gap !== 'object') row.gap = {};
      if (typeof row.gap.top !== 'number') row.gap.top = 0;
      if (typeof row.gap.bottom !== 'number') row.gap.bottom = 0;
      row.$data.outerHeight = row.$data.actualHeight + row.gap.top + row.gap.bottom;
      top += row.$data.outerHeight;
    }
    return rows;
  }

  itemsOnTheSameLevel(item1: Item, item2: Item) {
    const item1Bottom = item1.$data.position.top + item1.$data.outerHeight;
    const item2Bottom = item2.$data.position.top + item2.$data.outerHeight;
    if (item2.$data.position.top <= item1.$data.position.top && item2Bottom > item1.$data.position.top) return true;
    if (item2.$data.position.top >= item1.$data.position.top && item2.$data.position.top < item1Bottom) return true;
    if (item2.$data.position.top >= item1.$data.position.top && item2Bottom < item1Bottom) return true;
    return false;
  }

  itemsOverlaps(item1: Item, item2: Item): boolean {
    if (this.itemsOnTheSameLevel(item1, item2)) {
      if (item2.time.start >= item1.time.start && item2.time.start <= item1.time.end) return true;
      if (item2.time.end >= item1.time.start && item2.time.end <= item1.time.end) return true;
      if (item2.time.start >= item1.time.start && item2.time.end <= item1.time.end) return true;
      if (item2.time.start <= item1.time.start && item2.time.end >= item1.time.end) return true;
      return false;
    }
    return false;
  }

  itemOverlapsWithOthers(item: Item, items: Item[]): boolean {
    for (const item2 of items) {
      if (item.id !== item2.id && this.itemsOverlaps(item, item2)) return true;
    }
    return false;
  }

  fixOverlappedItems(rowItems: Item[]) {
    if (rowItems.length === 0) return;
    let index = 0;
    for (let item of rowItems) {
      item.$data.position.top = item.top;
      item.$data.position.actualTop = item.$data.position.top + item.gap.top;
      if (index && this.itemOverlapsWithOthers(item, rowItems)) {
        while (this.itemOverlapsWithOthers(item, rowItems)) {
          item.$data.position.top += 1;
          item.$data.position.actualTop = item.$data.position.top + item.gap.top;
        }
      }
      index++;
    }
  }

  recalculateRowHeight(row: Row): number {
    let actualHeight = 0;
    this.fixOverlappedItems(row.$data.items);
    for (const item of row.$data.items) {
      actualHeight = Math.max(actualHeight, item.$data.position.top + item.$data.outerHeight);
    }
    if (actualHeight < row.height) actualHeight = row.height;
    row.$data.actualHeight = actualHeight;
    row.$data.outerHeight = row.$data.actualHeight + row.gap.top + row.gap.bottom;
    return row.$data.outerHeight;
  }

  recalculateRowsHeights(rows: Row[]): number {
    let top = 0;
    const verticalHeight: number = this.state.get('config.scroll.vertical.area');
    if (!verticalHeight) return 0;
    for (const row of rows) {
      this.recalculateRowHeight(row);
      row.top = top;
      row.$data.topPercent = top / verticalHeight;
      top += row.$data.outerHeight;
    }
    return top;
  }

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
  }

  fastTree(rowParents, node, parents = []) {
    const children = rowParents[node.id];
    node.$data.parents = parents;
    if (typeof children === 'undefined') {
      node.$data.children = [];
      return node;
    }
    if (node.id !== '') {
      parents = [...parents, node.id];
    }
    node.$data.children = Object.values(children);
    for (const childrenId in children) {
      const child = children[childrenId];
      this.fastTree(rowParents, child, parents);
    }
    return node;
  }

  makeTreeMap(rows, items) {
    const itemParents = this.generateParents(items, 'rowId');
    for (const row of rows) {
      row.$data.items = itemParents[row.id] !== undefined ? Object.values(itemParents[row.id]) : [];
    }
    const rowParents = this.generateParents(rows);
    const tree = { id: '', $data: { children: [], parents: [], items: [] } };
    return this.fastTree(rowParents, tree);
  }

  getFlatTreeMapById(treeMap, flatTreeMapById = {}) {
    for (const child of treeMap.$data.children) {
      flatTreeMapById[child.id] = child;
      this.getFlatTreeMapById(child, flatTreeMapById);
    }
    return flatTreeMapById;
  }

  flattenTreeMap(treeMap, rows = []) {
    for (const child of treeMap.$data.children) {
      rows.push(child.id);
      this.flattenTreeMap(child, rows);
    }
    return rows;
  }

  getRowsFromMap(flatTreeMap, rows) {
    return flatTreeMap.map((node) => rows[node.id]);
  }

  getRowsFromIds(ids, rows) {
    const result = [];
    for (const id of ids) {
      result.push(rows[id]);
    }
    return result;
  }

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
      for (const parentId of flatTreeMapById[rowId].$data.parents) {
        const parent = rows[parentId];
        if (!parent || !parent.expanded) {
          continue next;
        }
      }
      rowsWithParentsExpanded.push(rowId);
    }
    return rowsWithParentsExpanded;
  }

  getRowsHeight(rows: Row[]): number {
    let height = 0;
    for (const row of rows) {
      if (row) height += row.height;
    }
    return height;
  }

  getVisibleRows(rowsWithParentsExpanded: Row[]): Row[] {
    if (rowsWithParentsExpanded.length === 0) return [];
    const visibleRows = [];
    let topRow = this.state.get('config.scroll.vertical.data');
    if (!topRow) topRow = rowsWithParentsExpanded[0];
    const innerHeight = this.state.get('$data.innerHeight');
    let strictTopRow = rowsWithParentsExpanded.find((row) => row.id === topRow.id);
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
  }

  normalizeMouseWheelEvent(event: MouseWheelEvent): WheelResult {
    let x = event.deltaX || 0;
    let y = event.deltaY || 0;
    let z = event.deltaZ || 0;
    const mode = event.deltaMode;
    const lineHeight = this.state.get('config.list.rowHeight');
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
  }

  scrollToTime(toTime: number, centered = true, time: DataChartTime = this.state.get('$data.chart.time')): number {
    let pos = 0;
    this.state.update('config.scroll.horizontal', (scrollHorizontal: ScrollTypeHorizontal) => {
      let leftGlobal = toTime;
      if (centered) {
        const chartWidth = this.state.get('$data.chart.dimensions.width');
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
  }

  setScrollLeft(
    dataIndex: number | undefined,
    time: DataChartTime = this.state.get('$data.chart.time'),
    multi = undefined
  ) {
    if (dataIndex === undefined) {
      dataIndex = 0;
    }
    let hadMulti = true;
    if (multi === undefined) {
      hadMulti = false;
      multi = this.state.multi();
    }
    const allDates = time.allDates[time.level];
    if (!allDates) return;
    const date: DataChartTimeLevelDate = allDates[dataIndex];
    if (!date) return;
    multi.update('config.scroll.horizontal', (scrollHorizontal: ScrollTypeHorizontal) => {
      scrollHorizontal.data = { ...date };
      const time = this.state.get('$data.chart.time');
      scrollHorizontal.posPx = this.time.calculateScrollPosPxFromTime(
        scrollHorizontal.data.leftGlobal,
        time,
        scrollHorizontal
      );
      scrollHorizontal.dataIndex = dataIndex;
      return scrollHorizontal;
    });
    if (hadMulti) return multi;
    multi.done();
  }

  getScrollLeft(): ScrollTypeHorizontal {
    return this.state.get('config.scroll.horizontal');
  }

  setScrollTop(dataIndex: number | undefined) {
    if (dataIndex === undefined) {
      dataIndex = 0;
    }
    const vertical: ScrollTypeVertical = this.state.get('config.scroll.vertical');
    const rows: Row[] = this.state.get('$data.list.rowsWithParentsExpanded');
    if (!rows[dataIndex]) return;
    this.state.update('config.scroll.vertical', (scrollVertical: ScrollTypeVertical) => {
      scrollVertical.data = rows[dataIndex];
      scrollVertical.posPx = rows[dataIndex].$data.topPercent * (scrollVertical.maxPosPx - scrollVertical.innerSize);
      scrollVertical.dataIndex = dataIndex;
      return scrollVertical;
    });
  }

  getScrollTop(): ScrollTypeVertical {
    return this.state.get('config.scroll.vertical');
  }

  getSVGIconSrc(svg) {
    if (typeof this.iconsCache[svg] === 'string') return this.iconsCache[svg];
    this.iconsCache[svg] = 'data:image/svg+xml;base64,' + btoa(svg);
    return this.iconsCache[svg];
  }

  /**
   * Destroy things to release memory
   */
  destroy() {
    for (const unsubscribe of this.unsubscribes) {
      unsubscribe();
    }
    this.unsubscribes = [];
    if (this.debug) {
      // @ts-ignore
      delete window.state;
    }
  }
}
