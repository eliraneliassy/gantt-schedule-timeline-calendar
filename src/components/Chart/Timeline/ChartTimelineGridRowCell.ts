/**
 * ChartTimelineGridRowCell component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

/**
 * Bind element action
 * @param {Element} element
 * @param {any} data
 * @returns {object} with update and destroy
 */

class BindElementAction {
  constructor(element, data) {
    let shouldUpdate = false;
    let cells = data.state.get('_internal.elements.chart-timeline-grid-row-cells');
    if (typeof cells === 'undefined') {
      cells = [];
      shouldUpdate = true;
    }
    if (!cells.includes(element)) {
      cells.push(element);
      shouldUpdate = true;
    }
    if (shouldUpdate) data.state.update('_internal.elements.chart-timeline-grid-row-cells', cells, { only: null });
  }

  public destroy(element, data) {
    data.state.update(
      '_internal.elements.chart-timeline-grid-row-cells',
      cells => {
        return cells.filter(el => el !== element);
      },
      { only: [''] }
    );
  }
}

interface Props {
  row: any;
  time: any;
}

const ChartTimelineGridRowCell = (vido, props: Props) => {
  const { api, state, onDestroy, Detach, Actions, update, html, onChange, StyleMap } = vido;
  const componentName = 'chart-timeline-grid-row-cell';
  const actionProps = {
    ...props,
    api,
    state
  };

  let shouldDetach = false;
  const detach = new Detach(() => shouldDetach);

  const componentActions = api.getActions(componentName);
  let wrapper;
  onDestroy(
    state.subscribe('config.wrappers.ChartTimelineGridRowCell', value => {
      wrapper = value;
      update();
    })
  );

  let className;
  function updateClassName(time) {
    className = api.getClass(componentName);
    if (time.current) {
      className += ' current';
    }
  }
  updateClassName(props.time);
  const styleMap = new StyleMap({ width: '', height: '' });
  /**
   * On props change
   * @param {any} changedProps
   */
  function onPropsChange(changedProps, options) {
    if (options.leave || changedProps.row === undefined) {
      shouldDetach = true;
      return update();
    }
    shouldDetach = false;
    props = changedProps;
    for (const prop in props) {
      actionProps[prop] = props[prop];
    }
    updateClassName(props.time);
    styleMap.setStyle({});
    styleMap.style.width = (props?.time?.width || 0) + 'px';
    styleMap.style.height = (props?.row?.outerHeight || 0) + 'px';
    const rows = state.get('config.list.rows');
    for (const parentId of props.row._internal.parents) {
      const parent = rows[parentId];
      const childrenStyle = parent?.style?.grid?.cell?.children;
      if (childrenStyle) styleMap.setStyle({ ...styleMap.style, ...childrenStyle });
    }
    const currentStyle = props?.row?.style?.grid?.cell?.current;
    if (currentStyle) styleMap.setStyle({ ...styleMap.style, ...currentStyle });
    update();
  }
  onChange(onPropsChange);

  componentActions.push(BindElementAction);
  const actions = Actions.create(componentActions, actionProps);
  return templateProps => {
    return wrapper(
      html`
        <div detach=${detach} class=${className} data-actions=${actions} style=${styleMap}></div>
      `,
      { props, vido, templateProps }
    );
  };
};
export default ChartTimelineGridRowCell;
