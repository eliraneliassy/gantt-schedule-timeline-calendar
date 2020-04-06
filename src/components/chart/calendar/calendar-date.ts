/**
 * ChartCalendarDay component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import Action from '@neuronet.io/vido/Action';
import { ChartTimeDate, Period, Vido } from '../../../gstc';

/**
 * Save element
 * @param {HTMLElement} element
 * @param {object} data
 */
class BindElementAction extends Action {
  constructor(element, data) {
    super();
    data.state.update('$data.elements.chart-calendar-dates', (elements) => {
      if (typeof elements === 'undefined') {
        elements = [];
      }
      if (!elements.includes(element)) {
        elements.push(element);
      }
      return elements;
    });
  }
}

export interface Props {
  level: number;
  date: ChartTimeDate;
  period: Period;
}

export default function ChartCalendarDay(vido: Vido, props: Props) {
  const { api, state, onDestroy, Actions, update, onChange, html, StyleMap, Detach } = vido;

  const componentName = 'chart-calendar-date';
  const componentActions = api.getActions(componentName);

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartCalendarDate', (value) => (wrapper = value)));

  let className;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
    })
  );

  let additionalClass = '';
  let time, htmlFormatted;
  const styleMap = new StyleMap({ width: '0px' });

  let formatClassName = '';
  function updateDate() {
    if (!props) return;
    const level = state.get(`config.chart.calendar.levels.${props.level}`);
    styleMap.style.width = props.date.currentView.width + 'px';
    time = state.get('$data.chart.time');
    const formatting = level.formats.find((formatting) => +time.zoom <= +formatting.zoomTo);
    if (props.date.current) {
      additionalClass = ' gstc-current';
    } else if (props.date.next) {
      additionalClass = ' gstc-next';
    } else if (props.date.previous) {
      additionalClass = ' gstc-previous';
    } else {
      additionalClass = '';
    }
    let finalClassName = className + '-content ' + className + `-content--${props.date.period}` + additionalClass;
    if (formatting.className) {
      finalClassName += ' ' + formatting.className;
      formatClassName = ' ' + formatting.className;
    } else {
      formatClassName = '';
    }
    htmlFormatted = html`
      <div class=${finalClassName}>
        ${props.date.formatted}
      </div>
    `;
    update();
  }

  let shouldDetach = false;
  const detach = new Detach(() => shouldDetach);

  let timeSub;
  const actionProps = { date: props.date, period: props.period, api, state };
  onChange((changedProps, options) => {
    if (options.leave) {
      shouldDetach = true;
      return update();
    }
    shouldDetach = false;
    props = changedProps;
    actionProps.date = props.date;
    actionProps.period = props.period;
    if (timeSub) {
      timeSub();
    }
    timeSub = state.subscribeAll(['$data.chart.time', 'config.chart.calendar.levels'], updateDate, {
      bulk: true,
    });
  });

  onDestroy(() => {
    timeSub();
  });

  if (!componentActions.includes(BindElementAction)) componentActions.push(BindElementAction);

  const actions = Actions.create(componentActions, actionProps);
  return (templateProps) =>
    wrapper(
      html`
        <div
          detach=${detach}
          class=${className +
          ' ' +
          className +
          `--${props.date.period}` +
          ' ' +
          className +
          `--level-${props.level}` +
          additionalClass +
          formatClassName}
          style=${styleMap}
          data-actions=${actions}
        >
          ${htmlFormatted}
        </div>
      `,
      { props, vido, templateProps }
    );
}
