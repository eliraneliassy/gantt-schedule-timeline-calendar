import { Vido } from '@src/gstc';
import { Point } from './timeline-pointer.plugin';
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
export declare function Plugin(options?: Options): (vidoInstance: Vido) => void;
//# sourceMappingURL=item-resizing.plugin.d.ts.map