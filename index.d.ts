declare module "api/Time" {
    import dayjs, { Dayjs } from 'dayjs';
    import { DataChartTime, DataChartTimeLevelDate, ChartTimeDate, ScrollTypeHorizontal, Period, ChartCalendarLevel, ChartCalendarFormat } from "index";
    export class TimeApi {
        private locale;
        private utcMode;
        private state;
        dayjs: typeof dayjs;
        constructor(state: any);
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
}
declare module "api/Api" {
    import { TimeApi } from "api/Time";
    import DeepState from "../node_modules/deep-state-observer/index";
    import dayjs from 'dayjs';
    import { Config, Row, Item, Vido } from "index";
    import { mergeDeep } from "../node_modules/@neuronet.io/vido/helpers";
    export function stateFromConfig(userConfig: Config): any;
    export const publicApi: {
        name: string;
        stateFromConfig: typeof stateFromConfig;
        mergeDeep: typeof mergeDeep;
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
    export type Unsubscribes = (() => void)[];
    export class Api {
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
        mergeDeep: typeof mergeDeep;
        getClass(name: string): string;
        allActions: any[];
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
        fastTree(rowParents: any, node: any, parents?: any[]): any;
        makeTreeMap(rows: any, items: any): any;
        getFlatTreeMapById(treeMap: any, flatTreeMapById?: {}): {};
        flattenTreeMap(treeMap: any, rows?: any[]): any[];
        getRowsFromMap(flatTreeMap: any, rows: any): any;
        getRowsFromIds(ids: any, rows: any): any[];
        getRowsWithParentsExpanded(flatTreeMap: any, flatTreeMapById: any, rows: any): any[];
        getRowsHeight(rows: any): number;
        getVisibleRows(rowsWithParentsExpanded: any): any[];
        normalizeMouseWheelEvent(event: any): WheelResult;
        scrollToTime(toTime: number, centered?: boolean): number;
        getSVGIconSrc(svg: any): string;
        destroy(): void;
    }
}
declare module "index" {
    import 'pepjs';
    import { Api } from "api/Api";
    import { vido, lithtml } from '@neuronet.io/vido/vido.d';
    import { Dayjs, OpUnitType } from 'dayjs';
    import { Properties as CSSProps } from 'csstype';
    import DeepState from "../node_modules/deep-state-observer/index";
    export type Vido = vido<DeepState, Api>;
    export interface RowData {
        actualHeight: number;
        outerHeight: number;
        parents: string[];
        children: string[];
        items: Item[];
    }
    export interface RowStyleObject {
        current?: CSSProps;
        children?: CSSProps;
    }
    export interface RowGridStyle {
        cell?: RowStyleObject;
        row?: RowStyleObject;
    }
    export interface RowItemsStyle {
        item?: RowStyleObject;
        row?: RowStyleObject;
    }
    export interface RowStyle extends RowStyleObject {
        grid?: RowGridStyle;
        items?: RowItemsStyle;
    }
    export interface Row {
        id: string;
        parentId?: string;
        expanded?: boolean;
        height?: number;
        $data?: RowData;
        top?: number;
        gap?: RowGap;
        style?: RowStyle;
        classNames?: string[];
    }
    export interface Rows {
        [id: string]: Row;
    }
    export interface ItemTime {
        start: number;
        end: number;
    }
    export interface ItemDataTime {
        startDate: Dayjs;
        endDate: Dayjs;
    }
    export interface ItemDataPosition {
        left: number;
        actualLeft: number;
        right: number;
        actualRight: number;
        top: number;
        actualTop: number;
    }
    export interface ItemData {
        time: ItemDataTime;
        actualHeight: number;
        outerHeight: number;
        position: ItemDataPosition;
        width: number;
        actualWidth: number;
        detached: boolean;
    }
    export interface Item {
        id: string;
        rowId: string;
        time: ItemTime;
        label: string;
        height?: number;
        top?: number;
        gap?: ItemGap;
        style?: CSSProps;
        classNames?: string[];
        isHTML?: boolean;
        linkedWith?: string[];
        selected?: boolean;
        $data: ItemData;
    }
    export interface Items {
        [id: string]: Item;
    }
    export interface Cell {
        id: string;
        time: ChartTimeDate;
        top: number;
        row: Row;
    }
    export interface RowWithCells {
        row: Row;
        cells: Cell[];
        top: number;
        width: number;
    }
    export type VoidFunction = () => void;
    export type PluginInitialization = (vido: unknown) => void | VoidFunction;
    export type Plugin = <T>(options: T) => PluginInitialization;
    export type htmlResult = lithtml.TemplateResult | lithtml.SVGTemplateResult | undefined;
    export type RenderFunction = (templateProps: unknown) => htmlResult;
    export type Component = (vido: unknown, props: unknown) => RenderFunction;
    export interface Components {
        [name: string]: Component;
    }
    export type Wrapper = (input: htmlResult, props?: any) => htmlResult;
    export interface Wrappers {
        [name: string]: Wrapper;
    }
    export interface Slot {
        [key: string]: htmlResult[];
    }
    export interface Slots {
        [name: string]: Slot;
    }
    export interface ColumnResizer {
        width?: number;
        inRealTime?: boolean;
        dots?: number;
    }
    export type ColumnDataFunctionString = (row: Row) => string;
    export type ColumnDataFunctionTemplate = (row: Row) => htmlResult;
    export interface ColumnDataHeader {
        html?: htmlResult;
        content?: string;
    }
    export interface ColumnData {
        id: string;
        data: string | ColumnDataFunctionString | ColumnDataFunctionTemplate;
        isHTML: boolean;
        width: number;
        header: ColumnDataHeader;
        expander: boolean;
    }
    export interface ColumnsData {
        [id: string]: ColumnData;
    }
    export interface Columns {
        percent?: number;
        resizer?: ColumnResizer;
        minWidth?: number;
        data?: ColumnsData;
    }
    export interface ExpanderIcon {
        width?: number;
        height?: number;
    }
    export interface ExpanderIcons {
        child?: string;
        open?: string;
        closed?: string;
    }
    export interface Expander {
        padding?: number;
        size?: number;
        icon?: ExpanderIcon;
        icons?: ExpanderIcons;
    }
    export interface ListToggleIcons {
        open?: string;
        close?: string;
    }
    export interface ListToggle {
        display?: boolean;
        icons?: ListToggleIcons;
    }
    export interface RowGap {
        top?: number;
        bottom?: number;
    }
    export interface ListRow {
        height?: number;
        gap?: RowGap;
    }
    export interface List {
        rows?: Rows;
        row?: ListRow;
        columns?: Columns;
        expander?: Expander;
        toggle?: ListToggle;
    }
    export interface ScrollPercent {
        top?: number;
        left?: number;
    }
    export interface ScrollType {
        size?: number;
        minInnerSize?: number;
        data?: Row | ChartTimeDate;
        posPx?: number;
        maxPosPx?: number;
        area?: number;
        lastPageSize?: number;
        lastPageCount?: number;
        dataIndex?: number;
        sub?: number;
        scrollArea?: number;
        innerSize?: number;
    }
    export interface ScrollTypeHorizontal extends ScrollType {
        data?: ChartTimeDate;
    }
    export interface ScrollTypeVertical extends ScrollType {
        data?: Row;
    }
    export interface Scroll {
        horizontal?: ScrollTypeHorizontal;
        vertical?: ScrollTypeVertical;
    }
    export interface ChartTimeDate extends DataChartTimeLevelDate {
    }
    export type ChartTimeDates = ChartTimeDate[];
    export type ChartTimeOnLevelDatesArgs = {
        dates: DataChartTimeLevel;
        time: DataChartTime;
        format: ChartCalendarFormat;
        level: ChartCalendarLevel;
        levelIndex: number;
    };
    export type ChartTimeOnLevelDates = (arg: ChartTimeOnLevelDatesArgs) => DataChartTimeLevel;
    export interface ChartTime {
        period?: Period;
        from?: number;
        readonly fromDate?: Dayjs;
        to?: number;
        readonly toDate?: Dayjs;
        finalFrom?: number;
        readonly finalFromDate?: Dayjs;
        finalTo?: number;
        readonly finalToDate?: Dayjs;
        zoom?: number;
        leftGlobal: number;
        readonly leftGlobalDate?: Dayjs;
        centerGlobal?: number;
        readonly centerGlobalDate?: Dayjs;
        rightGlobal?: number;
        readonly rightGlobalDate?: Dayjs;
        format?: ChartCalendarFormat;
        levels?: ChartTimeDates[];
        additionalSpaces?: ChartCalendarAdditionalSpaces;
        calculatedZoomMode?: boolean;
        onLevelDates?: ChartTimeOnLevelDates[];
        onCurrentViewLevelDates?: ChartTimeOnLevelDates[];
        readonly allDates?: ChartTimeDates[];
        forceUpdate?: boolean;
    }
    export interface DataChartTimeLevelDateCurrentView {
        leftPx: number;
        rightPx: number;
        width: number;
    }
    export interface DataChartTimeLevelDate {
        leftGlobal: number;
        leftGlobalDate: Dayjs;
        rightGlobal: number;
        rightGlobalDate: Dayjs;
        width: number;
        leftPx: number;
        rightPx: number;
        period: Period;
        formatted: string | htmlResult;
        current: boolean;
        next: boolean;
        previous: boolean;
        currentView?: DataChartTimeLevelDateCurrentView;
        leftPercent?: number;
        rightPercent?: number;
    }
    export type DataChartTimeLevel = DataChartTimeLevelDate[];
    export interface DataChartTime {
        period: Period;
        leftGlobal: number;
        leftGlobalDate: Dayjs;
        centerGlobal: number;
        centerGlobalDate: Dayjs;
        rightGlobal: number;
        rightGlobalDate: Dayjs;
        timePerPixel: number;
        from: number;
        fromDate: Dayjs;
        to: number;
        toDate: Dayjs;
        finalFrom: number;
        finalFromDate: Dayjs;
        finalTo: number;
        finalToDate: Dayjs;
        totalViewDurationMs: number;
        totalViewDurationPx: number;
        leftInner: number;
        rightInner: number;
        leftPx: number;
        rightPx: number;
        width?: number;
        scrollWidth?: number;
        zoom: number;
        format: ChartCalendarFormat;
        level: number;
        levels: DataChartTimeLevel[];
        additionalSpaces?: ChartCalendarAdditionalSpaces;
        calculatedZoomMode?: boolean;
        onLevelDates?: ChartTimeOnLevelDates[];
        onCurrentViewLevelDates?: ChartTimeOnLevelDates[];
        allDates?: ChartTimeDates[];
        forceUpdate?: boolean;
    }
    export interface ChartCalendarFormatArguments {
        timeStart: Dayjs;
        timeEnd: Dayjs;
        className: string;
        props: any;
        vido: any;
    }
    export type PeriodString = 'year' | 'month' | 'week' | 'day' | 'hour';
    export type Period = PeriodString | OpUnitType;
    export interface ChartCalendarFormat {
        zoomTo: number;
        period: Period;
        default?: boolean;
        className?: string;
        format: (args: ChartCalendarFormatArguments) => string | htmlResult;
    }
    export interface ChartCalendarAdditionalSpace {
        before: number;
        after: number;
        period: Period;
    }
    export interface ChartCalendarAdditionalSpaces {
        hour?: ChartCalendarAdditionalSpace;
        day?: ChartCalendarAdditionalSpace;
        week?: ChartCalendarAdditionalSpace;
        month?: ChartCalendarAdditionalSpace;
        year?: ChartCalendarAdditionalSpace;
    }
    export interface ChartCalendarLevel {
        formats?: ChartCalendarFormat[];
        main?: boolean;
        doNotUseCache?: boolean;
    }
    export interface ChartCalendar {
        levels?: ChartCalendarLevel[];
        expand?: boolean;
    }
    export interface ChartGridCell {
        onCreate: ((cell: any) => unknown)[];
    }
    export interface ChartGrid {
        cell?: ChartGridCell;
    }
    export interface ItemGap {
        top?: number;
        bottom?: number;
    }
    export interface DefaultItem {
        gap?: ItemGap;
        height?: number;
        top?: number;
    }
    export interface Chart {
        time?: ChartTime;
        calendar?: ChartCalendar;
        grid?: ChartGrid;
        items?: Items;
        item?: DefaultItem;
        spacing?: number;
    }
    export interface ClassNames {
        [componentName: string]: string;
    }
    export interface ActionFunctionResult {
        update?: (element: HTMLElement, data: unknown) => void;
        destroy?: (element: HTMLElement, data: unknown) => void;
    }
    export type Action = (element: HTMLElement, data: unknown) => ActionFunctionResult | void;
    export interface Actions {
        [name: string]: Action[];
    }
    export interface LocaleRelativeTime {
        future?: string;
        past?: string;
        s?: string;
        m?: string;
        mm?: string;
        h?: string;
        hh?: string;
        d?: string;
        dd?: string;
        M?: string;
        MM?: string;
        y?: string;
        yy?: string;
    }
    export interface LocaleFormats {
        LT?: string;
        LTS?: string;
        L?: string;
        LL?: string;
        LLL?: string;
        LLLL?: string;
        [key: string]: string;
    }
    export interface Locale {
        name?: string;
        weekdays?: string[];
        weekdaysShort?: string[];
        weekdaysMin?: string[];
        months?: string[];
        monthsShort?: string[];
        weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
        relativeTime?: LocaleRelativeTime;
        formats?: LocaleFormats;
        ordinal?: (n: number) => string;
    }
    export interface Config {
        plugins?: Plugin[];
        plugin?: unknown;
        innerHeight?: number;
        headerHeight?: number;
        components?: Components;
        wrappers?: Wrappers;
        slots?: Slots;
        list?: List;
        scroll?: Scroll;
        chart?: Chart;
        classNames?: ClassNames;
        actions?: Actions;
        locale?: Locale;
        utcMode?: boolean;
        usageStatistics?: boolean;
    }
    export interface TreeMapData {
        parents: string[];
        children: Row[];
        items: Item[];
    }
    export interface TreeMap {
        id: string;
        $data: TreeMapData;
    }
    export interface DataList {
        width: number;
        visibleRows: Row[];
    }
    export interface Dimensions {
        width: number;
        height: number;
    }
    export interface DataChartDimensions extends Dimensions {
        innerWidth: number;
    }
    export interface DataChart {
        dimensions: DataChartDimensions;
        visibleItems: Item[];
        time: DataChartTime;
    }
    export interface DataElements {
        [key: string]: HTMLElement;
    }
    export interface DataLoaded {
        [key: string]: boolean;
    }
    export interface Data {
        treeMap: TreeMap;
        flatTreeMap: string[];
        flatTreeMapById: Rows;
        list: DataList;
        dimensions: Dimensions;
        chart: DataChart;
        elements: DataElements;
        loaded: DataLoaded;
    }
    export interface Reason {
        name: string;
        oldValue?: unknown;
        newValue?: unknown;
    }
    export interface GSTCOptions {
        state: DeepState;
        element: HTMLElement;
        debug?: boolean;
    }
    function GSTC(options: GSTCOptions): {
        state: DeepState;
        app: any;
        api: any;
    };
    namespace GSTC {
        var api: {
            name: string;
            stateFromConfig: typeof import("api/Api").stateFromConfig;
            mergeDeep: typeof import("@neuronet.io/vido/helpers").mergeDeep;
            date(time: any): Dayjs;
            setPeriod(period: OpUnitType): number;
            dayjs: typeof import("dayjs");
        };
    }
    export default GSTC;
}
declare module "components/Main" {
    import { Vido } from "index";
    export default function Main(vido: Vido, props?: {}): (templateProps: any) => any;
}
declare module "components/ScrollBar" {
    import { Vido } from "index";
    export interface Props {
        type: 'horizontal' | 'vertical';
    }
    export default function ScrollBar(vido: Vido, props: Props): () => import("lit-html-optimised").TemplateResult;
}
declare module "components/List/List" {
    import { Vido } from "index";
    export default function List(vido: Vido, props?: {}): (templateProps: any) => any;
}
declare module "components/List/ListColumn" {
    import { Vido } from "index";
    export interface Props {
        columnId: string;
    }
    export default function ListColumn(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListColumnHeader" {
    import { Vido } from "index";
    export interface Props {
        columnId: string;
    }
    export default function ListColumnHeader(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListColumnHeaderResizer" {
    import { Vido } from "index";
    export interface Props {
        columnId: string;
    }
    export default function ListColumnHeaderResizer(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListColumnRow" {
    import { Vido } from "index";
    export interface Props {
        rowId: string;
        columnId: string;
    }
    export default function ListColumnRow(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListColumnRowExpander" {
    import { Row, Vido } from "index";
    export interface Props {
        row: Row;
    }
    export default function ListColumnRowExpander(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListColumnRowExpanderToggle" {
    import { Row, Vido } from "index";
    export interface Props {
        row: Row;
    }
    export default function ListColumnRowExpanderToggle(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/List/ListToggle" {
    import { Vido } from "index";
    export default function ListToggle(vido: Vido, props?: {}): (templateProps: any) => any;
}
declare module "components/Chart/Chart" {
    import { Vido } from "index";
    export default function Chart(vido: Vido, props?: {}): (templateProps: any) => any;
}
declare module "components/Chart/Calendar/ChartCalendar" {
    import { Vido } from "index";
    export default function ChartCalendar(vido: Vido, props: any): (templateProps: any) => any;
}
declare module "components/Chart/Calendar/ChartCalendarDate" {
    import { ChartTimeDate, Period, Vido } from "index";
    export interface Props {
        level: number;
        date: ChartTimeDate;
        period: Period;
    }
    export default function ChartCalendarDay(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimeline" {
    import { Vido } from "index";
    export default function ChartTimeline(vido: Vido, props: any): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimelineGrid" {
    import { Vido } from "index";
    export default function ChartTimelineGrid(vido: Vido, props: any): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimelineGridRow" {
    import { RowWithCells, Vido } from "index";
    export default function ChartTimelineGridRow(vido: Vido, props: RowWithCells): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimelineGridRowCell" {
    import { Row, ChartTimeDate, Vido } from "index";
    interface Props {
        row: Row;
        time: ChartTimeDate;
    }
    function ChartTimelineGridRowCell(vido: Vido, props: Props): (templateProps: any) => any;
    export default ChartTimelineGridRowCell;
}
declare module "components/Chart/Timeline/ChartTimelineItems" {
    import { Vido } from "index";
    export default function ChartTimelineItems(vido: Vido, props?: {}): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimelineItemsRow" {
    import { Row, Vido } from "index";
    export interface Props {
        row: Row;
    }
    export default function ChartTimelineItemsRow(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "components/Chart/Timeline/ChartTimelineItemsRowItem" {
    import { Row, Item, Vido } from "index";
    export interface Props {
        row: Row;
        item: Item;
    }
    export default function ChartTimelineItemsRowItem(vido: Vido, props: Props): (templateProps: any) => any;
}
declare module "default-config" {
    import { Config } from "index";
    export const actionNames: string[];
    function defaultConfig(): Config;
    export default defaultConfig;
}
declare module "plugins/CalendarScroll.plugin" {
    export interface Point {
        x: number;
        y: number;
    }
    export interface Options {
        enabled: boolean;
    }
    export function Plugin(options?: Options): (vidoInstance: any) => void;
}
declare module "plugins/ItemHold.plugin" {
    export interface Options {
        time?: number;
        movementThreshold?: number;
        action?: (element: HTMLElement, data: any) => void;
    }
    export default function ItemHold(options?: Options): (vido: any) => void;
}
declare module "plugins/TimelinePointer.plugin" {
    import { Vido } from "index";
    export const CELL = "chart-timeline-grid-row-cell";
    export type CELL_TYPE = 'chart-timeline-grid-row-cell';
    export const ITEM = "chart-timeline-items-row-item";
    export type ITEM_TYPE = 'chart-timeline-items-row-item';
    export interface PointerEvents {
        down: PointerEvent | null;
        move: PointerEvent | null;
        up: PointerEvent | null;
    }
    export interface Point {
        x: number;
        y: number;
    }
    export type PointerState = 'up' | 'down' | 'move';
    export interface PluginData {
        enabled: boolean;
        isMoving: boolean;
        pointerState: PointerState;
        currentTarget: HTMLElement | null;
        realTarget: HTMLElement | null;
        targetType: ITEM_TYPE | CELL_TYPE | '';
        targetData: any | null;
        events: PointerEvents;
        initialPosition: Point;
        currentPosition: Point;
    }
    export function Plugin(options?: {
        enabled: boolean;
    }): (vidoInstance: Vido) => () => void;
}
declare module "plugins/Selection.plugin" {
    import { ITEM, ITEM_TYPE, CELL, CELL_TYPE, Point, PointerState } from "plugins/TimelinePointer.plugin";
    import { Item, Cell, Vido } from "index";
    export interface Options {
        enabled?: boolean;
        cells?: boolean;
        items?: boolean;
        rows?: boolean;
        showOverlay?: boolean;
        canSelect?: (type: any, state: any, all: any) => any[];
        canDeselect?: (type: any, state: any, all: any) => any[];
    }
    export interface SelectionItems {
        [key: string]: Item[];
    }
    export interface SelectState {
        selecting?: SelectionItems;
        selected?: SelectionItems;
    }
    export interface Area {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    export interface Selection {
        [ITEM]: Item[];
        [CELL]: Cell[];
    }
    export interface PointerEvents {
        down: PointerEvent | null;
        move: PointerEvent | null;
        up: PointerEvent | null;
    }
    export interface PluginData extends Options {
        enabled: boolean;
        isSelecting: boolean;
        showOverlay: boolean;
        pointerState: PointerState;
        initialPosition: Point;
        currentPosition: Point;
        selectionArea: Area;
        selected: Selection;
        selecting: Selection;
        events: PointerEvents;
        targetType: ITEM_TYPE | CELL_TYPE | '';
    }
    export function Plugin(options?: Options): (vidoInstance: Vido) => () => void;
}
declare module "plugins/ItemMovement.plugin" {
    import { Item, DataChartTime, Scroll, DataChartDimensions, Vido } from "index";
    import { Point } from "plugins/TimelinePointer.plugin";
    import { Dayjs } from 'dayjs';
    export interface SnapArg {
        time: DataChartTime;
        scroll: Scroll;
        dimensions: DataChartDimensions;
        vido: Vido;
        movement: Movement;
    }
    export interface SnapStartArg extends SnapArg {
        startTime: Dayjs;
    }
    export interface SnapEndArg extends SnapArg {
        endTime: Dayjs;
    }
    export interface Options {
        enabled?: boolean;
        className?: string;
        onStart?: (items: Item[]) => void;
        onMove?: (items: Item[]) => void;
        onEnd?: (items: Item[]) => void;
        snapStart?: (snapStartArgs: SnapStartArg) => Dayjs;
        snapEnd?: (snapEndArgs: SnapEndArg) => Dayjs;
    }
    export interface MovementResult {
        horizontal: number;
        vertical: number;
    }
    export interface Movement {
        px: MovementResult;
        time: number;
    }
    export interface PluginData extends Options {
        moving: Item[];
        lastMoved: Item[];
        movement: Movement;
        lastPosition: Point;
        state: 'up' | 'down' | 'move';
        pointerMoved: boolean;
    }
    export interface MovingTime {
        time: Dayjs;
        position: number;
    }
    export function Plugin(options?: Options): (vidoInstance: Vido) => void;
}
declare module "plugins/ItemResizing.plugin" {
    import { Vido } from "index";
    import { Point } from "plugins/TimelinePointer.plugin";
    export interface Handle {
        width?: number;
        horizontalMargin?: number;
        verticalMargin?: number;
        outside?: boolean;
        onlyWhenSelected?: boolean;
    }
    export interface ItemInitial {
        id: string;
        left: number;
        width: number;
    }
    export interface Options {
        enabled?: boolean;
        handle?: Handle;
    }
    export interface PluginData extends Options {
        leftIsMoving: boolean;
        rightIsMoving: boolean;
        itemsInitial: ItemInitial[];
        initialPosition: Point;
        currentPosition: Point;
        movement: number;
    }
    export function Plugin(options?: Options): (vidoInstance: Vido) => void;
}
declare module "plugins/WeekendHighlight.plugin" {
    import { Vido } from "index";
    export interface Options {
        weekdays?: number[];
        className?: string;
    }
    export function Plugin(options?: Options): (vidoInstance: Vido) => () => void;
}
declare module "plugins/plugins" {
    import * as TimelinePointer from "plugins/TimelinePointer.plugin";
    import * as ItemHold from "plugins/ItemHold.plugin";
    import * as ItemMovement from "plugins/ItemMovement.plugin";
    import * as ItemResizing from "plugins/ItemResizing.plugin";
    import * as Selection from "plugins/Selection.plugin";
    import * as CalendarScroll from "plugins/CalendarScroll.plugin";
    import * as WeekendHighlight from "plugins/WeekendHighlight.plugin";
    const _default: {
        TimelinePointer: typeof TimelinePointer;
        ItemHold: typeof ItemHold;
        ItemMovement: typeof ItemMovement;
        ItemResizing: typeof ItemResizing;
        Selection: typeof Selection;
        CalendarScroll: typeof CalendarScroll;
        WeekendHighlight: typeof WeekendHighlight;
    };
    export default _default;
}
//# sourceMappingURL=index.d.ts.map