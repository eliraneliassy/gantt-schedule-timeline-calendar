/**
 * Api functions
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */
import { TimeApi } from './Time';
import DeepState from 'deep-state-observer';
import { Config, Row, Item, Vido } from '../types';
export declare function stateFromConfig(userConfig: Config): any;
export declare const publicApi: {
    name: string;
    stateFromConfig: typeof stateFromConfig;
    mergeDeep: any;
    date(time: any): any;
    setPeriod(period: any): number;
    dayjs: any;
};
export interface WheelResult {
    x: number;
    y: number;
    z: number;
    event: MouseWheelEvent;
}
export declare class Api {
    name: string;
    debug: boolean;
    state: DeepState;
    time: TimeApi;
    vido: Vido;
    private iconsCache;
    private unsubscribes;
    constructor(state: DeepState);
    setVido(Vido: Vido): void;
    log(...args: any[]): void;
    mergeDeep: any;
    getClass(name: string): string;
    allActions: never[];
    getActions(name: string): any;
    isItemInViewport(item: Item, left: number, right: number): boolean;
    prepareItems(items: Item[]): Item[];
    fillEmptyRowValues(rows: Row[]): Row[];
    itemsOnTheSameLevel(item1: Item, item2: Item): boolean;
    itemsOverlaps(item1: Item, item2: Item): boolean;
    itemOverlapsWithOthers(item: Item, items: Item[]): boolean;
    fixOverlappedItems(items: Item[]): void;
    recalculateRowsHeights(rows: Row[]): number;
    generateParents(rows: any, parentName?: string): {};
    fastTree(rowParents: any, node: any, parents?: never[]): any;
    makeTreeMap(rows: any, items: any): any;
    getFlatTreeMapById(treeMap: any, flatTreeMapById?: {}): {};
    flattenTreeMap(treeMap: any, rows?: never[]): never[];
    getRowsFromMap(flatTreeMap: any, rows: any): any;
    getRowsFromIds(ids: any, rows: any): any[];
    getRowsWithParentsExpanded(flatTreeMap: any, flatTreeMapById: any, rows: any): any[];
    getRowsHeight(rows: any): number;
    /**
     * Get visible rows - get rows that are inside current viewport (height)
     *
     * @param {array} rowsWithParentsExpanded rows that have parent expanded- they are visible
     */
    getVisibleRows(rowsWithParentsExpanded: any): any[];
    /**
     * Normalize mouse wheel event to get proper scroll metrics
     *
     * @param {Event} event mouse wheel event
     */
    normalizeMouseWheelEvent(event: any): WheelResult;
    scrollToTime(toTime: number, centered?: boolean): number;
    getSVGIconSrc(svg: any): any;
    /**
     * Destroy things to release memory
     */
    destroy(): void;
}
