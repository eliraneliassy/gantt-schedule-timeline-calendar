import { Vido, htmlResult, Item, DataChartTime } from '../gstc';
import { Point } from './timeline-pointer.plugin';
import { Dayjs } from 'dayjs';
export interface Handle {
    width?: number;
    horizontalMargin?: number;
    verticalMargin?: number;
    outside?: boolean;
    onlyWhenSelected?: boolean;
}
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
export interface Movement {
    px: number;
    time: number;
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
    handle?: Handle;
    content?: htmlResult;
    bodyClass?: string;
    bodyClassLeft?: string;
    bodyClassRight?: string;
    onStart?: (onArg: OnArg) => boolean;
    onMove?: (onArg: OnArg) => boolean;
    onEnd?: (onArg: OnArg) => boolean;
    snapToTime?: SnapToTime;
}
export interface PluginData extends Options {
    leftIsMoving: boolean;
    rightIsMoving: boolean;
    initialItems: Item[];
    initialPosition: Point;
    currentPosition: Point;
    movement: Movement;
}
export declare function Plugin(options?: Options): (vidoInstance: Vido) => void;
//# sourceMappingURL=item-resizing.plugin.d.ts.map