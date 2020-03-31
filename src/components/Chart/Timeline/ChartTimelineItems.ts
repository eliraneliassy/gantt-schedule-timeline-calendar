/**
 * ChartTimelineItems component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { vido } from '@neuronet.io/vido/vido';
import DeepState from 'deep-state-observer';
import { Api } from '../../../api/Api';

export default function ChartTimelineItems(vido: vido<DeepState, Api>, props = {}) {
  const { api, state, onDestroy, Actions, update, html, reuseComponents, StyleMap } = vido;
  const componentName = 'chart-timeline-items';
  const componentActions = api.getActions(componentName);
  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimelineItems', value => (wrapper = value)));

  let ItemsRowComponent;
  onDestroy(state.subscribe('config.components.ChartTimelineItemsRow', value => (ItemsRowComponent = value)));

  let className;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      update();
    })
  );
  const styleMap = new StyleMap({}, true);
  function calculateStyle() {
    const width = state.get('_internal.chart.dimensions.width');
    const height = state.get('_internal.innerHeight');
    styleMap.style.width = width + 'px';
    styleMap.style.height = height + 'px';
  }
  onDestroy(state.subscribeAll(['_internal.innerHeight', '_internal.chart.dimensions.width'], calculateStyle));

  const rowsComponents = [];
  function createRowComponents() {
    const visibleRows = state.get('_internal.list.visibleRows');
    reuseComponents(rowsComponents, visibleRows || [], row => ({ row }), ItemsRowComponent);
    update();
  }
  onDestroy(state.subscribeAll(['_internal.list.visibleRows;', 'config.chart.items'], createRowComponents));
  onDestroy(() => {
    rowsComponents.forEach(row => row.destroy());
  });

  const actions = Actions.create(componentActions, { api, state });

  return templateProps =>
    wrapper(
      html`
        <div class=${className} style=${styleMap} data-actions=${actions}>
          ${rowsComponents.map(r => r.html())}
        </div>
      `,
      { props, vido, templateProps }
    );
}
