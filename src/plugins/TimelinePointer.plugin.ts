/**
 * TimelinePointer plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import DeepState from 'deep-state-observer';
import { Api } from '../api/Api';
import { Vido } from '@src/index';

export const CELL = 'chart-timeline-grid-row-cell';
export type CELL_TYPE = 'chart-timeline-grid-row-cell';
export const ITEM = 'chart-timeline-items-row-item';
export type ITEM_TYPE = 'chart-timeline-items-row-item';

export interface PointerEvents {
  down: PointerEvent | null;
  move: PointerEvent | null;
  up: PointerEvent | null;
}

export interface Point {
  x: number;
  y: number;
}

export type PointerState = 'up' | 'down' | 'move';

export interface PluginData {
  enabled: boolean;
  isMoving: boolean;
  pointerState: PointerState;
  currentTarget: HTMLElement | null;
  realTarget: HTMLElement | null;
  targetType: ITEM_TYPE | CELL_TYPE | '';
  targetData: any | null;
  events: PointerEvents;
  initialPosition: Point;
  currentPosition: Point;
}

export function Plugin(options = { enabled: true }) {
  let vido: Vido, api: Api, state: DeepState;
  const pluginPath = 'config.plugin.TimelinePointer';

  const classNames = {
    cell: '',
    item: '',
  };

  function generateEmptyData(): PluginData {
    return {
      enabled: options.enabled,
      isMoving: false,
      pointerState: 'up',
      currentTarget: null,
      realTarget: null,
      targetType: '',
      targetData: null,
      initialPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      events: {
        down: null,
        move: null,
        up: null,
      },
    };
  }

  let chartTimelineElement: HTMLElement;

  class TimelinePointerAction {
    private data: PluginData;
    private unsub = [];

    constructor(element) {
      this.pointerDown = this.pointerDown.bind(this);
      this.pointerMove = this.pointerMove.bind(this);
      this.pointerUp = this.pointerUp.bind(this);
      this.data = generateEmptyData();
      element.addEventListener('pointerdown', this.pointerDown);
      document.addEventListener('pointerup', this.pointerUp);
      document.addEventListener('pointermove', this.pointerMove);
      this.unsub.push(state.subscribe(pluginPath, (value) => (this.data = value)));
    }

    public destroy(element) {
      element.removeEventListener('pointerdown', this.pointerDown);
      document.removeEventListener('pointerup', this.pointerUp);
      document.removeEventListener('pointermove', this.pointerMove);
    }

    private updateData() {
      state.update(pluginPath, () => ({ ...this.data }));
    }

    private getRealTarget(ev: PointerEvent) {
      let realTarget: HTMLElement = (ev.target as HTMLElement).closest('.' + classNames.item) as HTMLElement;
      if (realTarget) {
        return realTarget;
      }
      realTarget = (ev.target as HTMLElement).closest('.' + classNames.cell) as HTMLElement;
      if (realTarget) {
        return realTarget;
      }
      return null;
    }

    getRealPosition(ev: PointerEvent): Point {
      const pos = { x: 0, y: 0 };
      if (chartTimelineElement) {
        const bounding = chartTimelineElement.getBoundingClientRect();
        pos.x = ev.x - bounding.x;
        pos.y = ev.y - bounding.y;
      }
      return pos;
    }

    private pointerDown(ev: PointerEvent) {
      if (!this.data.enabled) return;
      this.data.pointerState = 'down';
      this.data.currentTarget = ev.target as HTMLElement;
      this.data.realTarget = this.getRealTarget(ev);
      if (this.data.realTarget) {
        if (this.data.realTarget.classList.contains(classNames.item)) {
          this.data.targetType = ITEM;
          // @ts-ignore
          this.data.targetData = this.data.realTarget.vido.item;
        } else if (this.data.realTarget.classList.contains(classNames.cell)) {
          this.data.targetType = CELL;
          // @ts-ignore
          this.data.targetData = this.data.realTarget.vido;
        } else {
          this.data.targetType = '';
        }
      } else {
        this.data.targetType = '';
        this.data.targetData = null;
      }
      this.data.isMoving = !!this.data.realTarget;
      this.data.events.down = ev;
      this.data.events.move = ev;
      const realPosition = this.getRealPosition(ev);
      this.data.initialPosition = realPosition;
      this.data.currentPosition = realPosition;
      this.updateData();
    }

    private pointerUp(ev: PointerEvent) {
      if (!this.data.enabled) return;
      this.data.pointerState = 'up';
      this.data.isMoving = false;
      this.data.events.up = ev;
      this.data.currentPosition = this.getRealPosition(ev);
      this.updateData();
    }

    private pointerMove(ev: PointerEvent) {
      if (!this.data.enabled || !this.data.isMoving) return;
      this.data.pointerState = 'move';
      this.data.events.move = ev;
      this.data.currentPosition = this.getRealPosition(ev);
      this.updateData();
    }
  }

  return function initialize(vidoInstance: Vido) {
    vido = vidoInstance;
    api = vido.api;
    state = vido.state;
    classNames.cell = api.getClass(CELL);
    classNames.item = api.getClass(ITEM);
    const unsub = state.subscribe('$data.elements.chart-timeline', (el) => (chartTimelineElement = el));
    state.update('config.actions.chart-timeline', (timelineActions) => {
      timelineActions.push(TimelinePointerAction);
      return timelineActions;
    });
    state.update(pluginPath, (data) => {
      return generateEmptyData();
    });

    return function destroy() {
      unsub();
    };
  };
}
