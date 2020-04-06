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
} from '@src/gstc';

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
  private state: any;
  public dayjs: typeof dayjs;
  public currentDate: CurrentDate;

  constructor(state) {
    this.dayjs = dayjs;
    this.state = state;
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
    if (time.additionalSpaces && time.additionalSpaces[time.period]) {
      const add = time.additionalSpaces[time.period];
      if (add.before) {
        time.finalFrom = this.date(time.from).subtract(add.before, add.period).valueOf();
      }
      if (add.after) {
        time.finalTo = this.date(time.to).add(add.after, add.period).valueOf();
      }
    }
    return time;
  }

  public recalculateFromTo(time: DataChartTime) {
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
          time.from = this.date(from).startOf(period).valueOf();
        }
        if (time.to === 0) {
          time.to = this.date(to).endOf(period).valueOf();
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

  public getCenter(time: DataChartTime) {
    return time.leftGlobal + (time.rightGlobal - time.leftGlobal) / 2;
  }

  public getGlobalOffsetPxFromDates(date: Dayjs, time: DataChartTime = this.state.get('$data.chart.time')): number {
    const milliseconds = date.valueOf();
    const dates = time.allDates[time.level];
    if (!dates) return -1;
    if (milliseconds < time.finalFrom) {
      const level: ChartCalendarLevel = this.state.get(`config.chart.calendar.levels.${time.level}`);
      const leftDate: Dayjs = date.startOf(time.period);
      const beforeDates = this.generatePeriodDates({
        leftDate,
        rightDate: time.finalFromDate,
        period: time.period,
        level,
        levelIndex: time.level,
        time,
      });
      let px = 0;
      for (let i = 0, len = beforeDates.length; i < len; i++) {
        px += beforeDates[i].width;
      }
      const diff = (milliseconds - leftDate.valueOf()) / time.timePerPixel;
      return -(px - diff);
    }
    if (milliseconds > time.totalViewDurationMs) {
    }
    let firstMatching: ChartTimeDate;
    // find first date that is after milliseconds
    for (let i = 0, len = dates.length; i < len; i++) {
      const currentDate = dates[i];
      // we cannot find date between leftGlobal and rightGlobal because hide weekends may remove those
      if (milliseconds <= currentDate.rightGlobal) {
        firstMatching = dates[i];
        break;
      }
    }
    if (firstMatching) {
      return firstMatching.leftPx + (milliseconds - firstMatching.leftGlobal) / time.timePerPixel;
    } else {
      // date is out of the current scope (view)
      if (date.valueOf() < time.leftGlobal) return 0;
      return time.width;
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
      let leftDate = time.leftGlobalDate.subtract(1, time.period);
      let left = 0;
      // I think that 1000 is enough to find any date and doesn't get stuck at infinite loop
      for (let i = 0; i < 1000; i++) {
        date = this.generatePeriodDates({
          leftDate,
          rightDate: leftDate.add(1, time.period),
          period: time.period,
          time,
          level: this.state.get(`config.chart.calendar.levels.${time.level}`),
          levelIndex: time.level,
        })[0];
        left -= date.width;
        if (left <= finalOffset) {
          return date.leftGlobal + Math.round((Math.abs(finalOffset) - Math.abs(date.leftPx)) * time.timePerPixel);
        }
        leftDate = leftDate.subtract(1, time.period).startOf(time.period);
      }
    } else if (finalOffset > time.totalViewDurationPx) {
      // we need to generate some dates after and update leftPx
      let date: ChartTimeDate;
      let leftDate = time.rightGlobalDate;
      let left = time.rightPx;
      // I think that 1000 is enough to find any date and doesn't get stuck at infinite loop
      for (let i = 0; i < 1000; i++) {
        date = this.generatePeriodDates({
          leftDate,
          rightDate: leftDate.add(1, time.period),
          period: time.period,
          time,
          level: this.state.get(`config.chart.calendar.levels.${time.level}`),
          levelIndex: time.level,
        })[0];
        left += date.width;
        if (left >= finalOffset) {
          return date.leftGlobal + Math.round((Math.abs(finalOffset) - Math.abs(date.leftPx)) * time.timePerPixel);
        }
        leftDate = leftDate.add(1, time.period).startOf(time.period);
      }
    }
    for (let i = 0, len = dates.length; i < len; i++) {
      let date = dates[i];
      if (date.leftPx >= finalOffset) {
        return date.leftGlobal + Math.round((finalOffset - date.leftPx) * time.timePerPixel);
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
  }: {
    leftDate: Dayjs;
    rightDate: Dayjs;
    period: Period;
    level: ChartCalendarLevel;
    levelIndex: number;
    time: DataChartTime;
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
    for (let i = 0, len = time.onLevelDates.length; i < len; i++) {
      dates = time.onLevelDates[i]({ dates, format, time, level, levelIndex });
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
