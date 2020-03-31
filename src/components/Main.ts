/**
 * Main component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import ResizeObserver from 'resize-observer-polyfill';
import {
  ChartTime,
  DataChartTime,
  DataChartTimeLevel,
  ChartCalendar,
  DataChartTimeLevelDate,
  ChartCalendarLevel,
  ChartTimeDate,
  ChartTimeDates,
  ChartCalendarFormat,
  Row,
  ScrollTypeHorizontal,
  ScrollType,
  Rows
} from '../types';
import DeepState from 'deep-state-observer';
import { OpUnitType } from 'dayjs';
import { Api } from '../api/Api';
import { vido } from '@neuronet.io/vido';

export default function Main(vido: vido<DeepState, Api>, props = {}) {
  const { api, state, onDestroy, Actions, update, createComponent, html, StyleMap } = vido;
  const componentName = api.name;

  // Initialize plugins
  onDestroy(
    state.subscribe('config.plugins', plugins => {
      if (typeof plugins !== 'undefined' && Array.isArray(plugins)) {
        for (const initializePlugin of plugins) {
          const destroyPlugin = initializePlugin(vido);
          if (typeof destroyPlugin === 'function') {
            onDestroy(destroyPlugin);
          } else if (destroyPlugin && destroyPlugin.hasOwnProperty('destroy')) {
            destroyPlugin.destroy();
          }
        }
      }
    })
  );

  const componentSubs = [];
  let ListComponent;
  componentSubs.push(state.subscribe('config.components.List', value => (ListComponent = value)));
  let ChartComponent;
  componentSubs.push(state.subscribe('config.components.Chart', value => (ChartComponent = value)));

  const List = createComponent(ListComponent);
  onDestroy(List.destroy);
  const Chart = createComponent(ChartComponent);
  onDestroy(Chart.destroy);

  onDestroy(() => {
    componentSubs.forEach(unsub => unsub());
  });

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.Main', value => (wrapper = value)));

  const componentActions = api.getActions('main');
  let className;
  const styleMap = new StyleMap({});
  let rowsHeight = 0;
  let resizerActive = false;

  /**
   * Update class names
   * @param {object} classNames
   */
  const updateClassNames = classNames => {
    const config = state.get('config');
    className = api.getClass(componentName);
    if (resizerActive) {
      className += ` ${componentName}__list-column-header-resizer--active`;
    }
    update();
  };
  onDestroy(state.subscribe('config.classNames', updateClassNames));

  /**
   * Height change
   */
  function heightChange() {
    const config = state.get('config');
    const scrollBarHeight = state.get('config.scroll.horizontal.size');
    const height = config.height - config.headerHeight - scrollBarHeight;
    state.update('$data.innerHeight', height);
    styleMap.style['--height'] = config.height + 'px';
    update();
  }
  onDestroy(
    state.subscribeAll(['config.height', 'config.headerHeight', 'config.scroll.horizontal.size'], heightChange)
  );

  /**
   * Resizer active change
   * @param {boolean} active
   */
  function resizerActiveChange(active) {
    resizerActive = active;
    className = api.getClass(api.name);
    if (resizerActive) {
      className += ` ${api.name}__list-column-header-resizer--active`;
    }
    update();
  }
  onDestroy(state.subscribe('$data.list.columns.resizer.active', resizerActiveChange));

  /**
   * Generate tree
   * @param {object} bulk
   * @param {object} eventInfo
   */
  function generateTree(bulk, eventInfo) {
    if (state.get('$data.flatTreeMap').length && eventInfo.type === 'subscribe') {
      return;
    }
    const configRows = state.get('config.list.rows');
    const rows = [];
    for (const rowId in configRows) {
      rows.push(configRows[rowId]);
    }
    api.fillEmptyRowValues(rows);
    const configItems = state.get('config.chart.items');
    const items = [];
    for (const itemId in configItems) {
      items.push(configItems[itemId]);
    }
    api.prepareItems(items);
    const treeMap = api.makeTreeMap(rows, items);
    const flatTreeMapById = api.getFlatTreeMapById(treeMap);
    const flatTreeMap = api.flattenTreeMap(treeMap);
    state.update('$data', $data => {
      $data.treeMap = treeMap;
      $data.flatTreeMapById = flatTreeMapById;
      $data.flatTreeMap = flatTreeMap;
      return $data;
    });
    update();
  }

  onDestroy(state.subscribeAll(['config.list.rows;', 'config.chart.items;'], generateTree));
  onDestroy(
    state.subscribeAll(['config.list.rows.*.parentId', 'config.chart.items.*.rowId'], generateTree, { bulk: true })
  );

  function prepareExpanded() {
    const configRows: Rows = state.get('config.list.rows');
    const rowsWithParentsExpanded: Row[] = api.getRowsFromIds(
      api.getRowsWithParentsExpanded(state.get('$data.flatTreeMap'), state.get('$data.flatTreeMapById'), configRows),
      configRows
    );
    rowsHeight = api.recalculateRowsHeights(rowsWithParentsExpanded);
    state.update('$data.list', list => {
      list.rowsHeight = rowsHeight;
      list.rowsWithParentsExpanded = rowsWithParentsExpanded;
      return list;
    });
    update();
  }
  onDestroy(
    state.subscribeAll(
      ['config.list.rows.*.expanded', '$data.treeMap;', 'config.list.rows.*.height'],
      prepareExpanded,
      { bulk: true }
    )
  );

  function getLastPageRowsHeight(innerHeight: number, rowsWithParentsExpanded: Row[]): number {
    if (rowsWithParentsExpanded.length === 0) return 0;
    let currentHeight = 0;
    let count = 0;
    for (let i = rowsWithParentsExpanded.length - 1; i >= 0; i--) {
      const row = rowsWithParentsExpanded[i];
      currentHeight += row.$data.outerHeight;
      if (currentHeight >= innerHeight) {
        currentHeight = currentHeight - row.$data.outerHeight;
        break;
      }
      count++;
    }
    state.update('config.scroll.vertical.lastPageSize', currentHeight);
    state.update('config.scroll.vertical.lastPageCount', count);
    return currentHeight;
  }

  onDestroy(
    state.subscribeAll(['$data.list.rowsWithParentsExpanded;', '$data.innerHeight', '$data.list.rowsHeight'], () => {
      const rowsWithParentsExpanded = state.get('$data.list.rowsWithParentsExpanded');
      const rowsHeight = state.get('$data.list.rowsHeight');
      const innerHeight = state.get('$data.innerHeight');
      const lastPageHeight = getLastPageRowsHeight(innerHeight, rowsWithParentsExpanded);
      state.update('config.scroll.vertical.area', rowsHeight - lastPageHeight);
    })
  );

  /**
   * Generate visible rows
   */
  function generateVisibleRowsAndItems() {
    const visibleRows = api.getVisibleRows(state.get('$data.list.rowsWithParentsExpanded'));
    const currentVisibleRows = state.get('$data.list.visibleRows');
    let shouldUpdate = true;
    if (visibleRows.length !== currentVisibleRows.length) {
      shouldUpdate = true;
    } else if (visibleRows.length) {
      shouldUpdate = visibleRows.some((row, index) => {
        if (typeof currentVisibleRows[index] === 'undefined') {
          return true;
        }
        return row.id !== currentVisibleRows[index].id;
      });
    }
    if (shouldUpdate) {
      state.update('$data.list.visibleRows', visibleRows);
    }
    const visibleItems = [];
    for (const row of visibleRows) {
      for (const item of row.$data.items) {
        visibleItems.push(item);
      }
    }
    state.update('$data.chart.visibleItems', visibleItems);
    update();
  }
  onDestroy(
    state.subscribeAll(
      ['$data.list.rowsWithParentsExpanded;', 'config.scroll.vertical.data', 'config.chart.items'],
      generateVisibleRowsAndItems,
      { bulk: true }
    )
  );

  function getLastPageDatesWidth(chartWidth: number, allDates: DataChartTimeLevelDate[]): number {
    if (allDates.length === 0) return 0;
    let currentWidth = 0;
    let count = 0;
    for (let i = allDates.length - 1; i >= 0; i--) {
      const date = allDates[i];
      currentWidth += date.width;
      if (currentWidth >= chartWidth) {
        currentWidth = currentWidth - date.width;
        break;
      }
      count++;
    }
    state.update('config.scroll.horizontal', (horizontal: ScrollType) => {
      horizontal.lastPageSize = currentWidth;
      horizontal.lastPageCount = count;
      return horizontal;
    });
    return currentWidth;
  }

  const generatePeriodDates = (
    formatting: ChartCalendarFormat,
    time: DataChartTime,
    level: ChartCalendarLevel,
    levelIndex: number
  ): DataChartTimeLevel => {
    const period = formatting.period;
    let finalFrom = time.finalFrom;
    let leftDate = api.time.date(finalFrom).startOf(period);
    const rightDate = api.time.date(time.finalTo).endOf(period);
    const dates = api.time.generatePeriodDates({ leftDate, rightDate, level, levelIndex, period, time });
    const className = api.getClass('chart-calendar-date');
    for (const date of dates) {
      date.formatted = formatting.format({
        timeStart: date.leftGlobalDate,
        timeEnd: date.rightGlobalDate,
        vido,
        className,
        props: { date }
      });
    }
    return dates;
  };

  function triggerLoadedEvent() {
    if (state.get('$data.loadedEventTriggered')) return;
    Promise.resolve().then(() => {
      const element = state.get('$data.elements.main');
      const parent = element.parentNode;
      const event = new Event('gstc-loaded');
      element.dispatchEvent(event);
      parent.dispatchEvent(event);
    });
    state.update('$data.loadedEventTriggered', true);
  }

  function limitGlobalAndSetCenter(time: DataChartTime, updateCenter = true, oldTime: DataChartTime, reason) {
    if (time.leftGlobal < time.finalFrom) time.leftGlobal = time.finalFrom;
    if (time.rightGlobal > time.finalTo) time.rightGlobal = time.finalTo;
    time.leftGlobalDate = api.time.date(time.leftGlobal).startOf(time.period);
    time.leftGlobal = time.leftGlobalDate.valueOf();
    time.rightGlobalDate = api.time.date(time.rightGlobal).endOf(time.period);
    time.rightGlobal = time.rightGlobalDate.valueOf();
    if (updateCenter) {
      const diffPeriod = Math.floor(time.rightGlobalDate.diff(time.leftGlobalDate, time.period, true) / 2);
      let amount = 0,
        period = 'day';
      switch (time.period) {
        case 'year':
          amount = 6;
          period = 'month';
          break;
        case 'month':
          amount = 15;
          period = 'day';
          break;
        case 'week':
          amount = 3;
          period = 'day';
          break;
        case 'day':
          amount = 12;
          period = 'hour';
          break;
        case 'hour':
          amount = 30;
          period = 'minute';
          break;
      }
      time.centerGlobalDate = time.leftGlobalDate.add(diffPeriod, time.period).add(amount, period as OpUnitType);
      time.centerGlobal = time.centerGlobalDate.valueOf();
    } else {
      time.centerGlobal = oldTime.centerGlobal;
      time.centerGlobalDate = oldTime.centerGlobalDate;
    }
    return time;
  }

  function guessPeriod(time: DataChartTime, levels: ChartCalendarLevel[]) {
    if (!time.zoom) return time;
    for (const level of levels) {
      const formatting = level.formats.find(format => +time.zoom <= +format.zoomTo);
      if (formatting && level.main) {
        time.period = formatting.period;
      }
    }
    return time;
  }

  function calculateDatesPercents(allMainDates: DataChartTimeLevelDate[], chartWidth: number): number {
    const lastPageWidth = getLastPageDatesWidth(chartWidth, allMainDates);
    let totalWidth = 0;
    for (const date of allMainDates) {
      totalWidth += date.width;
    }
    const scrollWidth = totalWidth - lastPageWidth;
    for (const date of allMainDates) {
      date.leftPercent = date.leftPx / scrollWidth;
      date.rightPercent = date.rightPx / scrollWidth;
    }
    return scrollWidth;
  }

  function generateAllDates(time: DataChartTime, levels: ChartCalendarLevel[], chartWidth: number): number {
    if (!time.zoom) return 0;
    time.allDates = new Array(levels.length);

    // first of all we need to generate main dates because plugins may use it (HideWeekends for example)
    const mainLevel = levels[time.level];
    const formatting = mainLevel.formats.find(format => +time.zoom <= +format.zoomTo);
    time.allDates[time.level] = generatePeriodDates(formatting, time, mainLevel, time.level);

    let levelIndex = 0;
    for (const level of levels) {
      if (!level.main) {
        const formatting = level.formats.find(format => +time.zoom <= +format.zoomTo);
        time.allDates[levelIndex] = generatePeriodDates(formatting, time, level, levelIndex);
      }
      levelIndex++;
    }
    return calculateDatesPercents(time.allDates[time.level], chartWidth);
  }

  function getPeriodDates(allLevelDates: ChartTimeDates, time: DataChartTime): ChartTimeDate[] {
    if (!allLevelDates.length) return [];
    const filtered = allLevelDates.filter(date => {
      return (
        (date.leftGlobal >= time.leftGlobal && date.leftGlobal <= time.rightGlobal) ||
        (date.rightGlobal >= time.leftGlobal && date.rightGlobal <= time.rightGlobal) ||
        (date.leftGlobal <= time.leftGlobal && date.rightGlobal >= time.rightGlobal) ||
        (date.leftGlobal >= time.leftGlobal && date.rightGlobal <= time.rightGlobal)
      );
    });
    if (!filtered.length) return [];
    let firstLeftDiff = 0;
    if (filtered[0].period !== time.period && time.leftGlobal > filtered[0].leftGlobal) {
      firstLeftDiff = api.time.getDatesDiffPx(time.leftGlobalDate, filtered[0].leftGlobalDate, time);
    }

    let leftPx = 0;
    return filtered.map(date => {
      date.currentView = {
        leftPx,
        rightPx: date.rightPx,
        width: date.width
      };
      if (firstLeftDiff < 0) {
        date.currentView.width = date.width + firstLeftDiff;
        date.currentView.leftPx = 0;
        firstLeftDiff = 0;
      }
      date.currentView.rightPx = date.currentView.leftPx + date.currentView.width;
      leftPx += date.currentView.width;
      return date;
    });
  }

  function updateLevels(time: DataChartTime, levels: ChartCalendarLevel[]) {
    time.levels = [];
    let levelIndex = 0;
    for (const level of levels) {
      const format = level.formats.find(format => +time.zoom <= +format.zoomTo);
      if (level.main) {
        time.format = format;
        time.level = levelIndex;
      }
      if (format) {
        let dates = getPeriodDates(time.allDates[levelIndex], time);
        time.onCurrentViewLevelDates.forEach(onCurrentViewLevelDates => {
          dates = onCurrentViewLevelDates({ dates, format, time, level, levelIndex });
        });
        time.levels.push(dates);
      }
      levelIndex++;
    }
  }

  function calculateTotalViewDuration(time: DataChartTime) {
    let width = 0;
    let ms = 0;
    for (const date of time.allDates[time.level]) {
      width += date.width;
      ms += date.rightGlobal - date.leftGlobal;
    }
    time.totalViewDurationPx = width;
    time.totalViewDurationMs = ms;
  }

  function calculateRightGlobal(
    leftGlobal: number,
    chartWidth: number,
    allMainDates: DataChartTimeLevelDate[]
  ): number {
    const date = api.time.findDateAtTime(leftGlobal, allMainDates);
    let index = allMainDates.indexOf(date);
    let rightGlobal = date.leftGlobal;
    let width = 0;
    for (let len = allMainDates.length; index < len; index++) {
      const currentDate = allMainDates[index];
      rightGlobal = currentDate.leftGlobal;
      width += currentDate.width;
      if (width >= chartWidth) break;
    }
    return rightGlobal;
  }

  let timeLoadedEventFired = false;
  function recalculateTimes(reason) {
    const chartWidth: number = state.get('$data.chart.dimensions.width');
    if (!chartWidth) return;
    const configTime: ChartTime = state.get('config.chart.time');
    const calendar: ChartCalendar = state.get('config.chart.calendar');
    const oldTime = { ...state.get('$data.chart.time') };
    let time: DataChartTime = api.mergeDeep({}, configTime);
    if ((!time.from || !time.to) && !Object.keys(state.get('config.chart.items')).length) {
      return;
    }
    time.fromDate = api.time.date(time.from);
    time.toDate = api.time.date(time.to);

    const mainLevel = calendar.levels.find(level => level.main);
    if (!mainLevel) {
      throw new Error('Main calendar level not found (config.chart.calendar.levels).');
    }
    const mainLevelIndex = calendar.levels.indexOf(mainLevel);
    time.level = mainLevelIndex;

    if (!time.calculatedZoomMode) {
      if (time.period !== oldTime.period) {
        let periodFormat = mainLevel.formats.find(format => format.period === time.period && format.default);
        if (periodFormat) {
          time.zoom = periodFormat.zoomTo;
        }
      }
      guessPeriod(time, calendar.levels);
    }

    // If $data.chart.time (leftGlobal, centerGlobal, rightGlobal, from , to) was changed
    // then we need to apply those values - no recalculation is needed (values form plugins etc)

    const justApply = ['leftGlobal', 'centerGlobal', 'rightGlobal', 'from', 'to'].includes(reason.name);
    if (justApply) {
      time = {
        ...time,
        leftGlobal: configTime.leftGlobal,
        leftGlobalDate: api.time.date(configTime.leftGlobal),
        centerGlobal: configTime.centerGlobal,
        centerGlobalDate: api.time.date(configTime.centerGlobal),
        rightGlobal: configTime.rightGlobal,
        rightGlobalDate: api.time.date(configTime.rightGlobal),
        from: configTime.from,
        fromDate: api.time.date(configTime.from),
        to: configTime.to,
        toDate: api.time.date(configTime.to)
      };
    }

    let horizontalScroll: ScrollTypeHorizontal = state.get('config.scroll.horizontal');
    let scrollWidth = 0;

    // source of everything = time.timePerPixel
    if (time.calculatedZoomMode && chartWidth) {
      time.finalFrom = time.from;
      time.finalTo = time.to;
      time.totalViewDurationMs = api.time.date(time.finalTo).diff(time.finalFrom, 'millisecond');
      time.timePerPixel = time.totalViewDurationMs / chartWidth;
      time.zoom = Math.log(time.timePerPixel) / Math.log(2);
      guessPeriod(time, calendar.levels);
      if (oldTime.zoom !== time.zoom || time.allDates.length === 0 || reason.name === 'forceUpdate') {
        scrollWidth = generateAllDates(time, calendar.levels, chartWidth);
        calculateTotalViewDuration(time);
        const all = time.allDates[time.level];
        time.finalTo = all[all.length - 1].leftGlobal;
      }
      time.leftGlobal = time.from;
      time.leftGlobalDate = api.time.date(time.leftGlobal);
      time.rightGlobal = time.to;
      time.rightGlobalDate = api.time.date(time.rightGlobal);
    } else {
      time.timePerPixel = Math.pow(2, time.zoom);
      time = api.time.recalculateFromTo(time);
      if (oldTime.zoom !== time.zoom || time.allDates.length === 0 || reason.name === 'forceUpdate') {
        scrollWidth = generateAllDates(time, calendar.levels, chartWidth);
        calculateTotalViewDuration(time);
        const all = time.allDates[time.level];
        time.finalTo = all[all.length - 1].leftGlobal;
      } else {
        time.totalViewDurationPx = oldTime.totalViewDurationPx;
        time.totalViewDurationMs = oldTime.totalViewDurationMs;
      }
    }

    if (scrollWidth) {
      time.scrollWidth = scrollWidth;
    } else {
      time.scrollWidth = oldTime.scrollWidth;
    }

    time.finalFromDate = api.time.date(time.finalFrom);
    time.finalToDate = api.time.date(time.finalTo);

    const allMainDates = time.allDates[mainLevelIndex];

    let updateCenter = false;

    if (!justApply && !time.calculatedZoomMode) {
      // If time.zoom (or time.period) has been changed
      // then we need to recalculate basing on time.centerGlobal
      // and update scroll left
      // if not then we need to calculate from scroll left
      // because change was triggered by scroll

      if ((time.zoom !== oldTime.zoom || reason.name === 'period') && oldTime.centerGlobal) {
        const chartWidthInMs = chartWidth * time.timePerPixel;
        const halfChartInMs = Math.round(chartWidthInMs / 2);
        const diff = Math.ceil(oldTime.centerGlobalDate.diff(oldTime.centerGlobal + halfChartInMs, time.period, true));
        time.leftGlobalDate = oldTime.centerGlobalDate.add(diff, time.period);
        const milliseconds = time.leftGlobalDate.valueOf();
        let date = api.time.findDateAtTime(milliseconds, allMainDates);
        if (!date) date = allMainDates[0];
        time.leftGlobal = date.leftGlobal;
        time.leftGlobalDate = date.leftGlobalDate;
        time.rightGlobal = calculateRightGlobal(time.leftGlobal, chartWidth, allMainDates);
        time.rightGlobalDate = api.time.date(time.rightGlobal).endOf(time.period);
        time.rightGlobal = time.rightGlobalDate.valueOf();
      } else {
        let date = horizontalScroll.data;
        if (!date) {
          date = allMainDates[0];
        }
        time.leftGlobalDate = date.leftGlobalDate;
        time.leftGlobal = time.leftGlobalDate.valueOf();
        time.rightGlobal = calculateRightGlobal(time.leftGlobal, chartWidth, allMainDates);
        time.rightGlobalDate = api.time.date(time.rightGlobal).endOf(time.period);
        time.rightGlobal = time.rightGlobal.valueOf();
        updateCenter = reason.name === 'scroll';
      }
    }

    limitGlobalAndSetCenter(time, updateCenter, oldTime, reason);

    time.leftInner = time.leftGlobal - time.finalFrom;
    time.rightInner = time.rightGlobal - time.finalFrom;
    time.leftPx = 0;
    time.rightPx = chartWidth;
    time.width = chartWidth;
    const mainLevelDates = time.levels[time.level];
    if (mainLevelDates && mainLevelDates.length) {
      time.leftPx = mainLevelDates[0].leftPx;
      time.rightPx = mainLevelDates[mainLevelDates.length - 1].leftPx;
    }

    updateLevels(time, calendar.levels);

    state.update(`$data.chart.time`, time);
    state.update('config.chart.time', configTime => {
      configTime.zoom = time.zoom;
      configTime.period = time.format.period;
      configTime.leftGlobal = time.leftGlobal;
      configTime.centerGlobal = time.centerGlobal;
      configTime.rightGlobal = time.rightGlobal;
      configTime.from = time.from;
      configTime.to = time.to;
      configTime.finalFrom = time.finalFrom;
      configTime.finalTo = time.finalTo;
      configTime.allDates = time.allDates;
      return configTime;
    });
    update().then(() => {
      if (!timeLoadedEventFired) {
        state.update('$data.loaded.time', true);
        timeLoadedEventFired = true;
      }
    });
  }

  const recalculationTriggerCache = {
    initialized: false,
    zoom: 0,
    period: '',
    scrollDataIndex: 0,
    chartWidth: 0,
    from: 0,
    to: 0
  };
  function recalculationIsNeeded() {
    const configTime = state.get('config.chart.time');
    const dataIndex = state.get('config.scroll.horizontal.dataIndex');
    const chartWidth = state.get('$data.chart.dimensions.width');
    const cache = { ...recalculationTriggerCache };
    recalculationTriggerCache.zoom = configTime.zoom;
    recalculationTriggerCache.period = configTime.period;
    recalculationTriggerCache.from = configTime.from;
    recalculationTriggerCache.to = configTime.to;
    recalculationTriggerCache.scrollDataIndex = dataIndex;
    recalculationTriggerCache.chartWidth = chartWidth;
    if (!recalculationTriggerCache.initialized) {
      recalculationTriggerCache.initialized = true;
      return { name: 'all' };
    }
    if (configTime.forceUpdate === true) {
      // prevent infinite loop because recalculate will not update this value while other things were changed
      state.update('config.chart.time.forceUpdate', false);
      return { name: 'forceUpdate' };
    }
    if (configTime.zoom !== cache.zoom) return { name: 'zoom', oldValue: cache.zoom, newValue: configTime.zoom };
    if (configTime.period !== cache.period)
      return { name: 'period', oldValue: cache.period, newValue: configTime.period };
    if (configTime.from !== cache.from) return { name: 'from', oldValue: cache.from, newValue: configTime.from };
    if (configTime.to !== cache.to) return { name: 'to', oldValue: cache.to, newValue: configTime.to };
    if (dataIndex !== cache.scrollDataIndex)
      return { name: 'scroll', oldValue: cache.scrollDataIndex, newValue: dataIndex };
    if (chartWidth !== cache.chartWidth)
      return { name: 'chartWidth', oldValue: cache.chartWidth, newValue: chartWidth };
    return false;
  }

  onDestroy(
    state.subscribeAll(
      [
        'config.chart.time',
        'config.chart.calendar.levels',
        'config.scroll.horizontal.dataIndex',
        '$data.chart.dimensions.width'
      ],
      () => {
        let reason = recalculationIsNeeded();
        if (reason) recalculateTimes(reason);
      },
      { bulk: true }
    )
  );

  onDestroy(
    state.subscribe(
      'config.chart.items.*.time',
      items => {
        recalculateTimes({ name: 'items' });
      },
      { bulk: true }
    )
  );

  try {
    const ignoreHosts = [
      'stackblitz.io',
      'codepen.io',
      'cdpn.io',
      'codesandbox.io',
      'csb.app',
      'jsrun.pro',
      'jsrun.top',
      'jsfiddle.net',
      'jsbin.com'
    ];
    let loc = location.host;
    const locParts = loc.split('.');
    if (locParts.length > 2) {
      for (let i = 0, len = locParts.length - 2; i < len; i++) {
        locParts.shift();
      }
      loc = locParts.join('.');
    }
    const startsWith = ['192.', '127.', 'test', 'demo', 'local'];
    const endsWith = ['test', 'local', 'demo'];
    function startsEnds() {
      for (let i = 0, len = startsWith.length; i < len; i++) {
        if (location.hostname.startsWith(startsWith[i])) return true;
      }
      for (let i = 0, len = endsWith.length; i < len; i++) {
        if (location.hostname.endsWith(endsWith[i])) return true;
      }
      return false;
    }
    function shouldSend(): boolean {
      return !ignoreHosts.includes(loc) && location.hostname !== 'localhost' && !startsEnds();
    }
    if (state.get('config.usageStatistics') === true && !localStorage.getItem('gstcus') && shouldSend()) {
      fetch('https://gstc-us.neuronet.io/', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        body: JSON.stringify({ location: { href: location.href, host: location.host } })
      }).catch(e => {});
      localStorage.setItem('gstcus', 'true');
    }
  } catch (e) {}

  const dimensions = { width: 0, height: 0 };
  let ro;
  /**
   * Resize action
   * @param {Element} element
   */
  class ResizeAction {
    constructor(element: HTMLElement) {
      if (!ro) {
        ro = new ResizeObserver((entries, observer) => {
          const width = element.clientWidth;
          const height = element.clientHeight;
          if (dimensions.width !== width || dimensions.height !== height) {
            dimensions.width = width;
            dimensions.height = height;
            state.update('$data.dimensions', dimensions);
          }
        });
        ro.observe(element);
        state.update('$data.elements.main', element);
      }
    }
    public update() {}
    public destroy(element) {
      ro.unobserve(element);
    }
  }
  if (!componentActions.includes(ResizeAction)) {
    componentActions.push(ResizeAction);
  }

  onDestroy(() => {
    ro.disconnect();
  });

  onDestroy(
    state.subscribeAll(['$data.loaded', '$data.chart.time.totalViewDurationPx'], () => {
      if (state.get('$data.loadedEventTriggered')) return;
      const loaded = state.get('$data.loaded');
      if (loaded.main && loaded.chart && loaded.time && loaded['horizontal-scroll-inner']) {
        const scroll = state.get('$data.elements.horizontal-scroll-inner');
        const width = state.get('$data.chart.time.totalViewDurationPx');
        if (scroll && scroll.clientWidth === Math.round(width)) {
          setTimeout(triggerLoadedEvent, 0);
        }
      }
    })
  );

  function onWheel(ev) {}

  function LoadedEventAction() {
    state.update('$data.loaded.main', true);
  }
  if (!componentActions.includes(LoadedEventAction)) componentActions.push(LoadedEventAction);

  const actionProps = { ...props, api, state };
  const mainActions = Actions.create(componentActions, actionProps);

  return templateProps =>
    wrapper(
      html`
        <div
          data-info-url="https://github.com/neuronetio/gantt-schedule-timeline-calendar"
          class=${className}
          style=${styleMap}
          data-actions=${mainActions}
          @wheel=${onWheel}
        >
          ${List.html()}${Chart.html()}
        </div>
      `,
      { props, vido, templateProps }
    );
}
