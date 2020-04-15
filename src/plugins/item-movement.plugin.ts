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

export interface OnArg {
  items: Item[];
  vido: Vido;
  time: DataChartTime;
  movement: Movement;
}

export interface Options {
  enabled?: boolean;
  className?: string;
  bodyClass?: string;
  bodyClassMoving?: string;
  onStart?: (onArg: OnArg) => boolean;
  onMove?: (onArg: OnArg) => boolean;
  onEnd?: (onArg: OnArg) => boolean;
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
  pointerState: 'up' | 'down' | 'move';
  state: State;
  pointerMoved: boolean;
}

export interface MovingTimes {
  startTime: Dayjs;
  endTime: Dayjs;
}

export type State = '' | 'start' | 'end' | 'move';

export interface Cumulation {
  start: number;
  end: number;
}

export interface Cumulations {
  [key: string]: Cumulation;
}

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
    pointerState: 'up',
    pointerMoved: false,
    state: '',
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
    snapStart({ startTime, time }) {
      return startTime.startOf(time.period);
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
  private cumulations: Cumulations = {};
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

  private clearCumulationsForItems() {
    this.cumulations = {};
  }

  private setStartCumulationForItem(item: Item, cumulation: number) {
    if (!this.cumulations[item.id]) {
      this.cumulations[item.id] = { start: 0, end: 0 };
    }
    this.cumulations[item.id].start = cumulation;
  }

  private getStartCumulationForItem(item: Item): number {
    return this.cumulations[item.id]?.start || 0;
  }

  private getItemMovingTimes(item: Item, time: DataChartTime): MovingTimes {
    const horizontal = this.data.movement.px.horizontal;
    const positionLeft = this.api.time.getViewOffsetPxFromDates(item.$data.time.startDate, false, time);
    const x = positionLeft + horizontal + this.getStartCumulationForItem(item);
    let leftGlobal = this.api.time.getTimeFromViewOffsetPx(x, time);
    let startTime = this.data.snapStart({
      item,
      startTime: this.api.time.date(leftGlobal),
      time,
      movement: this.data.movement,
      vido: this.vido,
    });
    const snapStartPxDiff = this.api.time.getDatesDiffPx(startTime, this.api.time.date(leftGlobal), time, true);
    this.setStartCumulationForItem(item, snapStartPxDiff);
    const startEndTimeDiff = item.$data.time.endDate.diff(item.$data.time.startDate, 'millisecond');
    let rightGlobal = startTime.add(startEndTimeDiff, 'millisecond').valueOf();
    let endTime = this.data.snapEnd({
      item,
      time,
      movement: this.data.movement,
      vido: this.vido,
      endTime: this.api.time.date(rightGlobal),
    });
    return { startTime, endTime };
  }

  private moveItemVertically(item: Item): Item {
    return item;
  }

  private moveItems() {
    const time: DataChartTime = this.state.get('$data.chart.time');
    let multi = this.state.multi();
    for (let item of this.data.moving) {
      const newItemTimes = this.getItemMovingTimes(item, time);
      item = this.moveItemVertically(item);
      multi = multi
        .update(`config.chart.items.${item.id}.time`, (itemTime: ItemTime) => {
          itemTime.start = newItemTimes.startTime.valueOf();
          itemTime.end = newItemTimes.endTime.valueOf();
          return itemTime;
        })
        .update(`config.chart.items.${item.id}.$data.time`, (dataTime: ItemDataTime) => {
          dataTime.startDate = newItemTimes.startTime;
          dataTime.endDate = newItemTimes.endTime;
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
    this.data.pointerState = 'up';
    this.data.pointerMoved = false;
  }

  private onStart() {
    this.clearCumulationsForItems();
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

  private canMove(state: State, onArg: OnArg): boolean {
    switch (state) {
      case 'start':
        return this.data.onStart(onArg);
      case 'move':
        return this.data.onMove(onArg);
      case 'end':
        return this.data.onEnd(onArg);
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

    if (this.data.pointerState === 'up' && this.selection.pointerState === 'down') {
      this.data.state = 'start';
    } else if (
      (this.data.pointerState === 'down' || this.data.pointerState === 'move') &&
      this.selection.pointerState === 'up'
    ) {
      this.data.state = 'end';
    } else if (this.data.pointerState === 'move' && this.selection.pointerState === 'move') {
      this.data.state = 'move';
    } else if (
      this.data.pointerState === 'up' &&
      (this.selection.pointerState === 'move' || this.selection.pointerState === 'up')
    ) {
      // do nothing because movement was rejected
      return;
    }

    this.data.pointerState = this.selection.pointerState;
    this.data.moving = [...this.selection.selected[ITEM]];
    if (this.data.state === 'start') {
      this.data.initialItems = this.data.moving.map((item) => this.merge({}, item) as Item);
    }

    switch (this.data.state) {
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

    const onArg: OnArg = {
      items: this.data.moving,
      vido: this.vido,
      movement: this.data.movement,
      time: this.state.get('$data.chart.time'),
    };
    if (this.canMove(this.data.state, onArg)) {
      this.moveItems();
    } else {
      this.data.pointerState = 'up';
      if (this.data.state === 'end') {
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
