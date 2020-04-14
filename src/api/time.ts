/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Locale,
  DataChartTime,
  DataChartTimeLevelDate,
  ChartTimeDate,
  ScrollTypeHorizontal,
  Period,
  ChartCalendarLevel,
  ChartCalendarFormat,
  Reason,
} from '../gstc';
import DeepState from 'deep-state-observer';
import { Api } from './api';

export interface CurrentDate {
  timestamp: number;
  hour: Dayjs;
  day: Dayjs;
  week: Dayjs;
  month: Dayjs;
  year: Dayjs;
}

export class Time {
  private locale: Locale;
  private utcMode = false;
  private state: DeepState;
  private api: Api;
  public dayjs: typeof dayjs;
  public currentDate: CurrentDate;

  constructor(state: DeepState, api: Api) {
    this.state = state;
    this.api = api;
    this.dayjs = dayjs;
    this.locale = state.get('config.locale');
    this.utcMode = state.get('config.utcMode');
    this.resetCurrentDate();
    if (this.utcMode) {
      dayjs.extend(utc);
    }
    // @ts-ignore
    dayjs.locale(this.locale, null, true);
  }

  private resetCurrentDate() {
    const currentDate = dayjs();
    this.currentDate = {
      timestamp: currentDate.valueOf(),
      hour: currentDate.startOf('hour'),
      day: currentDate.startOf('day'),
      week: currentDate.startOf('week'),
      month: currentDate.startOf('month'),
      year: currentDate.startOf('year'),
    };
  }

  public date(time: number | string | Date | undefined = undefined) {
    const _dayjs = this.utcMode ? dayjs.utc : dayjs;
    return time ? _dayjs(time).locale(this.locale.name) : _dayjs().locale(this.locale.name);
  }

  private addAdditionalSpace(time: DataChartTime) {
    if (!time.additionalSpaceAdded && time.additionalSpaces && time.additionalSpaces[time.period]) {
      // @ts-ignore
      time.additionalSpaceAdded = true;
      const add = time.additionalSpaces[time.period];
      if (add.before) {
        time.from = this.date(time.from).subtract(add.before, add.period).valueOf();
      }
      if (add.after) {
        time.to = this.date(time.to).add(add.after, add.period).valueOf();
      }
      // @ts-ignore
      time.additionalSpaceAdded = true;
    }
    return time;
  }

  public recalculateFromTo(time: DataChartTime, reason: Reason) {
    const period = time.period;
    time = { ...time };
    time.from = +time.from;
    time.to = +time.to;
    time.fromDate = this.date(time.from);
    time.toDate = this.date(time.to).endOf(period);
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
          time.from = this.date(from).startOf(period).valueOf();
        }
        if (time.to === 0) {
          time.to = this.date(to).endOf(period).valueOf();
        }
        time.fromDate = this.date(time.from);
        time.toDate = this.date(time.to).endOf(period);
      }
    }
    time.from = time.fromDate.startOf(period).valueOf();
    time.to = time.toDate.endOf(period).valueOf();
    if (!time.additionalSpaceAdded) {
      time = this.addAdditionalSpace(time);
      // @ts-ignore
      time.additionalSpaceAdded = true;
    }
    return time;
  }

  public getCenter(time: DataChartTime): number {
    return time.leftGlobal + Math.round((time.rightGlobal - time.leftGlobal) / 2);
  }

  public getGlobalOffsetPxFromDates(date: Dayjs, time: DataChartTime = this.state.get('$data.chart.time')): number {
    const milliseconds = date.valueOf();
    const dates = time.allDates[time.level];
    if (!dates) return -1;
    let firstMatching: ChartTimeDate;
    // find first date that is after milliseconds
    for (let i = 0, len = dates.length; i < len; i++) {
      const currentDate = dates[i];
      // we cannot find date between leftGlobal and rightGlobal because hide weekends may remove those
      if (milliseconds <= currentDate.rightGlobal) {
        firstMatching = currentDate;
        break;
      }
    }
    if (firstMatching) {
      // because milliseconds are lower than rightGlobal it doesn'y mean that it should be higher than leftGlobal
      // because there could be hidden dates so we must calculate offset from rightGlobal
      // also if rightGlobal is higher than milliseconds and leftGlobal is also higher it means that
      // milliseconds (item time) is in hidden date so we will give it leftGlobal value
      if (milliseconds < firstMatching.leftGlobal) {
        // in between hidden dates
        return firstMatching.leftPx;
      }
      return firstMatching.rightPx - (firstMatching.rightGlobal - milliseconds) / time.timePerPixel;
    } else {
      // date is out of the current scope (view)
      const value = date.valueOf();
      if (value <= time.leftGlobal) return 0;
      if (value >= time.rightGlobal) return time.totalViewDurationPx;
    }
  }

  public getViewOffsetPxFromDates(
    date: Dayjs,
    limitToView = true,
    time: DataChartTime = this.state.get('$data.chart.time')
  ) {
    const result = this.getGlobalOffsetPxFromDates(date, time) - time.leftPx;
    if (limitToView) this.limitOffsetPxToView(result);
    return result;
  }

  public limitOffsetPxToView(x: number, time: DataChartTime = this.state.get('$data.chart.time')): number {
    if (x < 0) return 0;
    if (x > time.width) return time.width;
    return x;
  }

  public findDateAtOffsetPx(offsetPx: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined {
    return allPeriodDates.find((date) => date.leftPx >= offsetPx);
  }

  public findDateAtTime(milliseconds: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined {
    return allPeriodDates.find((date) => date.rightGlobal >= milliseconds);
  }

  public getTimeFromViewOffsetPx(offsetPx: number, time: DataChartTime): number {
    const finalOffset = offsetPx + time.leftPx;
    let dates: DataChartTimeLevelDate[] = time.allDates[time.level];
    if (finalOffset < 0) {
      // we need to generate some dates before and update leftPx to negative values
      let date: ChartTimeDate;
      let leftDate = time.fromDate.subtract(1, time.period);
      let left = 0;
      // I think that 1000 is enough to find any date and doesn't get stuck at infinite loop
      for (let i = 0; i < 1000; i++) {
        const dates = this.generatePeriodDates({
          leftDate,
          rightDate: leftDate.add(1, time.period),
          period: time.period,
          time,
          level: this.state.get(`config.chart.calendar.levels.${time.level}`),
          levelIndex: time.level,
          callOnDate: true,
          callOnLevelDates: false,
        });
        if (dates.length) {
          date = dates[0];
          left -= date.width;
          if (left <= finalOffset) {
            return date.leftGlobal + (finalOffset - left) * time.timePerPixel;
          }
        }
        leftDate = leftDate.subtract(1, time.period).startOf(time.period);
      }
    } else if (finalOffset > time.totalViewDurationPx) {
      // we need to generate some dates after and update leftPx
      let date: ChartTimeDate;
      let previosDate: ChartTimeDate;
      let leftDate = time.toDate.startOf('day').add(1, 'day');
      let left = time.rightPx;
      // I think that 1000 is enough to find any date and doesn't get stuck at infinite loop
      for (let i = 0; i < 1000; i++) {
        const dates = this.generatePeriodDates({
          leftDate,
          rightDate: leftDate.add(1, time.period),
          period: time.period,
          time,
          level: this.state.get(`config.chart.calendar.levels.${time.level}`),
          levelIndex: time.level,
          callOnDate: true,
          callOnLevelDates: false,
        });
        if (dates.length) {
          date = dates[0];
          left += date.width;
          if (left >= finalOffset) {
            if (previosDate) date = previosDate;
            return date.rightGlobal - (left - finalOffset) * time.timePerPixel;
          }
        }
        leftDate = leftDate.add(1, time.period).startOf(time.period);
        previosDate = date;
      }
    }
    for (let i = 0, len = dates.length; i < len; i++) {
      let date = dates[i];
      if (date.rightPx >= finalOffset) {
        return date.rightGlobal - Math.round((date.rightPx - finalOffset) * time.timePerPixel);
      }
    }
    return -1;
  }

  public calculateScrollPosPxFromTime(
    milliseconds: number,
    time: DataChartTime | undefined,
    scroll: ScrollTypeHorizontal | undefined
  ) {
    if (!scroll) scroll = this.state.get('config.scroll.horizontal');
    if (!scroll.maxPosPx) return 0;
    if (!time) time = this.state.get('$data.chart.time');
    const date: DataChartTimeLevelDate = this.findDateAtTime(milliseconds, time.allDates[time.level]);
    return Math.round((scroll.maxPosPx - scroll.innerSize) * date.leftPercent);
  }

  public getCurrentFormatForLevel(level: ChartCalendarLevel, time: DataChartTime): ChartCalendarFormat {
    return level.formats.find((format) => +time.zoom <= +format.zoomTo);
  }

  public generatePeriodDates({
    leftDate,
    rightDate,
    period,
    level,
    levelIndex,
    time,
    callOnDate,
    callOnLevelDates,
  }: {
    leftDate: Dayjs;
    rightDate: Dayjs;
    period: Period;
    level: ChartCalendarLevel;
    levelIndex: number;
    time: DataChartTime;
    callOnDate: boolean;
    callOnLevelDates: boolean;
  }): DataChartTimeLevelDate[] {
    if (!time.timePerPixel) return [];
    let leftPx = 0;
    const diff = Math.ceil(rightDate.diff(leftDate, period, true));
    let dates = [];
    for (let i = 0; i < diff; i++) {
      const rightGlobalDate = leftDate.endOf(period);
      let date: DataChartTimeLevelDate = {
        leftGlobal: leftDate.valueOf(),
        leftGlobalDate: leftDate,
        rightGlobalDate,
        rightGlobal: rightGlobalDate.valueOf(),
        width: 0,
        leftPx: 0,
        rightPx: 0,
        period,
        formatted: null,
        current: leftDate.valueOf() === this.currentDate[period].valueOf(),
        previous: leftDate.add(1, period).valueOf() === this.currentDate[period].valueOf(),
        next: leftDate.subtract(1, period).valueOf() === this.currentDate[period].valueOf(),
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
    if (callOnDate) {
      for (let i = 0, len = time.onDate.length; i < len; i++) {
        dates = dates
          .map((date) => time.onDate[i]({ date, format, time, level, levelIndex }))
          .filter((date) => date !== null);
      }
    }
    if (callOnLevelDates) {
      for (let i = 0, len = time.onLevelDates.length; i < len; i++) {
        dates = time.onLevelDates[i]({ dates, format, time, level, levelIndex });
      }
    }
    return dates;
  }

  public getDatesDiffPx(fromTime: Dayjs, toTime: Dayjs, time: DataChartTime): number {
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
        time,
        callOnDate: true,
        callOnLevelDates: false,
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
        time,
        callOnDate: true,
        callOnLevelDates: false,
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

  getLeftViewDate(time: DataChartTime = this.state.get('$data.chart.time')): ChartTimeDate | null {
    if (!time.levels || !time.levels.length) return null;
    const level = time.levels[time.level];
    if (!level.length) return null;
    return level[0];
  }

  getRightViewDate(time: DataChartTime = this.state.get('$data.chart.time')): ChartTimeDate | null {
    if (!time.levels || !time.levels.length || !time.levels[time.level]) return null;
    const level = time.levels[time.level];
    if (!level.length) return null;
    return level[level.length - 1];
  }

  getLowerPeriod(period: Period): Period {
    switch (period) {
      case 'year':
        return 'month';
      case 'month':
        return 'week';
      case 'week':
        return 'day';
      case 'day':
        return 'hour';
      case 'hour':
        return 'minute';
      case 'minute':
        return 'second';
      case 'second':
        return 'millisecond';
      default:
        return period;
    }
  }

  getHigherPeriod(period: Period): Period {
    switch (period) {
      case 'month':
        return 'year';
      case 'week':
        return 'month';
      case 'day':
        return 'week';
      case 'hour':
        return 'day';
      case 'minute':
        return 'hour';
      case 'second':
        return 'minute';
      case 'millisecond':
        return 'second';
      default:
        return period;
    }
  }
}
