/**
 * ItemResizing plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Vido, Wrapper, htmlResult, Item, ItemData, Data, DataChartTime } from '../types';
import DeepState from 'deep-state-observer';
import { Api } from '../api/Api';
import { lithtml, StyleMap } from '@neuronet.io/vido/vido';
import { Point, ITEM } from './TimelinePointer.plugin';

export interface Handle {
  width?: number;
  horizontalMargin?: number;
  verticalMargin?: number;
  outside?: boolean;
  onlyWhenSelected?: boolean;
}

export interface ItemInitial {
  id: string;
  left: number;
  width: number;
}

export interface Options {
  enabled?: boolean;
  handle?: Handle;
}

export interface PluginData extends Options {
  leftIsMoving: boolean;
  rightIsMoving: boolean;
  itemsInitial: ItemInitial[];
  initialPosition: Point;
  currentPosition: Point;
  movement: number;
}

function generateEmptyData(options: Options = {}): PluginData {
  const result = {
    enabled: true,
    handle: {
      width: 18,
      horizontalMargin: 1,
      verticalMargin: 1,
      outside: false,
      onlyWhenSelected: true,
    },
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    movement: 0,
    itemsInitial: [],
    leftIsMoving: false,
    rightIsMoving: false,
    ...options,
  };
  if (options.handle) result.handle = { ...result.handle, ...options.handle };
  return result;
}

class ItemResizing {
  private vido: Vido;
  private state: DeepState;
  private api: Api;
  private data: PluginData;
  private oldWrapper: Wrapper;
  private html: typeof lithtml.html;
  private leftClassName: string;
  private rightClassName: string;
  private spacing: number = 1;
  private unsubs: (() => void)[] = [];

  constructor(vido: Vido, options: Options) {
    this.vido = vido;
    this.state = vido.state;
    this.api = vido.api;
    this.data = generateEmptyData(options);
    this.html = vido.html;
    this.wrapper = this.wrapper.bind(this);
    this.onRightPointerDown = this.onRightPointerDown.bind(this);
    this.onRightPointerMove = this.onRightPointerMove.bind(this);
    this.onRightPointerUp = this.onRightPointerUp.bind(this);
    this.onLeftPointerDown = this.onLeftPointerDown.bind(this);
    this.onLeftPointerMove = this.onLeftPointerMove.bind(this);
    this.onLeftPointerUp = this.onLeftPointerUp.bind(this);
    this.updateData();
    this.unsubs.push(this.state.subscribe('config.plugin.ItemResizing', (data) => (this.data = data)));
    document.addEventListener('pointermove', this.onLeftPointerMove);
    document.addEventListener('pointerup', this.onLeftPointerUp);
    document.addEventListener('pointermove', this.onRightPointerMove);
    document.addEventListener('pointerup', this.onRightPointerUp);
  }

  public destroy() {
    this.unsubs.forEach((unsub) => unsub());
    document.removeEventListener('pointermove', this.onLeftPointerMove);
    document.removeEventListener('pointerup', this.onLeftPointerUp);
    document.removeEventListener('pointermove', this.onRightPointerMove);
    document.removeEventListener('pointerup', this.onRightPointerUp);
  }

  private updateData() {
    this.state.update('config.plugin.ItemResizing', this.data);
  }

  private initializeWrapper() {
    this.leftClassName = this.api.getClass('chart-timeline-items-row-item-resizing-handle');
    this.leftClassName += ' ' + this.leftClassName + '--left';
    this.rightClassName = this.api.getClass('chart-timeline-items-row-item-resizing-handle');
    this.rightClassName += ' ' + this.rightClassName + '--right';
    this.spacing = this.state.get('config.chart.spacing');
  }

  private getSelectedItems(): Item[] {
    return this.state.get(`config.plugin.Selection.selected.${ITEM}`);
  }

  private getRightStyleMap(item: Item, visible: boolean) {
    const rightStyleMap = new this.vido.StyleMap({});
    rightStyleMap.style.display = visible ? 'block' : 'none';
    rightStyleMap.style.top = item.$data.position.actualTop + this.data.handle.verticalMargin + 'px';
    if (this.data.handle.outside) {
      rightStyleMap.style.left = item.$data.position.right + this.data.handle.horizontalMargin - this.spacing + 'px';
    } else {
      rightStyleMap.style.left =
        item.$data.position.right - this.data.handle.width - this.data.handle.horizontalMargin - this.spacing + 'px';
    }
    rightStyleMap.style.width = this.data.handle.width + 'px';
    rightStyleMap.style.height = item.$data.actualHeight - this.data.handle.verticalMargin * 2 + 'px';
    return rightStyleMap;
  }

  private getLeftStyleMap(item: Item, visible: boolean) {
    const leftStyleMap = new this.vido.StyleMap({});
    leftStyleMap.style.display = visible ? 'block' : 'none';
    leftStyleMap.style.top = item.$data.position.actualTop + this.data.handle.verticalMargin + 'px';
    if (this.data.handle.outside) {
      leftStyleMap.style.left =
        item.$data.position.left - this.data.handle.width - this.data.handle.horizontalMargin + 'px';
    } else {
      leftStyleMap.style.left = item.$data.position.left + this.data.handle.horizontalMargin + 'px';
    }
    leftStyleMap.style.width = this.data.handle.width + 'px';
    leftStyleMap.style.height = item.$data.actualHeight - this.data.handle.verticalMargin * 2 + 'px';
    return leftStyleMap;
  }

  private onPointerDown(ev: PointerEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.data.itemsInitial = this.getSelectedItems().map((item: Item) => {
      return {
        id: item.id,
        left: item.$data.position.left,
        width: item.$data.width,
      };
    });
    this.data.initialPosition = {
      x: ev.screenX,
      y: ev.screenY,
    };
    this.data.currentPosition = { ...this.data.initialPosition };
  }

  private onLeftPointerDown(ev: PointerEvent) {
    /*if (!this.data.enabled) return;
    this.data.leftIsMoving = true;
    this.onPointerDown(ev);
    this.updateData();*/
  }
  private onRightPointerDown(ev: PointerEvent) {
    if (!this.data.enabled) return;
    this.data.rightIsMoving = true;
    this.onPointerDown(ev);
    this.updateData();
  }

  private onPointerMove(ev: PointerEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.data.currentPosition.x = ev.screenX;
    this.data.currentPosition.y = ev.screenY;
    this.data.movement = this.data.currentPosition.x - this.data.initialPosition.x;
  }
  private onLeftPointerMove(ev: PointerEvent) {
    if (!this.data.enabled || !this.data.leftIsMoving) return;
    this.onPointerMove(ev);
    const selected = this.getSelectedItems();
    const movement = this.data.movement;
    const time: DataChartTime = this.state.get('$data.chart.time');
    let multi = this.state.multi();
    for (let i = 0, len = selected.length; i < len; i++) {
      const item = selected[i];
      item.$data.position.left = this.data.itemsInitial[i].left + movement;
      if (item.$data.position.left > item.$data.position.right) item.$data.position.left = item.$data.position.right;
      item.$data.position.actualLeft = item.$data.position.left;
      item.$data.width = item.$data.position.right - item.$data.position.left;
      item.$data.actualWidth = item.$data.width;
      const leftGlobal = this.api.time.getTimeFromViewOffsetPx(item.$data.position.left, time);
      item.time.start = leftGlobal;
      item.$data.time.startDate = this.api.time.date(leftGlobal);
      multi = multi.update(`config.chart.items.${item.id}`, item);
    }
    multi.done();
    this.updateData();
  }
  private onRightPointerMove(ev: PointerEvent) {
    if (!this.data.enabled || !this.data.rightIsMoving) return;
    this.onPointerMove(ev);
    const selected = this.getSelectedItems();
    const movement = this.data.movement;
    const time: DataChartTime = this.state.get('$data.chart.time');
    let multi = this.state.multi();
    for (let i = 0, len = selected.length; i < len; i++) {
      const item = selected[i];
      item.$data.width = this.data.itemsInitial[i].width + movement;
      if (item.$data.width < 0) item.$data.width = 0;
      item.$data.actualWidth = item.$data.width;
      const right = item.$data.position.left + item.$data.width;
      item.$data.position.right = right;
      item.$data.position.actualRight = right;
      const rightGlobal = this.api.time.getTimeFromViewOffsetPx(right, time);
      item.time.end = rightGlobal;
      item.$data.time.endDate = this.api.time.date(rightGlobal);
      multi = multi.update(`config.chart.items.${item.id}`, item);
    }
    multi.done();
    this.updateData();
  }

  private onPointerUp(ev: PointerEvent) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  private onLeftPointerUp(ev: PointerEvent) {
    if (!this.data.enabled || !this.data.leftIsMoving) return;
    this.onPointerUp(ev);
    this.data.leftIsMoving = false;
    this.updateData();
  }
  private onRightPointerUp(ev: PointerEvent) {
    if (!this.data.enabled || !this.data.rightIsMoving) return;
    this.onPointerUp(ev);
    this.data.rightIsMoving = false;
    this.updateData();
  }

  public wrapper(input: htmlResult, props?: any): htmlResult {
    const oldContent = this.oldWrapper(input, props);
    const item: Item = props.props.item;

    let visible = !item.$data.detached;
    if (this.data.handle.onlyWhenSelected) {
      visible = visible && item.selected;
    }
    const rightStyleMap = this.getRightStyleMap(item, visible);
    const leftStyleMap = this.getLeftStyleMap(item, visible);
    const onLeftPointerDown = {
      handleEvent: this.onLeftPointerDown,
      //capture: true,
    };
    const onRightPointerDown = {
      handleEvent: this.onRightPointerDown,
      //capture: true,
    };
    const leftHandle = this
      .html`<div class=${this.leftClassName} style=${leftStyleMap} @pointerdown=${onLeftPointerDown}></div>`;
    const rightHandle = this
      .html`<div class=${this.rightClassName} style=${rightStyleMap} @pointerdown=${onRightPointerDown}></div>`;
    return this.html`${oldContent}${rightHandle}`;
    //return this.html`${leftHandle}${oldContent}${rightHandle}`;
  }

  public getWrapper(oldWrapper: Wrapper): Wrapper {
    if (!this.oldWrapper) {
      this.oldWrapper = oldWrapper;
    }
    this.initializeWrapper();
    return this.wrapper;
  }
}

export function Plugin(options: Options = {}) {
  return function initialize(vidoInstance: Vido) {
    const itemResizing = new ItemResizing(vidoInstance, options);
    vidoInstance.state.update('config.wrappers.ChartTimelineItemsRowItem', (oldWrapper) => {
      return itemResizing.getWrapper(oldWrapper);
    });
  };
}
