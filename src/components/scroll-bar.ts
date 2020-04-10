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
import { ScrollType, Row, Vido, DataChartTimeLevelDate, DataChartTimeLevel } from '../gstc';

export interface Props {
  type: 'horizontal' | 'vertical';
}

export default function ScrollBar(vido: Vido, props: Props) {
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
  let allDates: DataChartTimeLevelDate[] = [];
  let rows: Row[] = [];
  let innerSize = 0,
    invSize = 0,
    invSizeInner = 0,
    sub = 0;

  function getFullSize(): number {
    let fullSize = 0;
    if (props.type === 'vertical') {
      if (rows.length) {
        return rows[rows.length - 1].$data.position.top + rows[rows.length - 1].$data.outerHeight;
      }
      return fullSize;
    }
    if (allDates.length) {
      return allDates[allDates.length - 1].rightPx;
    }
    return fullSize;
  }

  if (props.type === 'horizontal') {
    onDestroy(
      state.subscribe('$data.chart.time', () => {
        const time = state.get('$data.chart.time');
        if (!time.leftGlobalDate) return;
        const horizontal = state.get('config.scroll.horizontal');
        if (horizontal.area !== time.scrollWidth) {
          state.update('config.scroll.horizontal.area', time.scrollWidth);
        }
        if (time.allDates && time.allDates[time.level]) {
          const dates = time.allDates[time.level];
          const date = dates.find((date) => date.leftGlobal === time.leftGlobal);
          let dataIndex = dates.indexOf(date);
          const lastPageCount = state.get('config.scroll.horizontal.lastPageCount');
          if (dataIndex > dates.length - lastPageCount) {
            dataIndex = dates.length - lastPageCount;
          }
          api.setScrollLeft(dataIndex, time);
        }
      })
    );
  }

  const cache = {
    maxPosPx: 0,
    innerSize: 0,
    sub: 0,
    scrollArea: 0,
  };
  function shouldUpdate(maxPosPx, innerSize, sub, scrollArea) {
    const result =
      cache.maxPosPx !== maxPosPx ||
      cache.innerSize !== innerSize ||
      cache.sub !== sub ||
      cache.scrollArea !== scrollArea;
    if (result) {
      cache.maxPosPx = maxPos;
      cache.innerSize = innerSize;
      cache.sub = sub;
      cache.scrollArea = invSize;
    }
    return result;
  }

  onDestroy(
    state.subscribeAll(
      props.type === 'horizontal'
        ? [`config.scroll.${props.type}`, '$data.chart.time']
        : [
            `config.scroll.${props.type}`,
            '$data.innerHeight',
            '$data.list.rowsWithParentsExpanded;',
            '$data.list.rowsHeight',
          ],
      function scrollThing() {
        const time = state.get('$data.chart.time');
        const scroll = state.get(`config.scroll.${props.type}`);
        const chartWidth = state.get('$data.chart.dimensions.width');
        const chartHeight = state.get('$data.innerHeight');
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
          rows = state.get('$data.list.rowsWithParentsExpanded') || [];
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
          // shouldUpdate prevent infinite loop
          state.update(`config.scroll.${props.type}`, (scroll: ScrollType) => {
            scroll.maxPosPx = maxPos;
            scroll.innerSize = innerSize;
            scroll.sub = sub;
            scroll.scrollArea = invSize;
            return scroll;
          });
        }
        update();
      }
    )
  );

  let oldPos = 0;
  onDestroy(
    state.subscribe(`config.scroll.${props.type}.posPx`, (position) => {
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
      state.update(`$data.elements.scroll-bar--${props.type}`, element);
    }
    update() {}
    destroy() {}
  }

  class InnerAction extends Action {
    moving = false;
    initialPos = 0;
    currentPos = 0;
    cumulation = 0;
    lastDataIndex = 0;
    dataIndex = 0;
    lastDate: DataChartTimeLevelDate;
    lastRow: Row;
    bodyClassName: string;
    unsub: () => void;

    constructor(element) {
      super();
      state.update(`$data.elements.scroll-bar-inner--${props.type}`, element);
      this.bodyClassName = state.get('config.scroll.bodyClassName');
      this.pointerDown = this.pointerDown.bind(this);
      this.pointerUp = this.pointerUp.bind(this);
      const pointerMove = this.pointerMove.bind(this);
      this.pointerMove = schedule((ev) => pointerMove(ev));
      this.unsub = state.subscribe(`config.scroll.${props.type}`, this.dataChanged.bind(this));
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

    dataChanged() {
      const dataIndex: number = state.get(`config.scroll.${props.type}.dataIndex`);
      this.lastDataIndex = dataIndex;
      if (props.type === 'horizontal' && allDates && allDates.length) {
        const date: DataChartTimeLevelDate = allDates[dataIndex];
        if (!date) return;
        if (this.lastDate && this.lastDate.leftPercent === date.leftPercent) return;
        const pos = this.limitPosition(date.leftPercent * (invSize - sub));
        this.currentPos = pos;
        update();
      } else if (props.type === 'vertical') {
        const row = rows[dataIndex];
        if (!row) return;
        if (this.lastRow && this.lastRow.$data.position.topPercent === row.$data.position.topPercent) return;
        const pos = Math.round(row.$data.position.topPercent * (invSize - sub));
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
      document.body.classList.add(this.bodyClassName);
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
        document.body.classList.remove(this.bodyClassName);
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
          for (let len = rows.length; dataIndex < len; dataIndex++) {
            const rowPercent = rows[dataIndex].$data.position.topPercent;
            if (rowPercent >= percent) break;
          }
        }
        if (!dataIndex) dataIndex = 0;
        this.dataIndex = dataIndex;
        if (props.type === 'horizontal') {
          this.lastDate = allDates[dataIndex];
          api.setScrollLeft(dataIndex);
        } else {
          this.lastRow = rows[dataIndex];
          api.setScrollTop(dataIndex);
        }
        if (dataIndex !== this.lastDataIndex) {
          this.cumulation = 0;
        }
        this.lastDataIndex = dataIndex;
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
