import { Item, DataChartTime, Vido, Row } from '../gstc';
import { Point } from './timeline-pointer.plugin';
import { Dayjs } from 'dayjs';
export interface SnapArg {
    item: Item;
    time: DataChartTime;
    vido: Vido;
    movement: Movement;
}
export interface SnapStartArg extends SnapArg {
    startTime: Dayjs;
}
export interface SnapEndArg extends SnapArg {
    endTime: Dayjs;
}
export interface OnArg {
    items: Item[];
    vido: Vido;
    time: DataChartTime;
    movement: Movement;
}
export interface SnapToTime {
    start?: (snapStartArgs: SnapStartArg) => Dayjs;
    end?: (snapEndArgs: SnapEndArg) => Dayjs;
}
export interface Options {
    enabled?: boolean;
    className?: string;
    bodyClass?: string;
    bodyClassMoving?: string;
    onStart?: (onArg: OnArg) => boolean;
    onMove?: (onArg: OnArg) => boolean;
    onEnd?: (onArg: OnArg) => boolean;
    onRowChange?: (item: Item, newRow: Row) => boolean;
    snapToTime?: SnapToTime;
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
    initialItems: Item[];
    movement: Movement;
    lastPosition: Point;
    pointerState: 'up' | 'down' | 'move';
    state: State;
    pointerMoved: boolean;
}
export interface MovingTimes {
    startTime: Dayjs;
    endTime: Dayjs;
}
export declare type State = '' | 'start' | 'end' | 'move';
export interface Cumulation {
    start: number;
    end: number;
}
export interface Cumulations {
    [key: string]: Cumulation;
}
export declare function Plugin(options?: Options): (vidoInstance: Vido) => void;
//# sourceMappingURL=item-movement.plugin.d.ts.map