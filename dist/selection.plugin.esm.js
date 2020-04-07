/**
 * TimelinePointer plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
const CELL = 'chart-timeline-grid-row-cell';
const ITEM = 'chart-timeline-items-row-item';

/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function prepareOptions(options) {
    const defaultOptions = {
        enabled: true,
        cells: true,
        items: true,
        rows: false,
        showOverlay: true,
        canSelect(type, currently, all) {
            return currently;
        },
        canDeselect(type, currently, all) {
            return [];
        },
    };
    options = Object.assign(Object.assign({}, defaultOptions), options);
    return options;
}
const pluginPath = 'config.plugin.Selection';
function generateEmptyData(options) {
    return Object.assign({ enabled: true, showOverlay: true, isSelecting: false, pointerState: 'up', targetType: '', initialPosition: { x: 0, y: 0 }, currentPosition: { x: 0, y: 0 }, selectionArea: { x: 0, y: 0, width: 0, height: 0 }, selecting: {
            [ITEM]: [],
            [CELL]: [],
        }, selected: {
            [ITEM]: [],
            [CELL]: [],
        }, events: {
            down: null,
            move: null,
            up: null,
        } }, options);
}
class SelectionPlugin {
    constructor(vido, options) {
        this.unsub = [];
        this.vido = vido;
        this.state = vido.state;
        this.api = vido.api;
        this.options = options;
        this.data = generateEmptyData(options);
        this.wrapperClassName = this.api.getClass('chart-selection');
        this.wrapperStyleMap = new vido.StyleMap({ display: 'none' });
        this.html = vido.html;
        this.wrapper = this.wrapper.bind(this);
        this.unsub.push(this.state.subscribe('config.plugin.TimelinePointer', (timelinePointerData) => {
            this.poitnerData = timelinePointerData;
            this.onPointerData();
        }));
        this.updateData();
        this.unsub.push(this.state.subscribe(pluginPath, (value) => {
            this.data = value;
        }));
    }
    destroy() {
        this.unsub.forEach((unsub) => unsub());
    }
    updateData() {
        this.state.update(pluginPath, Object.assign({}, this.data));
        this.vido.update(); // draw selection area overlay
    }
    getItemsUnderSelectionArea() {
        return [];
    }
    getSelectionArea() {
        const area = { x: 0, y: 0, width: 0, height: 0 };
        const initial = Object.assign({}, this.poitnerData.initialPosition);
        const current = Object.assign({}, this.poitnerData.currentPosition);
        const width = current.x - initial.x;
        const height = current.y - initial.y;
        if (width >= 0) {
            area.x = initial.x;
            area.width = width;
        }
        else {
            area.x = current.x;
            area.width = Math.abs(width);
        }
        if (height >= 0) {
            area.y = initial.y;
            area.height = height;
        }
        else {
            area.y = current.y;
            area.height = Math.abs(height);
        }
        return area;
    }
    collectLinkedItems(item, current = []) {
        if (item.linkedWith && item.linkedWith.length) {
            const items = this.state.get('config.chart.items');
            for (const linkedItemId of item.linkedWith) {
                const linkedItem = items[linkedItemId];
                if (!current.includes(linkedItem)) {
                    current.push(linkedItem);
                    this.collectLinkedItems(linkedItem, current);
                }
            }
        }
        return current;
    }
    getSelected(item) {
        let selected;
        if (this.data.selected[ITEM].find((selectedItem) => selectedItem.id === item.id)) {
            selected = this.data.selected[ITEM];
        }
        else {
            if (this.poitnerData.events.down.ctrlKey) {
                selected = [...new Set([...this.data.selected[ITEM], ...this.collectLinkedItems(item, [item])]).values()];
            }
            else {
                selected = this.collectLinkedItems(item, [item]);
            }
        }
        return selected;
    }
    selectCells() {
        this.data.isSelecting = true;
        this.data.selectionArea = this.getSelectionArea();
        const selectingItems = this.getItemsUnderSelectionArea();
        if (selectingItems.length === 0) {
            this.state.update(`config.chart.items.*.selected`, false);
            this.data.selected[ITEM].length = 0;
        }
        // TODO save selecting items and cells
    }
    selectItems() {
        this.data.isSelecting = false;
        this.data.selectionArea = this.getSelectionArea();
        this.data.currentPosition = this.poitnerData.currentPosition;
        this.data.initialPosition = this.poitnerData.initialPosition;
        const item = this.poitnerData.targetData;
        this.data.selected[ITEM] = this.getSelected(item);
        let multi = this.state.multi();
        multi = multi.update(`config.chart.items.*.selected`, false);
        for (const item of this.data.selected[ITEM]) {
            multi = multi.update(`config.chart.items.${item.id}.selected`, true);
        }
        multi.done();
    }
    onPointerData() {
        if (this.poitnerData.isMoving && this.poitnerData.targetType === CELL) {
            this.selectCells();
        }
        else if (this.poitnerData.isMoving && this.poitnerData.targetType === ITEM) {
            this.selectItems();
        }
        else if (!this.poitnerData.isMoving) {
            this.data.isSelecting = false;
        }
        this.data.events = this.poitnerData.events;
        this.data.pointerState = this.poitnerData.pointerState;
        this.data.targetType = this.poitnerData.targetType;
        this.updateData();
    }
    wrapper(input, props) {
        const oldContent = this.oldWrapper(input, props);
        let shouldDetach = true;
        if (this.data.enabled && this.data.isSelecting && this.data.showOverlay) {
            this.wrapperStyleMap.style.display = 'block';
            this.wrapperStyleMap.style.left = this.data.selectionArea.x + 'px';
            this.wrapperStyleMap.style.top = this.data.selectionArea.y + 'px';
            this.wrapperStyleMap.style.width = this.data.selectionArea.width + 'px';
            this.wrapperStyleMap.style.height = this.data.selectionArea.height + 'px';
            shouldDetach = false;
        }
        const detach = new this.vido.Detach(() => shouldDetach);
        return this
            .html ` ${oldContent}<div class=${this.wrapperClassName} detach=${detach} style=${this.wrapperStyleMap}></div>`;
    }
    getWrapper(oldWrapper) {
        if (!this.oldWrapper)
            this.oldWrapper = oldWrapper;
        return this.wrapper;
    }
}
function Plugin(options = {}) {
    options = prepareOptions(options);
    return function initialize(vidoInstance) {
        const selectionPlugin = new SelectionPlugin(vidoInstance, options);
        vidoInstance.state.update(pluginPath, generateEmptyData(options));
        vidoInstance.state.update('config.wrappers.ChartTimelineItems', (oldWrapper) => {
            return selectionPlugin.getWrapper(oldWrapper);
        });
        return function destroy() {
            selectionPlugin.destroy();
        };
    };
}

export { Plugin };
//# sourceMappingURL=selection.plugin.esm.js.map
