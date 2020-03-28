import { lithtml } from '@neuronet.io/vido';
import { Dayjs, OpUnitType } from 'dayjs/index.d';

export interface RowInternal {
  parents: Row[];
  children: Row[];
  items: Item[];
}

export interface Row {
  id: string;
  parentId?: string;
  expanded?: boolean;
  height?: number;
  actualHeight?: number;
  outerHeight?: number;
  _internal?: RowInternal;
  top?: number;
  gap?: RowGap;
}

export interface Rows {
  [id: string]: Row;
}

export interface ItemTime {
  start: number;
  end: number;
}

export interface Item {
  id: string;
  rowId: string;
  time: ItemTime;
  label: string;
  height?: number;
  actualHeight?: number;
  outerHeight?: number;
  top?: number;
  gap?: ItemGap;
}

export interface Items {
  [id: string]: Item;
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
export type Wrapper = (input: htmlResult) => htmlResult;
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

export interface ChartTimeDate extends ChartInternalTimeLevelDate {}

export type ChartTimeDates = ChartTimeDate[];

export type ChartTimeOnLevelDatesArgs = {
  dates: ChartInternalTimeLevel;
  time: ChartInternalTime;
  format: ChartCalendarFormat;
  level: ChartCalendarLevel;
  levelIndex: number;
};

export type ChartTimeOnLevelDates = (arg: ChartTimeOnLevelDatesArgs) => ChartInternalTimeLevel;

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

export interface ChartInternalTimeLevelDateCurrentView {
  leftPx: number;
  rightPx: number;
  width: number;
}

export interface ChartInternalTimeLevelDate {
  leftGlobal: number;
  leftGlobalDate: Dayjs;
  rightGlobal: number;
  rightGlobalDate: Dayjs;
  width: number;
  leftPx: number;
  rightPx: number;
  period: Period;
  formatted: string;
  current: boolean;
  next: boolean;
  previous: boolean;
  currentView?: ChartInternalTimeLevelDateCurrentView;
  leftPercent?: number;
  rightPercent?: number;
}
export type ChartInternalTimeLevel = ChartInternalTimeLevelDate[];
export interface ChartInternalTime {
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
  levels: ChartInternalTimeLevel[];
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
  format: (arguments: ChartCalendarFormatArguments) => string | htmlResult;
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
export interface ChartGridBlock {
  onCreate: ((block) => unknown)[];
}
export interface ChartGrid {
  block?: ChartGridBlock;
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
