/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */
import dayjs, { Dayjs } from 'dayjs';
import { DataChartTime, DataChartTimeLevelDate, ChartTimeDate, ScrollTypeHorizontal, Period, ChartCalendarLevel } from '../types';
export declare class TimeApi {
    private locale;
    private utcMode;
    private state;
    dayjs: typeof dayjs;
    constructor(state: any);
    date(time?: number | string | Date | undefined): any;
    private addAdditionalSpace;
    recalculateFromTo(time: DataChartTime): DataChartTime;
    getCenter(time: DataChartTime): number;
    getGlobalOffsetPxFromDates(date: Dayjs, time?: DataChartTime): number;
    getViewOffsetPxFromDates(date: Dayjs, limitToView?: boolean, time?: DataChartTime): number;
    limitOffsetPxToView(x: number, time?: DataChartTime): number;
    findDateAtOffsetPx(offsetPx: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined;
    findDateAtTime(milliseconds: number, allPeriodDates: ChartTimeDate[]): ChartTimeDate | undefined;
    getTimeFromViewOffsetPx(offsetPx: number, time: DataChartTime): number;
    calculateScrollPosPxFromTime(milliseconds: number, time: DataChartTime | undefined, scroll: ScrollTypeHorizontal | undefined): number;
    getCurrentFormatForLevel(level: ChartCalendarLevel, time: DataChartTime): import("../types").ChartCalendarFormat | undefined;
    generatePeriodDates({ leftDate, rightDate, period, level, levelIndex, time, }: {
        leftDate: Dayjs;
        rightDate: Dayjs;
        period: Period;
        level: ChartCalendarLevel;
        levelIndex: number;
        time: DataChartTime;
    }): DataChartTimeLevelDate[];
    getDatesDiffPx(fromTime: Dayjs, toTime: Dayjs, time: DataChartTime): number;
}
