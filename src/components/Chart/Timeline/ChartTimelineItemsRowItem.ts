/**
 * ChartTimelineItemsRowItem component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Row, Item, Vido } from '../../../types';

/**
 * Bind element action
 */
class BindElementAction {
  constructor(element, data) {
    let shouldUpdate = false;
    let items = data.state.get('$data.elements.chart-timeline-items-row-items');
    if (typeof items === 'undefined') {
      items = [];
      shouldUpdate = true;
    }
    if (!items.includes(element)) {
      items.push(element);
      shouldUpdate = true;
    }
    if (shouldUpdate) data.state.update('$data.elements.chart-timeline-items-row-items', items, { only: null });
  }
  public destroy(element, data) {
    data.state.update('$data.elements.chart-timeline-items-row-items', items => {
      return items.filter(el => el !== element);
    });
  }
}

export interface Props {
  row: Row;
  item: Item;
}

export default function ChartTimelineItemsRowItem(vido: Vido, props: Props) {
  const { api, state, onDestroy, Detach, Actions, update, html, svg, onChange, unsafeHTML, StyleMap } = vido;

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimelineItemsRowItem', value => (wrapper = value)));

  let itemLeftPx = 0,
    itemWidthPx = 0,
    leave = false,
    classNameCurrent = '';
  const styleMap = new StyleMap({ width: '', height: '', left: '', top: '' }),
    leftCutStyleMap = new StyleMap({}),
    rightCutStyleMap = new StyleMap({}),
    actionProps = {
      item: props.item,
      row: props.row,
      left: itemLeftPx,
      width: itemWidthPx,
      api,
      state
    };
  let shouldDetach = false;

  function updateItem(time = state.get('$data.chart.time')) {
    if (leave || time.levels.length === 0 || !time.levels[time.level] || time.levels[time.level].length === 0) {
      shouldDetach = true;
      return;
    }
    itemLeftPx = props.item.$data.position.left;
    itemWidthPx = props.item.$data.width;
    if (itemWidthPx <= 0) {
      shouldDetach = true;
      return;
    }
    classNameCurrent = className;
    if (props.item.time.start < time.leftGlobal) {
      leftCutStyleMap.style.display = 'block';
      classNameCurrent += ' ' + className + '--left-cut';
    } else {
      leftCutStyleMap.style.display = 'none';
    }
    if (props.item.time.end > time.rightGlobal) {
      rightCutStyleMap.style.display = 'block';
      classNameCurrent += ' ' + className + '--right-cut';
    } else {
      rightCutStyleMap.style.display = 'none';
    }
    if (props.item.classNames && props.item.classNames.length) {
      classNameCurrent += ' ' + props.item.classNames.join(' ');
    }
    if (props.item.selected) {
      classNameCurrent += ' ' + api.getClass(componentName) + '--selected';
    }
    const oldWidth = styleMap.style.width;
    const oldLeft = styleMap.style.left;
    const oldTop = styleMap.style.top;
    const oldHeight = styleMap.style.height;
    styleMap.setStyle({});
    const inViewPort = api.isItemInViewport(props.item, time.leftGlobal, time.rightGlobal);
    shouldDetach = !inViewPort;
    if (inViewPort) {
      // update style only when visible to prevent browser's recalculate style
      styleMap.style.width = itemWidthPx + 'px';
      styleMap.style.left = itemLeftPx + 'px';
      styleMap.style.top = props.item.gap.top + props.item.top + 'px';
      styleMap.style.height = props.item.$data.actualHeight + 'px';
    } else {
      styleMap.style.width = oldWidth;
      styleMap.style.left = oldLeft;
      styleMap.style.top = oldTop;
      styleMap.style.height = oldHeight;
    }
    const rows = state.get('config.list.rows');
    for (const parentId of props.row.$data.parents) {
      const parent = rows[parentId];
      const childrenStyle = parent?.style?.items?.item?.children;
      if (childrenStyle) styleMap.setStyle({ ...styleMap.style, ...childrenStyle });
    }
    const currentRowItemsStyle = props?.row?.style?.items?.item?.current;
    if (currentRowItemsStyle) styleMap.setStyle({ ...styleMap.style, ...currentRowItemsStyle });
    const currentStyle = props?.item?.style;
    if (currentStyle) styleMap.setStyle({ ...styleMap.style, ...currentStyle });
    actionProps.left = itemLeftPx;
    actionProps.width = itemWidthPx;
    update();
  }

  const componentName = 'chart-timeline-items-row-item';
  const cutterName = api.getClass(componentName) + '-cut';
  const cutterLeft = () => html`
    <div class=${cutterName} style=${leftCutStyleMap}>
      ${svg`<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 18 16" width="16">
        <path fill-opacity="0.5" fill="#ffffff" d="m5,3l-5,5l5,5l0,-10z" />
      </svg>`}
    </div>
  `;
  const cutterRight = () => html`
    <div class=${cutterName} style=${rightCutStyleMap}>
      ${svg`<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 4 16" width="16">
        <path transform="rotate(-180 2.5,8) " fill-opacity="0.5" fill="#ffffff" d="m5,3l-5,5l5,5l0,-10z" />
      </svg>`}
    </div>
  `;
  function onPropsChange(changedProps, options) {
    if (options.leave || changedProps.row === undefined || changedProps.item === undefined) {
      leave = true;
      shouldDetach = true;
      return update();
    } else {
      shouldDetach = false;
      leave = false;
    }
    props = changedProps;
    actionProps.item = props.item;
    actionProps.row = props.row;
    updateItem();
  }
  onChange(onPropsChange);

  const componentActions = api.getActions(componentName);
  let className, labelClassName;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      labelClassName = api.getClass(componentName + '-label');
      update();
    })
  );

  onDestroy(state.subscribe('$data.chart.time', updateItem));

  componentActions.push(BindElementAction);
  const actions = Actions.create(componentActions, actionProps);
  const detach = new Detach(() => shouldDetach);

  return templateProps => {
    return wrapper(
      html`
        <div detach=${detach} class=${classNameCurrent} data-actions=${actions} style=${styleMap}>
          ${cutterLeft()}
          <div class=${labelClassName} title=${props.item.isHTML ? null : props.item.label}>
            ${props.item.isHTML ? unsafeHTML(props.item.label) : props.item.label}
          </div>
          ${cutterRight()}
        </div>
      `,
      { vido, props, templateProps }
    );
  };
}
