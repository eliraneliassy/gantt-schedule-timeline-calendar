import { Time } from './time';
import DeepState from 'deep-state-observer';
import dayjs from 'dayjs';
import { Config, DataChartTime, ScrollTypeHorizontal, Row, Item, Vido, ScrollTypeVertical } from '../gstc';
export declare function getClass(name: string): string;
export declare function stateFromConfig(userConfig: Config): any;
export declare const publicApi: {
    name: string;
    stateFromConfig: typeof stateFromConfig;
    mergeDeep: typeof import("@neuronet.io/vido/helpers").mergeDeep;
    date(time: any): dayjs.Dayjs;
    setPeriod(period: dayjs.OpUnitType): number;
    dayjs: typeof dayjs;
};
export interface WheelResult {
    x: number;
    y: number;
    z: number;
    event: MouseWheelEvent;
}
export interface IconsCache {
    [key: string]: string;
}
export declare type Unsubscribes = (() => void)[];
export declare class Api {
    name: string;
    debug: boolean;
    state: DeepState;
    time: Time;
    vido: Vido;
    private iconsCache;
    private unsubscribes;
    constructor(state: DeepState);
    setVido(Vido: Vido): void;
    log(...args: any[]): void;
    mergeDeep: typeof import("@neuronet.io/vido/helpers").mergeDeep;
    getClass: typeof getClass;
    allActions: any[];
    getActions(name: string): any;
    isItemInViewport(item: Item, leftGlobal: number, rightGlobal: number): boolean;
    prepareItems(items: Item[]): Item[];
    fillEmptyRowValues(rows: Row[]): Row[];
    itemsOnTheSameLevel(item1: Item, item2: Item): boolean;
    itemsOverlaps(item1: Item, item2: Item): boolean;
    itemOverlapsWithOthers(item: Item, items: Item[]): boolean;
    fixOverlappedItems(rowItems: Item[]): void;
    recalculateRowHeight(row: Row): number;
    recalculateRowsHeights(rows: Row[]): number;
    recalculateRowsPercents(rows: Row[], verticalAreaHeight: number): Row[];
    generateParents(rows: any, parentName?: string): {};
    fastTree(rowParents: any, node: any, parents?: any[]): any;
    makeTreeMap(rows: any, items: any): any;
    getFlatTreeMapById(treeMap: any, flatTreeMapById?: {}): {};
    flattenTreeMap(treeMap: any, rows?: any[]): any[];
    getRowsFromMap(flatTreeMap: any, rows: any): any;
    getRowsFromIds(ids: any, rows: any): any[];
    getRowsWithParentsExpanded(flatTreeMap: any, flatTreeMapById: any, rows: any): any[];
    getVisibleRows(rowsWithParentsExpanded: Row[]): Row[];
    normalizeMouseWheelEvent(event: MouseWheelEvent): WheelResult;
    scrollToTime(toTime: number, centered?: boolean, time?: DataChartTime): number;
    setScrollLeft(dataIndex: number | undefined, time?: DataChartTime, multi?: any): any;
    getScrollLeft(): ScrollTypeHorizontal;
    setScrollTop(dataIndex: number | undefined): void;
    getScrollTop(): ScrollTypeVertical;
    getSVGIconSrc(svg: any): string;
    destroy(): void;
}
//# sourceMappingURL=api.d.ts.map