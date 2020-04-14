/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { PluginData as SelectionPluginData } from './selection.plugin';
import { Item, DataChartTime, Scroll, DataChartDimensions, ItemTime, Vido, ItemDataTime, Row } from '../gstc';
import { ITEM, Point } from './timeline-pointer.plugin';
import { Dayjs } from 'dayjs';
import { Api } from '../api/api';
import DeepState from 'deep-state-observer';

export interface SnapArg {
  item: Item;
  time: DataChartTime;
  vido: Vido;
  movement: Movement;
}

export interface SnapStartArg extends SnapArg {
  startTime: Dayjs;
}

export interface SnapEndArg extends SnapArg {
  endTime: Dayjs;
}

export interface Options {
  enabled?: boolean;
  className?: string;
  bodyClass?: string;
  bodyClassMoving?: string;
  onStart?: (items: Item[]) => boolean;
  onMove?: (items: Item[]) => boolean;
  onEnd?: (items: Item[]) => boolean;
  snapStart?: (snapStartArgs: SnapStartArg) => Dayjs;
  snapEnd?: (snapEndArgs: SnapEndArg) => Dayjs;
  onRowChange?: (item: Item, newRow: Row) => boolean;
}

export interface MovementResult {
  horizontal: number;
  vertical: number;
}

export interface Movement {
  px: MovementResult;
  time: number;
}

export interface PluginData extends Options {
  moving: Item[];
  initialItems: Item[];
  movement: Movement;
  lastPosition: Point;
  state: 'up' | 'down' | 'move';
  pointerMoved: boolean;
}

export interface MovingTime {
  time: Dayjs;
  position: number;
  width: number;
  snapTimeDiff: number;
  snapPxDiff: number;
}

export type State = '' | 'start' | 'end' | 'move';

function prepareOptions(options: Options): Options {
  return {
    enabled: true,
    className: '',
    bodyClass: 'gstc-item-movement',
    bodyClassMoving: 'gstc-items-moving',
    ...options,
  };
}

const pluginPath = 'config.plugin.ItemMovement';

function gemerateEmptyPluginData(options: Options): PluginData {
  return {
    moving: [],
    initialItems: [],
    state: 'up',
    pointerMoved: false,
    lastPosition: { x: 0, y: 0 },
    movement: {
      px: { horizontal: 0, vertical: 0 },
      time: 0,
    },
    onStart() {
      return true;
    },
    onMove() {
      return true;
    },
    onEnd() {
      return true;
    },
    snapStart({ startTime, time, vido }) {
      return startTime.startOf(vido.api.time.getLowerPeriod(time.period));
    },
    snapEnd({ endTime, time }) {
      return endTime.endOf(time.period);
    },
    onRowChange() {
      return true;
    },
    ...options,
  };
}

class ItemMovement {
  private vido: Vido;
  private api: Api;
  private state: DeepState;
  private onDestroy = [];
  private selection: SelectionPluginData;
  private data: PluginData;
  private merge: (target: object, source: object) => object;

  constructor(vido: Vido) {
    this.vido = vido;
    this.api = vido.api;
    this.state = vido.state;
    this.merge = this.state.get('config.merge');
    this.onDestroy.push(
      this.state.subscribe(pluginPath, (data) => {
        this.data = data;
        if (!data.enabled) {
          document.body.classList.remove(this.data.bodyClass);
        } else {
          document.body.classList.add(this.data.bodyClass);
        }
      })
    );
    if (!this.data.className) this.data.className = this.api.getClass('chart-timeline-items-row-item--moving');
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onDestroy.push(this.state.subscribe('config.plugin.Selection', this.onSelectionChange));
  }

  public destroy() {
    this.onDestroy.forEach((unsub) => unsub());
  }

  private updateData() {
    this.state.update(pluginPath, this.data);
  }

  private getItemMovingAttrs(item: Item, time: DataChartTime, isStart: boolean = false): MovingTime {
    const horizontal = this.data.movement.px.horizontal;
    const positionLeft = this.api.time.getViewOffsetPxFromDates(item.$data.time.startDate, false, time);
    const x = positionLeft + horizontal;
    let leftGlobal = this.api.time.getTimeFromViewOffsetPx(x, time);
    let leftGlobalDate = this.api.time.date(leftGlobal);
    /*if (isStart) {
      leftGlobalDate = this.data.snapStart({
        item,
        startTime: leftGlobalDate,
        time,
        movement: this.data.movement,
        vido: this.vido,
      });
    }*/
    const snapTimeDiff = leftGlobalDate.valueOf() - leftGlobal;
    const snapPxDiff = this.api.time.getDatesDiffPx(this.api.time.date(leftGlobal), leftGlobalDate, time);
    //console.log({ snapPxDiff });
    const rightPx = this.api.time.getViewOffsetPxFromDates(item.$data.time.endDate);
    return {
      time: leftGlobalDate,
      position: x,
      width: rightPx - x,
      snapTimeDiff,
      snapPxDiff,
    };
  }

  private moveItemVertically(item: Item): Item {
    return item;
  }

  private moveItems() {
    const time: DataChartTime = this.state.get('$data.chart.time');
    let multi = this.state.multi();
    for (let item of this.data.moving) {
      const newItemMovingAttrs = this.getItemMovingAttrs(item, time, true);
      item = this.moveItemVertically(item);
      multi = multi
        .update(`config.chart.items.${item.id}.time`, (itemTime: ItemTime) => {
          const newStartTime = newItemMovingAttrs.time.valueOf();
          const diff = newStartTime - itemTime.start;
          itemTime.start = newStartTime;
          itemTime.end += diff;
          return itemTime;
        })
        .update(`config.chart.items.${item.id}.$data.time`, (dataTime: ItemDataTime) => {
          dataTime.startDate = this.api.time.date(item.time.start);
          dataTime.endDate = this.api.time.date(item.time.end);
          return dataTime;
        });
    }
    multi.done();
  }

  private clearSelection() {
    this.data.moving = [];
    this.data.initialItems = [];
    this.data.movement.px.horizontal = 0;
    this.data.movement.px.vertical = 0;
    this.data.movement.time = 0;
    this.data.state = 'up';
    this.data.pointerMoved = false;
  }

  private onStart() {
    document.body.classList.add(this.data.bodyClassMoving);
    this.data.lastPosition = { ...this.selection.currentPosition };
  }

  private onEnd() {
    document.body.classList.remove(this.data.bodyClassMoving);
  }

  private restoreInitialItems() {
    let multi = this.state.multi();
    for (const item of this.data.initialItems) {
      multi = multi.update(`config.chart.items.${item.id}`, item);
    }
    multi.done();
    this.clearSelection();
    this.updateData();
  }

  private canMove(state: State): boolean {
    switch (state) {
      case 'start':
        return this.data.onStart(this.data.moving);
      case 'move':
        return this.data.onMove(this.data.moving);
      case 'end':
        return this.data.onEnd(this.data.moving);
    }
    return true;
  }

  private onSelectionChange(data: SelectionPluginData) {
    if (!this.data.enabled) return;
    this.selection = data;
    if (this.selection.targetType !== ITEM) {
      return this.clearSelection();
    }
    if (this.selection.events.move) {
      this.selection.events.move.preventDefault();
      this.selection.events.move.stopPropagation();
    }
    if (this.selection.events.down) {
      this.selection.events.down.preventDefault();
      this.selection.events.down.stopPropagation();
    }

    let state: State = '';
    if (this.data.state === 'up' && this.selection.pointerState === 'down') {
      state = 'start';
    } else if ((this.data.state === 'down' || this.data.state === 'move') && this.selection.pointerState === 'up') {
      state = 'end';
    } else if (this.data.state === 'move' && this.selection.pointerState === 'move') {
      state = 'move';
    } else if (
      this.data.state === 'up' &&
      (this.selection.pointerState === 'move' || this.selection.pointerState === 'up')
    ) {
      // do nothing because movement was rejected
      return;
    }

    this.data.state = this.selection.pointerState;
    this.data.moving = [...this.selection.selected[ITEM]];
    if (state === 'start') {
      this.data.initialItems = this.data.moving.map((item) => this.merge({}, item) as Item);
    }

    switch (state) {
      case 'start':
        this.onStart();
        break;
      case 'end':
        this.onEnd();
        break;
    }

    this.data.movement.px.horizontal = this.selection.currentPosition.x - this.data.lastPosition.x;
    this.data.movement.px.vertical = this.selection.currentPosition.y - this.data.lastPosition.y;
    this.data.lastPosition.x = this.selection.currentPosition.x;
    this.data.lastPosition.y = this.selection.currentPosition.y;

    if (this.canMove(state)) {
      this.moveItems();
    } else {
      this.data.state = 'up';
      if (state === 'end') {
        this.restoreInitialItems();
      }
    }
    this.updateData();
  }
}

export function Plugin(options: Options = {}) {
  return function initialize(vidoInstance: Vido) {
    vidoInstance.state.update(pluginPath, gemerateEmptyPluginData(prepareOptions(options)));
    new ItemMovement(vidoInstance);
  };
}
