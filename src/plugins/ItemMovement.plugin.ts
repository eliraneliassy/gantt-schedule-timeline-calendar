/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { PluginData as SelectionPluginData } from './Selection/Selection.plugin';
import { Item, DataChartTime, Scroll, DataChartDimensions, ItemTime, ItemDataTime, Vido, ItemData } from '../types';
import { ITEM, Point } from './TimelinePointer.plugin';
import { Dayjs } from 'dayjs';
import { Api } from '../api/Api';
import DeepState from 'deep-state-observer';

export interface SnapArg {
  time: DataChartTime;
  scroll: Scroll;
  dimensions: DataChartDimensions;
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
  onStart?: (items: Item[]) => void;
  onMove?: (items: Item[]) => void;
  onEnd?: (items: Item[]) => void;
  snapStart?: (snapStartArgs: SnapStartArg) => Dayjs;
  snapEnd?: (snapEndArgs: SnapEndArg) => Dayjs;
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
  lastMoved: Item[];
  movement: Movement;
  lastPosition: Point;
  state: 'up' | 'down' | 'move';
  pointerMoved: boolean;
}

export interface MovingTime {
  time: Dayjs;
  position: number;
}

function prepareOptions(options: Options): Options {
  return {
    enabled: true,
    className: '',
    ...options
  };
}

const pluginPath = 'config.plugin.ItemMovement';

function gemerateEmptyPluginData(options: Options): PluginData {
  return {
    moving: [],
    lastMoved: [],
    state: 'up',
    pointerMoved: false,
    lastPosition: { x: 0, y: 0 },
    movement: {
      px: { horizontal: 0, vertical: 0 },
      time: 0
    },
    onStart() {},
    onMove() {},
    onEnd() {},
    snapStart({ startTime, time }) {
      return startTime.startOf(time.period);
    },
    snapEnd({ endTime, time }) {
      return endTime.endOf(time.period);
    },
    ...options
  };
}

class ItemMovement {
  private vido: Vido;
  private api: Api;
  private state: DeepState;
  private onDestroy = [];
  private selection: SelectionPluginData;
  private data: PluginData;

  constructor(vido: Vido) {
    this.vido = vido;
    this.api = vido.api;
    this.state = vido.state;
    this.onDestroy.push(this.state.subscribe(pluginPath, data => (this.data = data)));
    if (!this.data.className) this.data.className = this.api.getClass('chart-timeline-items-row-item--moving');
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onDestroy.push(this.state.subscribe('config.plugin.Selection', this.onSelectionChange));
  }

  destroy() {
    this.onDestroy.forEach(unsub => unsub());
  }

  updateData() {
    this.state.update(pluginPath, this.data);
  }

  getItemMovingTime(item: Item, time: DataChartTime): MovingTime {
    const horizontal = this.data.movement.px.horizontal;
    const x = item.$data.position.left + horizontal;
    const leftGlobal = Math.round(this.api.time.getTimeFromViewOffsetPx(x, time));
    return {
      time: this.api.time.date(leftGlobal),
      position: x
    };
  }

  moveItems() {
    const time: DataChartTime = this.state.get('$data.chart.time');
    for (const item of this.data.lastMoved) {
      const start = this.getItemMovingTime(item, time);
      let newItemTime: ItemTime;
      this.state
        .multi()
        .update(`config.chart.items.${item.id}.time`, (itemTime: ItemTime) => {
          const newStartTime = start.time.valueOf();
          const diff = newStartTime - itemTime.start;
          itemTime.start = newStartTime;
          itemTime.end += diff;
          newItemTime = { ...itemTime };
          return itemTime;
        })
        .update(`config.chart.items.${item.id}.$data`, (itemData: ItemData) => {
          itemData.time.startDate = start.time;
          itemData.time.endDate = this.api.time.date(newItemTime.end);
          itemData.position.left = start.position;
          itemData.position.actualLeft = this.api.time.limitOffsetPxToView(start.position);
          itemData.position.right = itemData.position.left + itemData.width;
          itemData.position.actualRight = this.api.time.limitOffsetPxToView(itemData.position.right);
          itemData.actualWidth = itemData.position.actualRight - itemData.position.actualLeft;
          return itemData;
        })
        .done();
    }
  }

  clearSelection() {
    this.data.moving = [];
    this.data.lastMoved = [];
    this.data.movement.px.horizontal = 0;
    this.data.movement.px.vertical = 0;
    this.data.movement.time = 0;
    this.data.state = 'up';
    this.data.pointerMoved = false;
  }

  updatePointerState() {
    if (this.data.state === 'up' && this.selection.pointerState === 'down') {
      this.data.onStart(this.data.moving);
    } else if ((this.data.state === 'down' || this.data.state === 'move') && this.selection.pointerState === 'up') {
      this.data.moving = [];
      this.data.onEnd(this.data.lastMoved);
      this.clearSelection();
    } else if (this.selection.pointerState === 'move') {
      if (this.data.movement.px.horizontal || this.data.movement.px.vertical) {
        this.data.pointerMoved = true;
      }
      this.data.onMove(this.data.moving);
    }
    this.data.state = this.selection.pointerState;
  }

  onStart() {
    this.data.lastPosition = { ...this.selection.currentPosition };
  }

  onSelectionChange(data: SelectionPluginData) {
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

    if (this.data.state === 'up' && this.selection.pointerState === 'down') {
      this.onStart();
    }

    this.data.moving = [...this.selection.selected[ITEM]];
    if (this.data.moving.length) this.data.lastMoved = [...this.data.moving];

    this.data.movement.px.horizontal = this.selection.currentPosition.x - this.data.lastPosition.x;
    this.data.movement.px.vertical = this.selection.currentPosition.y - this.data.lastPosition.y;
    this.data.lastPosition.x = this.selection.currentPosition.x;
    this.data.lastPosition.y = this.selection.currentPosition.y;

    this.updatePointerState();

    this.moveItems();
    this.updateData();
  }
}

export function Plugin(options: Options = {}) {
  return function initialize(vidoInstance: Vido) {
    vidoInstance.state.update(pluginPath, gemerateEmptyPluginData(prepareOptions(options)));
    new ItemMovement(vidoInstance);
  };
}
