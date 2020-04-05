/**
 * List component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Vido } from '@src/gstc';

export default function List(vido: Vido, props = {}) {
  const { api, state, onDestroy, Actions, update, reuseComponents, html, schedule, StyleMap, cache } = vido;

  const componentName = 'list';
  const componentActions = api.getActions(componentName);

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.List', (value) => (wrapper = value)));

  let ListColumnComponent;
  const listColumnUnsub = state.subscribe('config.components.ListColumn', (value) => (ListColumnComponent = value));

  function renderExpanderIcons() {
    const icons = state.get('config.list.expander.icons');
    const rendered = {};
    for (const iconName in icons) {
      const html = icons[iconName];
      rendered[iconName] = api.getSVGIconSrc(html);
    }
    state.update('$data.list.expander.icons', rendered);
  }
  renderExpanderIcons();

  function renderToggleIcons() {
    const toggleIconsSrc = {
      open: '',
      close: '',
    };
    const icons = state.get('config.list.toggle.icons');
    for (const iconName in icons) {
      const html = icons[iconName];
      toggleIconsSrc[iconName] = api.getSVGIconSrc(html);
    }
    state.update('$data.list.toggle.icons', toggleIconsSrc);
  }
  renderToggleIcons();

  let className;
  let list, percent;
  function onListChange() {
    list = state.get('config.list');
    percent = list.columns.percent;
    update();
  }
  onDestroy(state.subscribe('config.list', onListChange));

  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      update();
    })
  );

  let listColumns = [];
  function onListColumnsDataChange(data) {
    const destroy = reuseComponents(
      listColumns,
      Object.values(data),
      (column) => ({ columnId: column.id }),
      ListColumnComponent
    );
    update();
    return destroy;
  }
  onDestroy(state.subscribe('config.list.columns.data;', onListColumnsDataChange));

  const styleMap = new StyleMap({
    height: '',
    ['--expander-padding-width' as any]: '',
    ['--expander-size' as any]: '',
  });

  onDestroy(
    state.subscribeAll(['config.height', 'config.list.expander'], (bulk) => {
      const expander = state.get('config.list.expander');
      styleMap.style['height'] = state.get('config.height') + 'px';
      styleMap.style['--expander-padding-width'] = expander.padding + 'px';
      styleMap.style['--expander-size'] = expander.size + 'px';
      update();
    })
  );

  onDestroy(() => {
    listColumns.forEach((listColumn) => listColumn.destroy());
    listColumnUnsub();
  });

  function onWheel(ev) {
    // TODO
  }

  let width;
  function getWidth(element) {
    if (!width) {
      width = element.clientWidth;
      if (percent === 0) {
        width = 0;
      }
      state.update('$data.list.width', width);
    }
  }

  class ListAction {
    constructor(element, data) {
      data.state.update('$data.elements.list', element);
      getWidth(element);
    }
    update(element) {
      return getWidth(element);
    }
  }
  componentActions.push(ListAction);

  const actions = Actions.create(componentActions, { ...props, api, state });

  return (templateProps) =>
    wrapper(
      cache(
        list.columns.percent > 0
          ? html`
              <div class=${className} data-actions=${actions} style=${styleMap} @wheel=${onWheel}>
                ${listColumns.map((c) => c.html())}
              </div>
            `
          : ''
      ),
      { vido, props: {}, templateProps }
    );
}
