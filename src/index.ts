/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import 'pepjs';
import Vido from '@neuronet.io/vido/vido';
//import Vido from '../../vido/vido';
import { publicApi, Api } from './api/Api';
import Main from './components/Main';

import { vido, lithtml } from '@neuronet.io/vido/vido.d';
import { Dayjs, OpUnitType } from 'dayjs';
import { Properties as CSSProps } from 'csstype';
import DeepState from 'deep-state-observer';

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

export interface ChartTimeDate extends DataChartTimeLevelDate {}

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
  onCreate: ((cell) => unknown)[];
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

function GSTC(options: GSTCOptions) {
  const state = options.state;
  const api = new Api(state);
  const $data: Data = {
    treeMap: { id: '', $data: { children: [], parents: [], items: [] } },
    flatTreeMap: [],
    flatTreeMapById: {},
    list: {
      visibleRows: [],
      width: 0,
    },
    dimensions: {
      width: 0,
      height: 0,
    },
    chart: {
      dimensions: {
        width: 0,
        innerWidth: 0,
        height: 0,
      },
      visibleItems: [],
      time: {
        zoom: 0,
        format: {
          period: 'day',
          zoomTo: 0,
          format() {
            return '';
          },
        },
        level: 0,
        levels: [],
        timePerPixel: 0,
        totalViewDurationMs: 0,
        totalViewDurationPx: 0,
        leftGlobal: 0,
        rightGlobal: 0,
        leftPx: 0,
        rightPx: 0,
        leftInner: 0,
        rightInner: 0,
        period: 'day',
        leftGlobalDate: null,
        rightGlobalDate: null,
        centerGlobal: 0,
        centerGlobalDate: null,
        from: 0,
        to: 0,
        fromDate: null,
        toDate: null,
        finalFrom: null,
        finalTo: null,
        finalFromDate: null,
        finalToDate: null,
      },
    },
    elements: {},
    loaded: {},
  };
  if (typeof options.debug === 'boolean' && options.debug) {
    // @ts-ignore
    window.state = state;
  }

  state.update('', (oldValue) => {
    return {
      config: oldValue.config,
      $data,
    };
  });
  // @ts-ignore
  const vido: Vido = new Vido(state, api);
  api.setVido(vido);
  // @ts-ignore
  const app = vido.createApp({ component: Main, props: {}, element: options.element });
  const internalApi = app.vidoInstance.api;
  return { state, app, api: internalApi };
}

GSTC.api = publicApi;
export default GSTC;
