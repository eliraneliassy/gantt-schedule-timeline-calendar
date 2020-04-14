/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import {
  PluginData as TimelinePointerPluginData,
  ITEM,
  ITEM_TYPE,
  CELL,
  CELL_TYPE,
  Point,
  PointerState,
} from './timeline-pointer.plugin';

import { Item, Cell, Items, Vido, htmlResult, Wrapper, ItemDataPosition, ItemData } from '../gstc';
import DeepState from 'deep-state-observer';
import { Api } from '../api/api';
import { StyleMap, lithtml } from '@neuronet.io/vido/vido';

export type ModKey = 'shift' | 'ctrl' | 'alt' | '';

export interface Options {
  enabled?: boolean;
  cells?: boolean;
  items?: boolean;
  rows?: boolean;
  showOverlay?: boolean;
  multipleSelection?: boolean;
  selectKey?: ModKey;
  multiKey?: ModKey;
  canSelect?: (type, state, all) => any[];
  canDeselect?: (type, state, all) => any[];
}

export interface SelectionItems {
  [key: string]: Item[];
}

export interface SelectState {
  selecting?: SelectionItems;
  selected?: SelectionItems;
}

function prepareOptions(options: Options) {
  const defaultOptions: Options = {
    enabled: true,
    cells: true,
    items: true,
    rows: false,
    showOverlay: true,
    multipleSelection: true,
    canSelect(type, currently, all) {
      return currently;
    },
    canDeselect(type, currently, all) {
      return [];
    },
  };
  options = { ...defaultOptions, ...options } as Options;
  return options;
}

const pluginPath = 'config.plugin.Selection';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Selection {
  [ITEM]: Item[];
  [CELL]: Cell[];
}

export interface PointerEvents {
  down: PointerEvent | null;
  move: PointerEvent | null;
  up: PointerEvent | null;
}

export interface PluginData extends Options {
  enabled: boolean;
  isSelecting: boolean;
  showOverlay: boolean;
  pointerState: PointerState;
  initialPosition: Point;
  currentPosition: Point;
  selectionAreaLocal: Area;
  selectionAreaGlobal: Area;
  selected: Selection;
  selecting: Selection;
  events: PointerEvents;
  targetType: ITEM_TYPE | CELL_TYPE | '';
}

function generateEmptyData(options: Options): PluginData {
  return {
    enabled: true,
    showOverlay: true,
    isSelecting: false,
    pointerState: 'up',
    selectKey: '',
    multiKey: 'shift',
    multipleSelection: true,
    targetType: '',
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    selectionAreaLocal: { x: 0, y: 0, width: 0, height: 0 },
    selectionAreaGlobal: { x: 0, y: 0, width: 0, height: 0 },
    selecting: {
      [ITEM]: [],
      [CELL]: [],
    },
    selected: {
      [ITEM]: [],
      [CELL]: [],
    },
    events: {
      down: null,
      move: null,
      up: null,
    },
    ...options,
  };
}

class SelectionPlugin {
  private data: PluginData;
  private poitnerData: TimelinePointerPluginData;
  private vido: Vido;
  private state: DeepState;
  private api: Api;
  private unsub = [];
  private oldWrapper: Wrapper;
  private html: typeof lithtml.html;
  private wrapperClassName: string;
  private wrapperStyleMap: StyleMap;

  constructor(vido: Vido, options: Options) {
    this.vido = vido;
    this.state = vido.state;
    this.api = vido.api;
    this.state.update(pluginPath, generateEmptyData(options));
    this.data = generateEmptyData(options);
    this.wrapperClassName = this.api.getClass('chart-selection');
    this.wrapperStyleMap = new vido.StyleMap({ display: 'none' });
    this.html = vido.html;
    this.wrapper = this.wrapper.bind(this);
    this.setWrapper();
    this.unsub.push(
      this.state.subscribe('config.plugin.TimelinePointer', (timelinePointerData) => {
        this.poitnerData = timelinePointerData;
        this.onPointerData();
      })
    );
    this.updateData();
    this.unsub.push(
      this.state.subscribe(pluginPath, (value) => {
        this.data = value;
      })
    );
    // watch and update items that are inside selection
    this.unsub.push(
      this.state.subscribe('config.chart.items', (items: Items) => {
        this.data.selected[ITEM] = this.data.selected[ITEM].map((item) => items[item.id]);
      })
    );
    // TODO: watch and update cells that are inside selection
  }

  private setWrapper() {
    this.state.update('config.wrappers.ChartTimelineItems', (oldWrapper: Wrapper) => {
      if (!this.oldWrapper) this.oldWrapper = oldWrapper;
      return this.wrapper;
    });
  }

  public destroy() {
    this.state.update('config.wrappers.ChartTimelineItems', this.oldWrapper);
    this.oldWrapper = null;
    this.unsub.forEach((unsub) => unsub());
  }

  private updateData() {
    this.state.update(pluginPath, { ...this.data });
    this.vido.update(); // draw selection area overlay
  }

  private modKeyPressed(modKey: ModKey, ev: PointerEvent): boolean {
    switch (modKey) {
      case 'shift':
        return ev.shiftKey;
      case 'alt':
        return ev.altKey;
      case 'ctrl':
        return ev.ctrlKey;
    }
  }

  private canSelect(): boolean {
    let result = this.data.enabled;
    const down = this.poitnerData.events.down;
    if (down && this.data.selectKey) result = result && this.modKeyPressed(this.data.selectKey, down);
    return result;
  }

  private getSelectionAreaLocal(): Area {
    const area = { x: 0, y: 0, width: 0, height: 0 };
    const initial = { ...this.poitnerData.initialPosition };
    const current = { ...this.poitnerData.currentPosition };
    const width = current.x - initial.x;
    const height = current.y - initial.y;
    if (width >= 0) {
      area.x = initial.x;
      area.width = width;
    } else {
      area.x = current.x;
      area.width = Math.abs(width);
    }
    if (height >= 0) {
      area.y = initial.y;
      area.height = height;
    } else {
      area.y = current.y;
      area.height = Math.abs(height);
    }
    return area;
  }

  private translateAreaLocalToGlobal(localArea: Area): Area {
    const leftPx: number = this.state.get('$data.chart.time.leftPx');
    const topPx: number = this.state.get('config.scroll.vertical.posPx');
    return { ...localArea, x: localArea.x + leftPx, y: localArea.y + topPx };
  }

  private collectLinkedItems(item: Item, current: Item[] = []): Item[] {
    if (item.linkedWith && item.linkedWith.length) {
      const items: Items = this.state.get('config.chart.items');
      for (const linkedItemId of item.linkedWith) {
        const linkedItem: Item = items[linkedItemId];
        if (!current.includes(linkedItem)) {
          current.push(linkedItem);
          this.collectLinkedItems(linkedItem, current);
        }
      }
    }
    return current;
  }

  private getSelected(item: Item): Item[] {
    let selected: Item[];
    if (this.data.selected[ITEM].find((selectedItem) => selectedItem.id === item.id)) {
      selected = this.data.selected[ITEM];
    } else {
      const move = this.poitnerData.events.move;
      if (this.data.multiKey && this.modKeyPressed(this.data.multiKey, move)) {
        selected = [...new Set([...this.data.selected[ITEM], ...this.collectLinkedItems(item, [item])]).values()];
      } else {
        selected = this.collectLinkedItems(item, [item]);
      }
    }
    return selected;
  }

  private isItemVerticallyInsideArea(itemData: ItemData, area: Area): boolean {
    if (!area.width || !area.height) return false;
    const areaBottom = area.y + area.height;
    const itemTop = itemData.position.viewTop;
    const itemBottom = itemTop + itemData.actualHeight;
    return (
      (itemTop >= area.y && itemTop <= areaBottom) ||
      (itemBottom >= area.y && itemBottom <= areaBottom) ||
      (itemTop >= area.y && itemBottom <= areaBottom) ||
      (itemTop <= area.y && itemBottom >= areaBottom)
    );
  }

  private isItemHorizontallyInsideArea(itemData: ItemData, area: Area): boolean {
    if (!area.width || !area.height) return false;
    const areaRight = area.x + area.width;
    return (
      (itemData.position.actualLeft >= area.x && itemData.position.actualLeft <= areaRight) ||
      (itemData.position.actualRight >= area.x && itemData.position.actualRight <= areaRight) ||
      (itemData.position.actualLeft <= area.x && itemData.position.actualRight >= areaRight) ||
      (itemData.position.actualLeft >= area.x && itemData.position.actualRight <= areaRight)
    );
  }

  private getItemsUnderSelectionArea(areaLocal: Area): Item[] {
    const visibleItems: Item[] = this.state.get('$data.chart.visibleItems');
    const move = this.poitnerData.events.move;
    const multi = move && this.data.multiKey && this.modKeyPressed(this.data.multiKey, move);
    let selected = multi ? [...this.data.selected[ITEM]] : [];
    for (const item of visibleItems) {
      const itemData = item.$data;
      if (
        this.isItemVerticallyInsideArea(itemData, areaLocal) &&
        this.isItemHorizontallyInsideArea(itemData, areaLocal)
      ) {
        if (!selected.find((selectedItem) => selectedItem.id === item.id)) selected.push(item);
        const linked = this.collectLinkedItems(item, [item]);
        for (const linkedItem of linked) {
          if (!selected.find((selectedItem) => selectedItem.id === linkedItem.id)) selected.push(linkedItem);
        }
      }
    }
    return selected;
  }

  private deselectItems() {
    this.state.update(`config.chart.items.*.selected`, false);
    this.data.selected[ITEM] = [];
    this.updateData();
  }

  private selectMultipleCellsAndItems() {
    if (!this.canSelect()) return;
    if (!this.data.multipleSelection) {
      this.deselectItems();
      return;
    }
    this.data.isSelecting = true;
    this.data.selectionAreaLocal = this.getSelectionAreaLocal();
    this.data.selectionAreaGlobal = this.translateAreaLocalToGlobal(this.data.selectionAreaLocal);
    const selectedItems = this.getItemsUnderSelectionArea(this.data.selectionAreaLocal);
    if (selectedItems.length === 0) {
      this.state.update(`config.chart.items.*.selected`, false);
      this.data.selected[ITEM].length = 0;
      return;
    }
    this.data.selected[ITEM] = selectedItems;
    let multi = this.state.multi();
    multi = multi.update(`config.chart.items.*.selected`, false);
    for (const item of selectedItems) {
      multi = multi.update(`config.chart.items.${item.id}.selected`, true);
    }
    multi.done();
    // TODO save selected cells
  }

  private selectItemsIndividually() {
    this.data.isSelecting = false;
    this.data.selectionAreaLocal = this.getSelectionAreaLocal();
    this.data.currentPosition = this.poitnerData.currentPosition;
    this.data.initialPosition = this.poitnerData.initialPosition;
    if (!this.canSelect()) return;
    const item: Item = this.poitnerData.targetData;
    this.data.selected[ITEM] = this.getSelected(item);
    let multi = this.state.multi();
    multi = multi.update(`config.chart.items.*.selected`, false);
    for (const item of this.data.selected[ITEM]) {
      multi = multi.update(`config.chart.items.${item.id}.selected`, true);
    }
    multi.done();
  }

  private onPointerData() {
    if (this.poitnerData.isMoving && this.poitnerData.targetType === CELL) {
      this.selectMultipleCellsAndItems();
    } else if (this.poitnerData.isMoving && this.poitnerData.targetType === ITEM) {
      this.selectItemsIndividually();
    } else if (!this.poitnerData.isMoving) {
      this.data.isSelecting = false;
    }
    if (this.poitnerData.isMoving && this.poitnerData.targetType !== CELL && this.poitnerData.targetType !== ITEM) {
      this.deselectItems();
    }
    this.data.events = this.poitnerData.events;
    this.data.pointerState = this.poitnerData.pointerState;
    this.data.targetType = this.poitnerData.targetType;
    this.updateData();
  }

  private wrapper(input: htmlResult, props?: any) {
    if (!this.oldWrapper) return input;
    const oldContent = this.oldWrapper(input, props);
    let shouldDetach = true;
    if (this.canSelect() && this.data.isSelecting && this.data.showOverlay && this.data.multipleSelection) {
      this.wrapperStyleMap.style.display = 'block';
      this.wrapperStyleMap.style.left = this.data.selectionAreaLocal.x + 'px';
      this.wrapperStyleMap.style.top = this.data.selectionAreaLocal.y + 'px';
      this.wrapperStyleMap.style.width = this.data.selectionAreaLocal.width + 'px';
      this.wrapperStyleMap.style.height = this.data.selectionAreaLocal.height + 'px';
      shouldDetach = false;
    }
    const area = this.html`<div class=${this.wrapperClassName} style=${this.wrapperStyleMap}></div>`;
    return this.html`${oldContent}${shouldDetach ? null : area}`;
  }
}

export function Plugin(options: Options = {}) {
  options = prepareOptions(options);

  return function initialize(vidoInstance: Vido) {
    const selectionPlugin = new SelectionPlugin(vidoInstance, options);
    return function destroy() {
      selectionPlugin.destroy();
    };
  };
}
