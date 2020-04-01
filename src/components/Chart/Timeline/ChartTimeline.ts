/**
 * ChartTimeline component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Vido } from '../../../types';

export default function ChartTimeline(vido: Vido, props) {
  const { api, state, onDestroy, Action, Actions, update, html, createComponent, StyleMap } = vido;
  const componentName = 'chart-timeline';

  const actionProps = { ...props, api, state };

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimeline', value => (wrapper = value)));

  const GridComponent = state.get('config.components.ChartTimelineGrid');
  const ItemsComponent = state.get('config.components.ChartTimelineItems');
  const ListToggleComponent = state.get('config.components.ListToggle');

  const Grid = createComponent(GridComponent);
  onDestroy(Grid.destroy);
  const Items = createComponent(ItemsComponent);
  onDestroy(Items.destroy);
  const ListToggle = createComponent(ListToggleComponent);
  onDestroy(ListToggle.destroy);

  let className, classNameInner;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      classNameInner = api.getClass(componentName + '-inner');
      update();
    })
  );

  let showToggle;
  onDestroy(state.subscribe('config.list.toggle.display', val => (showToggle = val)));

  const styleMap = new StyleMap({}),
    innerStyleMap = new StyleMap({});

  function calculateStyle() {
    const width = state.get('$data.chart.dimensions.width');
    const height = state.get('$data.list.rowsHeight');
    styleMap.style.height = state.get('$data.innerHeight') + 'px';
    styleMap.style['--height'] = styleMap.style.height;
    if (width) {
      styleMap.style.width = width + 'px';
      styleMap.style['--width'] = width + 'px';
    } else {
      styleMap.style.width = '0px';
      styleMap.style['--width'] = '0px';
    }
    innerStyleMap.style.height = height + 'px';
    if (width) {
      innerStyleMap.style.width = width + 'px';
    } else {
      innerStyleMap.style.width = '0px';
    }
    update();
  }

  onDestroy(
    state.subscribeAll(
      ['$data.innerHeight', '$data.chart.dimensions.width', '$data.list.rowsHeight', '$data.chart.time.dates.day'],
      calculateStyle
    )
  );

  let componentActions = [];
  onDestroy(
    state.subscribe('config.actions.chart-timeline', actions => {
      componentActions = actions;
    })
  );

  componentActions.push(
    class BindElementAction extends Action {
      constructor(element) {
        super();
        const old = state.get('$data.elements.chart-timeline');
        if (old !== element) state.update('$data.elements.chart-timeline', element);
      }
    }
  );

  const actions = Actions.create(componentActions, actionProps);
  return templateProps =>
    wrapper(
      html`
        <div class=${className} style=${styleMap} data-actions=${actions}>
          <div class=${classNameInner} style=${innerStyleMap}>
            ${Grid.html()}${Items.html()}${showToggle ? ListToggle.html() : ''}
          </div>
        </div>
      `,
      { props, vido, templateProps }
    );
}
