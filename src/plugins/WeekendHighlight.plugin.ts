/**
 * Weekend highlight plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Action, vido } from '@neuronet.io/vido/vido';
import { Api } from '../api/Api';
import DeepState from 'deep-state-observer';

export interface Options {
  weekdays?: number[];
  className?: string;
}

export function Plugin(options: Options = {}) {
  const weekdays = options.weekdays || [6, 0];
  let className;
  let api: Api;
  let enabled = true;

  class WeekendHighlightAction extends Action {
    constructor(element, data) {
      super();
      this.highlight(element, data.time.leftGlobal);
    }

    update(element, data) {
      this.highlight(element, data.time.leftGlobal);
    }

    highlight(element, time) {
      const hasClass = element.classList.contains(className);
      if (!enabled) {
        if (hasClass) {
          element.classList.remove(className);
        }
        return;
      }
      const isWeekend = weekdays.includes(api.time.date(time).day());
      if (!hasClass && isWeekend) {
        element.classList.add(className);
      } else if (hasClass && !isWeekend) {
        element.classList.remove(className);
      }
    }
  }

  return function initialize(vidoInstance: vido<DeepState, Api>) {
    api = vidoInstance.api;
    className = options.className || api.getClass('chart-timeline-grid-row-cell') + '--weekend';
    const destroy = vidoInstance.state.subscribe(
      '$data.chart.time.format.period',
      period => (enabled = period === 'day')
    );
    vidoInstance.state.update('config.actions.chart-timeline-grid-row-cell', actions => {
      actions.push(WeekendHighlightAction);
      return actions;
    });
    return function onDestroy() {
      destroy();
    };
  };
}
