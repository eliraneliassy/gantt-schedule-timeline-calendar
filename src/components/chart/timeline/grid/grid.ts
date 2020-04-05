/**
 * ChartTimelineGrid component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Cell, RowWithCells, Vido } from '@src/gstc';

/**
 * Bind element action
 */
class BindElementAction {
  constructor(element: HTMLElement, data) {
    const old = data.state.get('$data.elements.chart-timeline-grid');
    if (old !== element) data.state.update('$data.elements.chart-timeline-grid', element);
  }
  public destroy(element, data) {
    data.state.update('$data.elements', (elements) => {
      delete elements['chart-timeline-grid'];
      return elements;
    });
  }
}

export default function ChartTimelineGrid(vido: Vido, props) {
  const { api, state, onDestroy, Actions, update, html, reuseComponents, StyleMap } = vido;
  const componentName = 'chart-timeline-grid';
  const componentActions = api.getActions(componentName);
  const actionProps = { api, state };

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimelineGrid', (value) => (wrapper = value)));

  const GridRowComponent = state.get('config.components.ChartTimelineGridRow');

  let className;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      update();
    })
  );

  let onCellCreate;
  onDestroy(state.subscribe('config.chart.grid.cell.onCreate', (onCreate) => (onCellCreate = onCreate)));

  const rowsComponents = [];
  const rowsWithCells: RowWithCells[] = [];
  const formatCache = new Map();
  const styleMap = new StyleMap({});

  /**
   * Generate cells
   */
  function generateCells() {
    const width = state.get('$data.chart.dimensions.width');
    const height = state.get('$data.innerHeight');
    const time = state.get('$data.chart.time');
    const periodDates = state.get(`$data.chart.time.levels.${time.level}`);
    if (!periodDates || periodDates.length === 0) {
      state.update('$data.chart.grid.rowsWithCells', []);
      return;
    }
    const visibleRows = state.get('$data.list.visibleRows');
    styleMap.style.height = height + 'px';
    styleMap.style.width = width + 'px';
    let top = 0;
    rowsWithCells.length = 0;
    for (const row of visibleRows) {
      const cells: Cell[] = [];
      for (const time of periodDates) {
        let format;
        if (formatCache.has(time.leftGlobal)) {
          format = formatCache.get(time.leftGlobal);
        } else {
          format = api.time.date(time.leftGlobal).format('YYYY-MM-DD HH:mm');
          formatCache.set(time.leftGlobal, format);
        }
        const id = row.id + ':' + format;
        let cell: Cell = { id, time, row, top };
        for (const onCreate of onCellCreate) {
          cell = onCreate(cell);
        }
        cells.push(cell);
      }
      rowsWithCells.push({ row, cells, top, width });
      top += row.height;
    }
    state.update('$data.chart.grid.rowsWithCells', rowsWithCells);
  }
  onDestroy(
    state.subscribeAll(
      ['$data.list.visibleRows;', `$data.chart.time.levels`, '$data.innerHeight', '$data.chart.dimensions.width'],
      generateCells,
      {
        bulk: true,
      }
    )
  );

  /**
   * Generate rows components
   * @param {array} rowsWithCells
   */
  function generateRowsComponents(rowsWithCells: RowWithCells[]) {
    reuseComponents(rowsComponents, rowsWithCells || [], (row) => row, GridRowComponent);
    update();
  }
  onDestroy(state.subscribe('$data.chart.grid.rowsWithCells', generateRowsComponents));
  onDestroy(() => {
    rowsComponents.forEach((row) => row.destroy());
  });
  componentActions.push(BindElementAction);

  const actions = Actions.create(componentActions, actionProps);
  return (templateProps) =>
    wrapper(
      html`
        <div class=${className} data-actions=${actions} style=${styleMap}>
          ${rowsComponents.map((r) => r.html())}
        </div>
      `,
      { props, vido, templateProps }
    );
}
