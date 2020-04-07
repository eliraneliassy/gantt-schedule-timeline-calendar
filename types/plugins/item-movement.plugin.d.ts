import { Item, DataChartTime, Scroll, DataChartDimensions, Vido } from '../gstc';
import { Point } from './timeline-pointer.plugin';
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
    bodyClass?: string;
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
export declare function Plugin(options?: Options): (vidoInstance: Vido) => void;
//# sourceMappingURL=item-movement.plugin.d.ts.map