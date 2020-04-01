/**
 * CalendarScroll plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { ScrollTypeHorizontal, Vido } from '../types';
import DeepState from 'deep-state-observer';
import { Api } from '../api/Api';

export interface Point {
  x: number;
  y: number;
}

export interface Options {
  enabled: boolean;
}

const defaultOptions = {
  enabled: true
};

export function Plugin(options: Options = defaultOptions) {
  let vido: Vido, api: Api, state: DeepState;
  let enabled = options.enabled;

  class ChartAction {
    private moving = false;
    private initialPoint: Point;
    private initialDataIndex: Point = { x: 0, y: 0 };
    private lastPos = 0;

    constructor(element: HTMLElement) {
      this.pointerDown = this.pointerDown.bind(this);
      this.pointerUp = this.pointerUp.bind(this);
      this.pointerMove = vido.schedule(this.pointerMove.bind(this));
      element.addEventListener('pointerdown', this.pointerDown);
      document.addEventListener('pointermove', this.pointerMove, { passive: true });
      document.addEventListener('pointerup', this.pointerUp);
      element.style.cursor = 'grab';
    }

    public destroy(element: HTMLElement) {
      element.removeEventListener('pointerdown', this.pointerDown);
      document.removeEventListener('pointermove', this.pointerMove);
      document.removeEventListener('pointerup', this.pointerUp);
    }

    private resetInitialPoint(ev: PointerEvent) {
      this.initialPoint = { x: ev.screenX, y: ev.screenY };
    }

    private pointerDown(ev: PointerEvent) {
      if (!enabled) return;
      this.moving = true;
      this.resetInitialPoint(ev);
      const scroll = state.get('config.scroll');
      this.initialDataIndex = { x: scroll.horizontal.dataIndex || 0, y: scroll.vertical.dataIndex || 0 };
    }

    private pointerUp(ev: PointerEvent) {
      if (!enabled) return;
      if (this.moving) {
        this.moving = false;
      }
    }

    private handleHorizontalMovement(diff: Point, ev: PointerEvent) {
      const time = state.get('$data.chart.time');
      if (diff.x > 0) {
        // go backward - move dates forward
        if (this.initialDataIndex.x === 0) {
          return this.resetInitialPoint(ev);
        }
        const allDates = time.allDates[time.level];
        let i = this.initialDataIndex.x - 1;
        let width = 0;
        for (; i > 0; i--) {
          const date = allDates[i];
          width += date.width;
          if (width >= diff.x) break;
        }
        api.scrollToTime(allDates[i].leftGlobal, false);
      } else if (diff.x < 0) {
        // go forward - move dates backward
        let i = this.initialDataIndex.x;
        const hScroll = state.get('config.scroll.horizontal') as ScrollTypeHorizontal;
        const allDates = time.allDates[time.level];
        if (i - 1 >= allDates.length - hScroll.lastPageCount) {
          return this.resetInitialPoint(ev);
        }
        let width = 0;
        for (let len = allDates.length; i < len; i++) {
          const date = allDates[i];
          width += date.width;
          if (-width <= diff.x) break;
        }
        if (i - 1 >= allDates.length - hScroll.lastPageCount) {
          return;
        }
        api.scrollToTime(allDates[i].leftGlobal, false);
      }
    }

    private pointerMove(ev: PointerEvent) {
      if (!enabled || !this.moving) return;
      const diffX = ev.screenX - this.initialPoint.x;
      const diffY = ev.screenY - this.initialPoint.y;
      const diff: Point = { x: diffX, y: diffY };
      this.handleHorizontalMovement(diff, ev);
    }
  }

  return function initialize(vidoInstance) {
    vido = vidoInstance;
    api = vido.api;
    state = vido.state;
    state.update('config.plugin.CalendarScroll', options);
    state.subscribe('config.plugin.CalendarScroll.enabled', value => (enabled = value));
    state.update('config.actions.chart-calendar', chartActions => {
      chartActions.push(ChartAction);
      return chartActions;
    });
  };
}
