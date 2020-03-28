/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import dayjs, { OpUnitType, Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Locale,
  ChartInternalTime,
  ChartInternalTimeLevelDate,
  ChartTimeDate,
  Scroll,
  ChartInternalTimeLevel,
  ScrollTypeHorizontal,
  Period,
  ChartCalendarLevel
} from '../types';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

export default class TimeApi {
  private locale: Locale;
  private utcMode = false;
  private state: any;

  constructor(state) {
    this.state = state;
    this.locale = state.get('config.locale');
    this.utcMode = state.get('config.utcMode');
    if (this.utcMode) {
      dayjs.extend(utc);
    }
    // @ts-ignore
    dayjs.locale(this.locale, null, true);
  }

  public date(time: number | string | Date | undefined = undefined) {
    const _dayjs = this.utcMode ? dayjs.utc : dayjs;
    return time ? _dayjs(time).locale(this.locale.name) : _dayjs().locale(this.locale.name);
  }

  private addAdditionalSpace(time: ChartInternalTime) {
    if (time.additionalSpaces && time.additionalSpaces[time.period]) {
      const add = time.additionalSpaces[time.period];
      if (add.before) {
        time.finalFrom = this.date(time.from)
          .subtract(add.before, add.period)
          .valueOf();
      }
      if (add.after) {
        time.finalTo = this.date(time.to)
          .add(add.after, add.period)
          .valueOf();
      }
    }
    return time;
  }

  public recalculateFromTo(time: ChartInternalTime) {
    const period = time.period;
    time = { ...time };
    time.from = +time.from;
    time.to = +time.to;

    let from = Number.MAX_SAFE_INTEGER,
      to = 0;
    const items = this.state.get('config.chart.items');
    if (Object.keys(items).length > 0) {
      if (time.from === 0 || time.to === 0) {
        for (const itemId in items) {
          const item = items[itemId];
          if (item.time.start < from && item.time.start) {
            from = item.time.start;
          }
          if (item.time.end > to) {
            to = item.time.end;
          }
        }
        if (time.from === 0) {
          time.from = this.date(from)
            .startOf(period)
            .valueOf();
        }
        if (time.to === 0) {
          time.to = this.date(to)
            .endOf(period)
            .valueOf();
        }
        time.fromDate = this.date(time.from);
        time.toDate = this.date(time.to);
      }
    }
    time.finalFrom = time.fromDate.startOf(period).valueOf();
    time.finalTo = time.toDate.startOf(period).valueOf();
    time = this.addAdditionalSpace(time);
    return time;
  }

  public getCenter(time: ChartInternalTime) {
    return time.leftGlobal + (time.rightGlobal - time.leftGlobal) / 2;
  }

  public getOffsetPxFromDates(
    date: Dayjs,
    levelDates: ChartInternalTimeLevelDate[],
    time: ChartInternalTime,
    fromLeft = true
  ): number {
    const milliseconds = date.valueOf();
    let firstMatching;
    // find first date that is after milliseconds
    for (let i = 0, len = levelDates.length; i < len; i++) {
      const currentDate = levelDates[i];
      if (currentDate.rightGlobal >= milliseconds) {
        firstMatching = levelDates[i];
        break;
      }
    }
    if (firstMatching) {
      return fromLeft ? firstMatching.currentView.leftPx : firstMatching.currentView.rightPx;
    } else {
      // date is out of the current scope (view)
      if (date.valueOf() < time.leftGlobal) return 0;
      return time.width;
    }
  }

  public findDateAtOffsetPx(offsetPx: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined {
    return allPeriodDates.find(date => date.leftPx >= offsetPx);
  }

  public findDateAtTime(milliseconds: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined {
    return allPeriodDates.find(date => date.rightGlobal >= milliseconds);
  }

  public calculateScrollPosPxFromTime(
    milliseconds: number,
    time: ChartInternalTime | undefined,
    scroll: ScrollTypeHorizontal | undefined
  ) {
    if (!scroll) scroll = this.state.get('config.scroll.horizontal');
    if (!scroll.maxPosPx) return 0;
    if (!time) time = this.state.get('_internal.chart.time');
    const date: ChartInternalTimeLevelDate = this.findDateAtTime(milliseconds, time.allDates[time.level]);
    return Math.round((scroll.maxPosPx - scroll.innerSize) * date.leftPercent);
  }

  public getCurrentFormatForLevel(level: ChartCalendarLevel, time: ChartInternalTime) {
    return level.formats.find(format => +time.zoom <= +format.zoomTo);
  }

  public generatePeriodDates({
    leftDate,
    rightDate,
    period,
    level,
    levelIndex,
    time
  }: {
    leftDate: Dayjs;
    rightDate: Dayjs;
    period: Period;
    level: ChartCalendarLevel;
    levelIndex: number;
    time: ChartInternalTime;
  }) {
    if (!time.timePerPixel) return [];
    let leftPx = 0;
    const diff = Math.ceil(rightDate.diff(leftDate, period, true));
    const currentDate = this.date().startOf(period);
    let dates = [];
    for (let i = 0; i < diff; i++) {
      const rightGlobalDate = leftDate.endOf(period);
      let date: ChartInternalTimeLevelDate = {
        leftGlobal: leftDate.valueOf(),
        leftGlobalDate: leftDate,
        rightGlobalDate,
        rightGlobal: rightGlobalDate.valueOf(),
        width: 0,
        leftPx: 0,
        rightPx: 0,
        period,
        formatted: null,
        current: leftDate.valueOf() === currentDate.valueOf(),
        previous: leftDate.add(1, period).valueOf() === currentDate.valueOf(),
        next: leftDate.subtract(1, period).valueOf() === currentDate.valueOf()
      };
      const diffMs = date.rightGlobal - date.leftGlobal;
      date.width = diffMs / time.timePerPixel;
      date.leftPx = leftPx;
      leftPx += date.width;
      date.rightPx = leftPx;
      dates.push(date);
      leftDate = leftDate.add(1, period); // 'startOf' will cause bug here on summertime change
    }
    const format = this.getCurrentFormatForLevel(level, time);
    for (let i = 0, len = time.onLevelDates.length; i < len; i++) {
      dates = time.onLevelDates[i]({ dates, format, time, level, levelIndex });
    }
    return dates;
  }

  public getDatesDiffPx(fromTime: Dayjs, toTime: Dayjs, time: ChartInternalTime): number {
    if (fromTime === toTime) return 0;
    const mainDates = time.allDates[time.level];
    if (mainDates.length === 0) return 0;
    let width = 0;
    let startCounting = false;
    let inverse = false;
    if (toTime < fromTime) {
      const initialFrom = fromTime;
      fromTime = toTime;
      toTime = initialFrom;
      inverse = true;
    }

    let dates = [];
    if (fromTime.valueOf() < mainDates[0].leftGlobal) {
      // we need to generate some dates before
      const period = mainDates[0].period;
      const levelIndex = time.level;
      const level = this.state.get(`config.chart.calendar.levels.${levelIndex}`) as ChartCalendarLevel;
      const beforeDates = this.generatePeriodDates({
        leftDate: fromTime,
        rightDate: mainDates[0].leftGlobalDate,
        period,
        level,
        levelIndex,
        time
      });
      dates = beforeDates;
    }
    dates = [...dates, ...mainDates];
    const endOfDates = mainDates[mainDates.length - 1].leftGlobalDate;
    if (toTime.valueOf() > endOfDates.valueOf()) {
      // we need to generate some dates after
      const period = mainDates[0].period;
      const levelIndex = time.level;
      const level = this.state.get(`config.chart.calendar.levels.${levelIndex}`) as ChartCalendarLevel;
      const afterDates = this.generatePeriodDates({
        leftDate: toTime,
        rightDate: endOfDates,
        period,
        level,
        levelIndex,
        time
      });
      dates = [...dates, ...afterDates];
    }

    // we have all dates collected with those missing ones
    const level = this.state.get(`config.chart.calendar.levels.${time.level}`);
    const format = this.getCurrentFormatForLevel(level, time);
    for (const onLevelDates of time.onLevelDates) {
      dates = onLevelDates({ dates, time, format, level, levelIndex: time.level });
    }

    for (const date of dates) {
      if (date.leftGlobal >= fromTime.valueOf()) {
        startCounting = true;
      }
      if (date.rightGlobal >= toTime.valueOf()) {
        break;
      }
      if (startCounting) width += date.width;
    }
    return inverse ? -width : width;
  }
}
