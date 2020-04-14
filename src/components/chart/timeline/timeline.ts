/**
 * ChartTimeline component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Vido } from '../../../gstc';
import { ComponentInstance, Component } from '@neuronet.io/vido/vido';

export default function ChartTimeline(vido: Vido, props) {
  const { api, state, onDestroy, Action, Actions, update, html, createComponent, StyleMap } = vido;
  const componentName = 'chart-timeline';

  const actionProps = { ...props, api, state };

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimeline', (value) => (wrapper = value)));

  let Grid: ComponentInstance;
  onDestroy(
    state.subscribe('config.components.ChartTimelineGrid', (component: Component) => {
      if (Grid) Grid.destroy();
      Grid = createComponent(component);
    })
  );
  onDestroy(Grid.destroy);

  let Items: ComponentInstance;
  onDestroy(
    state.subscribe('config.components.ChartTimelineItems', (component: Component) => {
      if (Items) Items.destroy();
      Items = createComponent(component);
    })
  );
  onDestroy(Items.destroy);

  let ListToggle: ComponentInstance;
  onDestroy(
    state.subscribe('config.components.ListToggle', (component: Component) => {
      if (ListToggle) ListToggle.destroy();
      ListToggle = createComponent(component);
    })
  );
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
  onDestroy(state.subscribe('config.list.toggle.display', (val) => (showToggle = val)));

  const styleMap = new StyleMap({}),
    innerStyleMap = new StyleMap({});

  function calculateStyle() {
    const width = state.get('$data.chart.dimensions.width');
    const height = state.get('$data.list.visibleRowsHeight');
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
      [
        '$data.innerHeight',
        '$data.chart.dimensions.width',
        '$data.list.visibleRowsHeight',
        '$data.chart.time.dates.day',
      ],
      calculateStyle
    )
  );

  let componentActions = [];
  onDestroy(
    state.subscribe('config.actions.chart-timeline', (actions) => {
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
  return (templateProps) =>
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
