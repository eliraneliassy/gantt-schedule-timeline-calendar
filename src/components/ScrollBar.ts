/**
 * ScrollBar component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import Action from '@neuronet.io/vido/Action';
import { ChartInternalTimeLevelDate, ScrollTypeHorizontal, ScrollTypeVertical, ScrollType } from '../types';

export default function ScrollBar(vido, props) {
  const { onDestroy, state, api, html, StyleMap, Actions, update, schedule } = vido;

  const componentName = 'scroll-bar';

  let className, classNameInner;
  let classNameOuterActive = '',
    classNameInnerActive = '';

  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      classNameInner = api.getClass(componentName + '-inner');
    })
  );

  let size;
  const sizeProp = props.type === 'horizontal' ? 'height' : 'width';
  const invSizeProp = sizeProp === 'height' ? 'width' : 'height';
  const offsetProp = props.type === 'horizontal' ? 'left' : 'top';
  const styleMapOuter = new StyleMap({});
  const styleMapInner = new StyleMap({});
  let maxPos = 0;
  let allDates = [];
  let rows = [];
  let rowsOffsets = [];
  let rowsPercents = [];
  let innerSize = 0,
    invSize = 0,
    invSizeInner = 0,
    sub = 0;

  function generateRowsOffsets() {
    const len = rows.length;
    rowsOffsets = [];
    rowsPercents = [];
    if (!len) return;
    let top = 0;
    for (let i = 0; i < len; i++) {
      const row = rows[i];
      rowsOffsets.push(top);
      top += row.outerHeight;
    }
    const verticalHeight = state.get('config.scroll.vertical.area');
    for (const offsetTop of rowsOffsets) {
      rowsPercents.push(offsetTop / verticalHeight);
    }
  }

  function getFullSize(): number {
    let fullSize = 0;
    if (props.type === 'vertical') {
      if (rowsOffsets.length) {
        return rowsOffsets[rowsOffsets.length - 1] + rows[rows.length - 1].height;
      }
      return fullSize;
    }
    if (allDates.length) {
      return allDates[allDates.length - 1].rightPx;
    }
    return fullSize;
  }

  function setScrollLeft(dataIndex: number | undefined, queue = false) {
    if (dataIndex === undefined) {
      dataIndex = 0;
    }
    const date: ChartInternalTimeLevelDate = allDates[dataIndex];
    if (!date) return;
    const horizontal: ScrollTypeHorizontal = state.get('config.scroll.horizontal');
    if (horizontal.data && horizontal.data.leftGlobal === date.leftGlobal) return;
    state.update(
      'config.scroll.horizontal',
      (scrollHorizontal: ScrollTypeHorizontal) => {
        scrollHorizontal.data = date;
        const time = state.get('_internal.chart.time');
        scrollHorizontal.posPx = api.time.calculateScrollPosPxFromTime(
          scrollHorizontal.data.leftGlobal,
          time,
          scrollHorizontal
        );
        scrollHorizontal.dataIndex = dataIndex;
        return scrollHorizontal;
      },
      { queue: true }
    );
  }

  function setScrollTop(dataIndex: number | undefined) {
    if (dataIndex === undefined) {
      dataIndex = 0;
    }
    const vertical: ScrollTypeVertical = state.get('config.scroll.vertical');
    if (!rows[dataIndex]) {
      console.error(`no row ${dataIndex}`, rows);
      return;
    }
    if (vertical.data && vertical.data.id === rows[dataIndex].id) return;
    state.update('config.scroll.vertical', (scrollVertical: ScrollTypeVertical) => {
      scrollVertical.data = rows[dataIndex];
      scrollVertical.posPx = rowsPercents[dataIndex] * (scrollVertical.maxPosPx - scrollVertical.innerSize);
      scrollVertical.dataIndex = dataIndex;
      return scrollVertical;
    });
  }

  if (props.type === 'horizontal') {
    let lastDataIndex = 0;
    onDestroy(
      state.subscribe(
        '_internal.chart.time',
        () => {
          const time = state.get('_internal.chart.time');
          if (!time.leftGlobalDate) return;
          const horizontal = state.get('config.scroll.horizontal');
          if (horizontal.area !== time.scrollWidth) {
            state.update('config.scroll.horizontal.area', time.scrollWidth);
          }
          if (time.allDates && time.allDates[time.level]) {
            const dates = time.allDates[time.level];
            const date = dates.find(date => date.leftGlobal === time.leftGlobal);
            let dataIndex = dates.indexOf(date);
            const lastPageCount = state.get('config.scroll.horizontal.lastPageCount');
            if (dataIndex > dates.length - lastPageCount) {
              dataIndex = dates.length - lastPageCount;
            }
            if (dataIndex !== lastDataIndex) {
              setScrollLeft(dataIndex);
            }
            lastDataIndex = dataIndex;
          }
        },
        { queue: true }
      )
    );
  }

  const cache = {
    maxPosPx: 0,
    innerSize: 0,
    sub: 0,
    scrollArea: 0
  };
  function shouldUpdate(maxPosPx, innerSize, sub, scrollArea) {
    return (
      cache.maxPosPx !== maxPosPx ||
      cache.innerSize !== innerSize ||
      cache.sub !== sub ||
      cache.scrollArea !== scrollArea
    );
  }

  let working = false;
  onDestroy(
    state.subscribeAll(
      props.type === 'horizontal'
        ? [`config.scroll.${props.type}`, '_internal.chart.time']
        : [`config.scroll.${props.type}`, '_internal.innerHeight', '_internal.list.rowsWithParentsExpanded'],
      () => {
        if (working) return;
        working = true;
        const time = state.get('_internal.chart.time');
        const scroll = state.get(`config.scroll.${props.type}`);
        const chartWidth = state.get('_internal.chart.dimensions.width');
        const chartHeight = state.get('_internal.innerHeight');
        size = scroll.size;
        invSize = props.type === 'horizontal' ? chartWidth : chartHeight;
        invSize = invSize || 0;
        if (props.type === 'horizontal') {
          invSize -= size;
        } else {
          invSize += size;
        }
        if (invSize < 0) invSize = 0;
        styleMapOuter.style[sizeProp] = size + 'px';
        styleMapOuter.style[invSizeProp] = invSize + 'px';
        if (props.type === 'vertical') {
          styleMapOuter.style.top = state.get('config.headerHeight') + 'px';
        }
        styleMapInner.style[sizeProp] = '100%';
        invSizeInner = invSize;
        if (props.type === 'horizontal') {
          if (time.allDates && time.allDates[time.level]) {
            allDates = time.allDates[time.level];
          } else {
            allDates = [];
          }
        } else {
          const rowsWithParentsExpanded = state.get('_internal.list.rowsWithParentsExpanded');
          if (rowsWithParentsExpanded) {
            rows = rowsWithParentsExpanded;
          } else {
            rows = [];
          }
          if (rows.length) {
            generateRowsOffsets();
          } else {
            rowsOffsets = [];
          }
        }

        const fullSize = getFullSize();
        sub = 0;
        if (fullSize <= invSizeInner || scroll.lastPageSize === fullSize) {
          invSizeInner = 0;
          innerSize = 0;
        } else {
          if (invSize && fullSize) {
            innerSize = invSize * (invSize / fullSize);
          } else {
            innerSize = 0;
            invSizeInner = 0;
          }
          if (innerSize < scroll.minInnerSize) {
            sub = scroll.minInnerSize - innerSize;
            innerSize = scroll.minInnerSize;
          }
        }

        styleMapInner.style[invSizeProp] = innerSize + 'px';
        maxPos = Math.round(invSize - sub);
        if (shouldUpdate(maxPos, innerSize, sub, invSize)) {
          cache.maxPosPx = maxPos;
          cache.innerSize = innerSize;
          cache.sub = sub;
          cache.scrollArea = invSize;
          state.update(`config.scroll.${props.type}`, (scroll: ScrollType) => {
            scroll.maxPosPx = maxPos;
            scroll.innerSize = innerSize;
            scroll.sub = sub;
            scroll.scrollArea = invSize;
            return scroll;
          });
        }
        update();
        working = false;
      },
      { queue: true }
    )
  );

  let oldPos = 0;
  onDestroy(
    state.subscribe(`config.scroll.${props.type}.posPx`, position => {
      if (position !== oldPos) {
        styleMapInner.style[offsetProp] = position + 'px';
        update();
        oldPos = position;
      }
    })
  );

  class OuterAction extends Action {
    constructor(element) {
      super();
      state.update(`_internal.elements.scroll-bar--${props.type}`, element);
    }
    update() {}
    destroy() {}
  }

  class InnerAction extends Action {
    moving = false;
    initialPos = 0;
    currentPos = 0;
    cumulation = 0;
    lastData = 0;
    dataIndex = 0;
    unsub: () => void;

    constructor(element) {
      super();
      state.update(`_internal.elements.scroll-bar-inner--${props.type}`, element);
      this.pointerDown = this.pointerDown.bind(this);
      this.pointerUp = this.pointerUp.bind(this);
      const pointerMove = this.pointerMove.bind(this);
      this.pointerMove = schedule(ev => pointerMove(ev));
      this.unsub = state.subscribe(`config.scroll.${props.type}.dataIndex`, this.dataIndexChanged.bind(this));
      element.addEventListener('pointerdown', this.pointerDown);
      window.addEventListener('pointermove', this.pointerMove, { passive: true });
      window.addEventListener('pointerup', this.pointerUp);
    }

    destroy(element) {
      this.unsub();
      element.removeEventListener('pointerdown', this.pointerDown);
      window.removeEventListener('pointermove', this.pointerMove);
      window.removeEventListener('pointerup', this.pointerUp);
    }

    dataIndexChanged(dataIndex) {
      if (dataIndex === this.dataIndex) return;
      if (props.type === 'horizontal' && allDates && allDates.length) {
        const date = allDates[dataIndex];
        if (!date) return;
        const pos = Math.round(date.leftPercent * (invSize - sub));
        this.currentPos = pos;
        update();
      }
    }

    limitPosition(offset: number) {
      return Math.max(Math.min(offset, maxPos), 0);
    }

    pointerDown(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.moving = true;
      this.initialPos = props.type === 'horizontal' ? ev.screenX : ev.screenY;
      classNameInnerActive = ' ' + api.getClass(componentName) + '-inner--active';
      classNameOuterActive = ' ' + api.getClass(componentName) + '--active';
      update();
    }

    pointerUp(ev) {
      if (this.moving) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      this.moving = false;
      this.cumulation = 0;
      classNameInnerActive = '';
      classNameOuterActive = '';
      update();
    }

    pointerMove(ev) {
      if (this.moving) {
        ev.stopPropagation();
        const current = props.type === 'horizontal' ? ev.screenX : ev.screenY;
        const diff = current - this.initialPos;
        this.cumulation += diff;
        this.currentPos = this.limitPosition(this.currentPos + diff);
        this.initialPos = current;
        const percent = this.currentPos / maxPos;
        let dataIndex = 0;
        if (props.type === 'horizontal') {
          for (let len = allDates.length; dataIndex < len; dataIndex++) {
            const date = allDates[dataIndex];
            if (date.leftPercent >= percent) break;
          }
        } else {
          for (let len = rowsPercents.length; dataIndex < len; dataIndex++) {
            const rowPercent = rowsPercents[dataIndex];
            if (rowPercent >= percent) break;
          }
        }
        if (!dataIndex) dataIndex = 0;
        this.dataIndex = dataIndex;
        if (props.type === 'horizontal') {
          setScrollLeft(dataIndex);
        } else {
          setScrollTop(dataIndex);
        }
        if (dataIndex !== this.lastData) {
          this.cumulation = 0;
        }
        this.lastData = dataIndex;
      }
    }
  }

  const outerComponentActions = api.getActions(componentName);
  outerComponentActions.push(OuterAction);
  const outerActions = Actions.create(outerComponentActions, { api, state, props });
  const innerComponentActions = [InnerAction];
  const innerActions = Actions.create(innerComponentActions, { api, state, props });

  return () =>
    html`
      <div
        data-actions=${outerActions}
        class=${className + ' ' + className + '--' + props.type + classNameOuterActive}
        style=${styleMapOuter}
      >
        <div
          data-actions=${innerActions}
          class=${classNameInner + ' ' + classNameInner + '--' + props.type + classNameInnerActive}
          style=${styleMapInner}
        ></div>
      </div>
    `;
}
