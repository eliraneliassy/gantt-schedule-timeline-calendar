import { ITEM, ITEM_TYPE, CELL, CELL_TYPE, Point, PointerState } from './timeline-pointer.plugin';
import { Item, Cell, Vido } from '../gstc';
export declare type ModKey = 'shift' | 'ctrl' | 'alt' | '';
export interface Options {
    enabled?: boolean;
    cells?: boolean;
    items?: boolean;
    rows?: boolean;
    showOverlay?: boolean;
    selectKey?: ModKey;
    multiKey?: ModKey;
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
    selectionAreaLocal: Area;
    selectionAreaGlobal: Area;
    selected: Selection;
    selecting: Selection;
    events: PointerEvents;
    targetType: ITEM_TYPE | CELL_TYPE | '';
}
export declare function Plugin(options?: Options): (vidoInstance: Vido) => () => void;
//# sourceMappingURL=selection.plugin.d.ts.map