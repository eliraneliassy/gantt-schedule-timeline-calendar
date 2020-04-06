import dayjs, { Dayjs } from 'dayjs';
import { DataChartTime, DataChartTimeLevelDate, ChartTimeDate, ScrollTypeHorizontal, Period, ChartCalendarLevel, ChartCalendarFormat } from '@src/gstc';
export interface CurrentDate {
    timestamp: number;
    hour: Dayjs;
    day: Dayjs;
    week: Dayjs;
    month: Dayjs;
    year: Dayjs;
}
export declare class Time {
    private locale;
    private utcMode;
    private state;
    dayjs: typeof dayjs;
    currentDate: CurrentDate;
    constructor(state: any);
    private resetCurrentDate;
    date(time?: number | string | Date | undefined): dayjs.Dayjs;
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
    getCurrentFormatForLevel(level: ChartCalendarLevel, time: DataChartTime): ChartCalendarFormat;
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
//# sourceMappingURL=time.d.ts.map