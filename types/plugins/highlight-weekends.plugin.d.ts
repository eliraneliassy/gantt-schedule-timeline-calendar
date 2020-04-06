import { Vido } from '@src/gstc';
export interface Options {
    weekdays?: number[];
    className?: string;
}
export declare function Plugin(options?: Options): (vidoInstance: Vido) => () => void;
//# sourceMappingURL=highlight-weekends.plugin.d.ts.map