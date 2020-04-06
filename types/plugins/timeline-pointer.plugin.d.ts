import { Vido } from '@src/gstc';
export declare const CELL = "chart-timeline-grid-row-cell";
export declare type CELL_TYPE = 'chart-timeline-grid-row-cell';
export declare const ITEM = "chart-timeline-items-row-item";
export declare type ITEM_TYPE = 'chart-timeline-items-row-item';
export interface PointerEvents {
    down: PointerEvent | null;
    move: PointerEvent | null;
    up: PointerEvent | null;
}
export interface Point {
    x: number;
    y: number;
}
export declare type PointerState = 'up' | 'down' | 'move';
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
export declare function Plugin(options?: {
    enabled: boolean;
}): (vidoInstance: Vido) => () => void;
//# sourceMappingURL=timeline-pointer.plugin.d.ts.map