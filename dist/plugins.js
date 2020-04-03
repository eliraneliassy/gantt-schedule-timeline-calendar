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
function Plugin(options = { enabled: true }) {
    let vido, api, state;
    const pluginPath = 'config.plugin.TimelinePointer';
    const classNames = {
        cell: '',
        item: ''
    };
    function generateEmptyData() {
        return {
            enabled: options.enabled,
            isMoving: false,
            pointerState: 'up',
            currentTarget: null,
            realTarget: null,
            targetType: '',
            targetData: null,
            initialPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            events: {
                down: null,
                move: null,
                up: null
            }
        };
    }
    let chartTimelineElement;
    class TimelinePointerAction {
        constructor(element) {
            this.unsub = [];
            this.pointerDown = this.pointerDown.bind(this);
            this.pointerMove = this.pointerMove.bind(this);
            this.pointerUp = this.pointerUp.bind(this);
            this.data = generateEmptyData();
            element.addEventListener('pointerdown', this.pointerDown);
            document.addEventListener('pointerup', this.pointerUp);
            document.addEventListener('pointermove', this.pointerMove);
            this.unsub.push(state.subscribe(pluginPath, value => (this.data = value)));
        }
        destroy(element) {
            element.removeEventListener('pointerdown', this.pointerDown);
            document.removeEventListener('pointerup', this.pointerUp);
            document.removeEventListener('pointermove', this.pointerMove);
        }
        updateData() {
            state.update(pluginPath, () => (Object.assign({}, this.data)));
        }
        getRealTarget(ev) {
            let realTarget = ev.target.closest('.' + classNames.item);
            if (realTarget) {
                return realTarget;
            }
            realTarget = ev.target.closest('.' + classNames.cell);
            if (realTarget) {
                return realTarget;
            }
            return null;
        }
        getRealPosition(ev) {
            const pos = { x: 0, y: 0 };
            if (chartTimelineElement) {
                const bounding = chartTimelineElement.getBoundingClientRect();
                pos.x = ev.x - bounding.x;
                pos.y = ev.y - bounding.y;
            }
            return pos;
        }
        pointerDown(ev) {
            if (!this.data.enabled)
                return;
            this.data.pointerState = 'down';
            this.data.currentTarget = ev.target;
            this.data.realTarget = this.getRealTarget(ev);
            if (this.data.realTarget) {
                if (this.data.realTarget.classList.contains(classNames.item)) {
                    this.data.targetType = ITEM;
                    // @ts-ignore
                    this.data.targetData = this.data.realTarget.vido.item;
                }
                else if (this.data.realTarget.classList.contains(classNames.cell)) {
                    this.data.targetType = CELL;
                    // @ts-ignore
                    this.data.targetData = this.data.realTarget.vido;
                }
                else {
                    this.data.targetType = '';
                }
            }
            else {
                this.data.targetType = '';
                this.data.targetData = null;
            }
            this.data.isMoving = !!this.data.realTarget;
            this.data.events.down = ev;
            this.data.events.move = ev;
            const realPosition = this.getRealPosition(ev);
            this.data.initialPosition = realPosition;
            this.data.currentPosition = realPosition;
            this.updateData();
        }
        pointerUp(ev) {
            if (!this.data.enabled)
                return;
            this.data.pointerState = 'up';
            this.data.isMoving = false;
            this.data.events.up = ev;
            this.data.currentPosition = this.getRealPosition(ev);
            this.updateData();
        }
        pointerMove(ev) {
            if (!this.data.enabled || !this.data.isMoving)
                return;
            this.data.pointerState = 'move';
            this.data.events.move = ev;
            this.data.currentPosition = this.getRealPosition(ev);
            this.updateData();
        }
    }
    return function initialize(vidoInstance) {
        vido = vidoInstance;
        api = vido.api;
        state = vido.state;
        classNames.cell = api.getClass(CELL);
        classNames.item = api.getClass(ITEM);
        const unsub = state.subscribe('$data.elements.chart-timeline', el => (chartTimelineElement = el));
        state.update('config.actions.chart-timeline', timelineActions => {
            timelineActions.push(TimelinePointerAction);
            return timelineActions;
        });
        state.update(pluginPath, data => {
            return generateEmptyData();
        });
        return function destroy() {
            unsub();
        };
    };
}

var TimelinePointer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CELL: CELL,
  ITEM: ITEM,
  Plugin: Plugin
});

/**
 * ItemHold plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function ItemHold(options = {}) {
    let api;
    const defaultOptions = {
        time: 1000,
        movementThreshold: 2,
        action(element, data) { }
    };
    options = Object.assign(Object.assign({}, defaultOptions), options);
    const holding = {};
    const pointer = { x: 0, y: 0 };
    function onPointerDown(item, element, event) {
        if (typeof holding[item.id] === 'undefined') {
            holding[item.id] = { x: event.x, y: event.y };
            event.stopPropagation();
            event.preventDefault();
            setTimeout(() => {
                if (typeof holding[item.id] !== 'undefined') {
                    let exec = true;
                    const xMovement = Math.abs(holding[item.id].x - pointer.x);
                    const yMovement = Math.abs(holding[item.id].y - pointer.y);
                    if (xMovement > options.movementThreshold) {
                        exec = false;
                    }
                    if (yMovement > options.movementThreshold) {
                        exec = false;
                    }
                    delete holding[item.id];
                    if (exec) {
                        options.action(element, item);
                    }
                }
            }, options.time);
        }
    }
    function onPointerUp(itemId) {
        if (typeof holding[itemId] !== 'undefined') {
            delete holding[itemId];
        }
    }
    function action(element, data) {
        function elementPointerDown(event) {
            onPointerDown(data.item, element, event);
        }
        element.addEventListener('pointerdown', elementPointerDown);
        function pointerUp() {
            onPointerUp(data.item.id);
        }
        document.addEventListener('pointerup', pointerUp);
        function onPointerMove(event) {
            pointer.x = event.x;
            pointer.y = event.y;
        }
        document.addEventListener('pointermove', onPointerMove);
        return {
            update(element, changedData) {
                data = changedData;
            },
            destroy(element, data) {
                document.removeEventListener('pointerup', onPointerUp);
                document.removeEventListener('poitnermove', onPointerMove);
                element.removeEventListener('pointerdown', elementPointerDown);
            }
        };
    }
    return function initialize(vido) {
        api = vido.api;
        vido.state.update('config.actions.chart-timeline-items-row-item', actions => {
            actions.push(action);
            return actions;
        });
    };
}

var ItemHold$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': ItemHold
});

/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function prepareOptions(options) {
    return Object.assign({ enabled: true, className: '' }, options);
}
const pluginPath = 'config.plugin.ItemMovement';
function gemerateEmptyPluginData(options) {
    return Object.assign({ moving: [], lastMoved: [], state: 'up', pointerMoved: false, lastPosition: { x: 0, y: 0 }, movement: {
            px: { horizontal: 0, vertical: 0 },
            time: 0
        }, onStart() { },
        onMove() { },
        onEnd() { },
        snapStart({ startTime, time }) {
            return startTime.startOf(time.period);
        },
        snapEnd({ endTime, time }) {
            return endTime.endOf(time.period);
        } }, options);
}
class ItemMovement {
    constructor(vido) {
        this.onDestroy = [];
        this.vido = vido;
        this.api = vido.api;
        this.state = vido.state;
        this.onDestroy.push(this.state.subscribe(pluginPath, data => (this.data = data)));
        if (!this.data.className)
            this.data.className = this.api.getClass('chart-timeline-items-row-item--moving');
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onDestroy.push(this.state.subscribe('config.plugin.Selection', this.onSelectionChange));
    }
    destroy() {
        this.onDestroy.forEach(unsub => unsub());
    }
    updateData() {
        this.state.update(pluginPath, this.data);
    }
    getItemMovingTime(item, time) {
        const horizontal = this.data.movement.px.horizontal;
        const x = item.$data.position.left + horizontal;
        const leftGlobal = Math.round(this.api.time.getTimeFromViewOffsetPx(x, time));
        return {
            time: this.api.time.date(leftGlobal),
            position: x
        };
    }
    moveItems() {
        const time = this.state.get('$data.chart.time');
        for (const item of this.data.lastMoved) {
            const start = this.getItemMovingTime(item, time);
            let newItemTime;
            this.state
                .multi()
                .update(`config.chart.items.${item.id}.time`, (itemTime) => {
                const newStartTime = start.time.valueOf();
                const diff = newStartTime - itemTime.start;
                itemTime.start = newStartTime;
                itemTime.end += diff;
                newItemTime = Object.assign({}, itemTime);
                return itemTime;
            })
                .update(`config.chart.items.${item.id}.$data`, (itemData) => {
                itemData.time.startDate = start.time;
                itemData.time.endDate = this.api.time.date(newItemTime.end);
                itemData.position.left = start.position;
                itemData.position.actualLeft = this.api.time.limitOffsetPxToView(start.position);
                itemData.position.right = itemData.position.left + itemData.width;
                itemData.position.actualRight = this.api.time.limitOffsetPxToView(itemData.position.right);
                itemData.actualWidth = itemData.position.actualRight - itemData.position.actualLeft;
                return itemData;
            })
                .done();
        }
    }
    clearSelection() {
        this.data.moving = [];
        this.data.lastMoved = [];
        this.data.movement.px.horizontal = 0;
        this.data.movement.px.vertical = 0;
        this.data.movement.time = 0;
        this.data.state = 'up';
        this.data.pointerMoved = false;
    }
    updatePointerState() {
        if (this.data.state === 'up' && this.selection.pointerState === 'down') {
            this.data.onStart(this.data.moving);
        }
        else if ((this.data.state === 'down' || this.data.state === 'move') && this.selection.pointerState === 'up') {
            this.data.moving = [];
            this.data.onEnd(this.data.lastMoved);
            this.clearSelection();
        }
        else if (this.selection.pointerState === 'move') {
            if (this.data.movement.px.horizontal || this.data.movement.px.vertical) {
                this.data.pointerMoved = true;
            }
            this.data.onMove(this.data.moving);
        }
        this.data.state = this.selection.pointerState;
    }
    onStart() {
        this.data.lastPosition = Object.assign({}, this.selection.currentPosition);
    }
    onSelectionChange(data) {
        if (!this.data.enabled)
            return;
        this.selection = data;
        if (this.selection.targetType !== ITEM) {
            return this.clearSelection();
        }
        if (this.selection.events.move) {
            this.selection.events.move.preventDefault();
            this.selection.events.move.stopPropagation();
        }
        if (this.selection.events.down) {
            this.selection.events.down.preventDefault();
            this.selection.events.down.stopPropagation();
        }
        if (this.data.state === 'up' && this.selection.pointerState === 'down') {
            this.onStart();
        }
        this.data.moving = [...this.selection.selected[ITEM]];
        if (this.data.moving.length)
            this.data.lastMoved = [...this.data.moving];
        this.data.movement.px.horizontal = this.selection.currentPosition.x - this.data.lastPosition.x;
        this.data.movement.px.vertical = this.selection.currentPosition.y - this.data.lastPosition.y;
        this.data.lastPosition.x = this.selection.currentPosition.x;
        this.data.lastPosition.y = this.selection.currentPosition.y;
        this.updatePointerState();
        this.moveItems();
        this.updateData();
    }
}
function Plugin$1(options = {}) {
    return function initialize(vidoInstance) {
        vidoInstance.state.update(pluginPath, gemerateEmptyPluginData(prepareOptions(options)));
        new ItemMovement(vidoInstance);
    };
}

var ItemMovement$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Plugin: Plugin$1
});

/**
 * Selection ChartTimeline Wrapper
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
let wrapped, vido, api, state, html;
let pluginData;
let className, styleMap;
// this function will be called at each rerender
function ChartTimelineWrapper(input, props) {
    const oldContent = wrapped(input, props);
    if (pluginData.isSelecting) {
        styleMap.style.display = 'block';
        styleMap.style.left = pluginData.selectionArea.x + 'px';
        styleMap.style.top = pluginData.selectionArea.y + 'px';
        styleMap.style.width = pluginData.selectionArea.width + 'px';
        styleMap.style.height = pluginData.selectionArea.height + 'px';
    }
    else {
        styleMap.style.display = 'none';
    }
    const SelectionRectangle = html `
    <div class=${className} style=${styleMap}></div>
  `;
    return html `
    ${oldContent}${SelectionRectangle}
  `;
}
function Wrap(oldWrapper, vidoInstance) {
    wrapped = oldWrapper;
    vido = vidoInstance;
    api = vido.api;
    state = vido.state;
    html = vido.html;
    className = api.getClass('chart-selection');
    styleMap = new vido.StyleMap({ display: 'none' });
    vido.onDestroy(state.subscribe('config.plugin.Selection', (PluginData) => {
        pluginData = PluginData;
        vido.update(); // rerender to update rectangle
    }));
    return ChartTimelineWrapper;
}

/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function prepareOptions$1(options) {
    const defaultOptions = {
        enabled: true,
        grid: false,
        items: true,
        rows: false,
        horizontal: true,
        vertical: true,
        selecting() { },
        deselecting() { },
        selected() { },
        deselected() { },
        canSelect(type, currently, all) {
            return currently;
        },
        canDeselect(type, currently, all) {
            return [];
        }
    };
    options = Object.assign(Object.assign({}, defaultOptions), options);
    return options;
}
const pluginPath$1 = 'config.plugin.Selection';
function generateEmptyData() {
    return {
        enabled: true,
        isSelecting: false,
        pointerState: 'up',
        targetType: '',
        initialPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        selectionArea: { x: 0, y: 0, width: 0, height: 0 },
        selecting: {
            [ITEM]: [],
            [CELL]: []
        },
        selected: {
            [ITEM]: [],
            [CELL]: []
        },
        events: {
            down: null,
            move: null,
            up: null
        }
    };
}
class SelectionPlugin {
    constructor(vido, options) {
        this.unsub = [];
        this.vido = vido;
        this.state = vido.state;
        this.api = vido.api;
        this.options = options;
        this.data = generateEmptyData();
        this.unsub.push(this.state.subscribe('config.plugin.TimelinePointer', timelinePointerData => {
            this.poitnerData = timelinePointerData;
            this.onPointerData();
        }));
        this.updateData();
        this.unsub.push(this.state.subscribe(pluginPath$1, value => {
            this.data = value;
        }));
    }
    destroy() {
        this.unsub.forEach(unsub => unsub());
    }
    updateData() {
        this.state.update(pluginPath$1, Object.assign({}, this.data));
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
                current.push(linkedItem);
                this.collectLinkedItems(linkedItem, current);
            }
        }
        return current;
    }
    getSelected(item) {
        let selected;
        if (this.data.selected[ITEM].find(selectedItem => selectedItem.id === item.id)) {
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
}
function Plugin$2(options = {}) {
    options = prepareOptions$1(options);
    return function initialize(vidoInstance) {
        const selectionPlugin = new SelectionPlugin(vidoInstance, options);
        vidoInstance.state.update(pluginPath$1, generateEmptyData());
        vidoInstance.state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
            return Wrap(oldWrapper, vidoInstance);
        });
        return function destroy() {
            selectionPlugin.destroy();
        };
    };
}

var Selection = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Plugin: Plugin$2
});

/**
 * CalendarScroll plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
const defaultOptions = {
    enabled: true
};
function Plugin$3(options = defaultOptions) {
    let vido, api, state;
    let enabled = options.enabled;
    class ChartAction {
        constructor(element) {
            this.moving = false;
            this.initialDataIndex = { x: 0, y: 0 };
            this.lastPos = 0;
            this.pointerDown = this.pointerDown.bind(this);
            this.pointerUp = this.pointerUp.bind(this);
            this.pointerMove = vido.schedule(this.pointerMove.bind(this));
            element.addEventListener('pointerdown', this.pointerDown);
            document.addEventListener('pointermove', this.pointerMove, { passive: true });
            document.addEventListener('pointerup', this.pointerUp);
            element.style.cursor = 'grab';
        }
        destroy(element) {
            element.removeEventListener('pointerdown', this.pointerDown);
            document.removeEventListener('pointermove', this.pointerMove);
            document.removeEventListener('pointerup', this.pointerUp);
        }
        resetInitialPoint(ev) {
            this.initialPoint = { x: ev.screenX, y: ev.screenY };
        }
        pointerDown(ev) {
            if (!enabled)
                return;
            this.moving = true;
            this.resetInitialPoint(ev);
            const scroll = state.get('config.scroll');
            this.initialDataIndex = { x: scroll.horizontal.dataIndex || 0, y: scroll.vertical.dataIndex || 0 };
        }
        pointerUp(ev) {
            if (!enabled)
                return;
            if (this.moving) {
                this.moving = false;
            }
        }
        handleHorizontalMovement(diff, ev) {
            const time = state.get('$data.chart.time');
            if (diff.x > 0) {
                // go backward - move dates forward
                if (this.initialDataIndex.x === 0) {
                    return this.resetInitialPoint(ev);
                }
                const allDates = time.allDates[time.level];
                let i = this.initialDataIndex.x - 1;
                let width = 0;
                for (; i > 0; i--) {
                    const date = allDates[i];
                    width += date.width;
                    if (width >= diff.x)
                        break;
                }
                api.scrollToTime(allDates[i].leftGlobal, false);
            }
            else if (diff.x < 0) {
                // go forward - move dates backward
                let i = this.initialDataIndex.x;
                const hScroll = state.get('config.scroll.horizontal');
                const allDates = time.allDates[time.level];
                if (i - 1 >= allDates.length - hScroll.lastPageCount) {
                    return this.resetInitialPoint(ev);
                }
                let width = 0;
                for (let len = allDates.length; i < len; i++) {
                    const date = allDates[i];
                    width += date.width;
                    if (-width <= diff.x)
                        break;
                }
                if (i - 1 >= allDates.length - hScroll.lastPageCount) {
                    return;
                }
                api.scrollToTime(allDates[i].leftGlobal, false);
            }
        }
        pointerMove(ev) {
            if (!enabled || !this.moving)
                return;
            const diffX = ev.screenX - this.initialPoint.x;
            const diffY = ev.screenY - this.initialPoint.y;
            const diff = { x: diffX, y: diffY };
            this.handleHorizontalMovement(diff, ev);
        }
    }
    return function initialize(vidoInstance) {
        vido = vidoInstance;
        api = vido.api;
        state = vido.state;
        state.update('config.plugin.CalendarScroll', options);
        state.subscribe('config.plugin.CalendarScroll.enabled', value => (enabled = value));
        state.update('config.actions.chart-calendar', chartActions => {
            chartActions.push(ChartAction);
            return chartActions;
        });
    };
}

var CalendarScroll = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Plugin: Plugin$3
});

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * Used to clone existing node instead of each time creating new one which is
 * slower
 */
const markerNode = document.createComment('');

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Used to clone existing node instead of each time creating new one which is
 * slower
 */
const emptyTemplateNode = document.createElement('template');

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Used to clone text node instead of each time creating new one which is slower
 */
const emptyTextNode = document.createTextNode('');
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
        // noop
    }
})();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
const isBrowser = typeof window !== 'undefined';
if (isBrowser) {
    // If we run in the browser set version
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.7');
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __asyncValues = (undefined && undefined.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __asyncValues$1 = (undefined && undefined.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Used to clone existing node instead of each time creating new one which is
 * slower
 */
const emptyTemplateNode$1 = document.createElement('template');

class Action {
    constructor() {
        this.isAction = true;
    }
}
Action.prototype.isAction = true;

const defaultOptions$1 = {
    element: document.createTextNode(''),
    axis: 'xy',
    threshold: 10,
    onDown(data) { },
    onMove(data) { },
    onUp(data) { },
    onWheel(data) { }
};

/**
 * Weekend highlight plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function Plugin$4(options = {}) {
    const weekdays = options.weekdays || [6, 0];
    let className;
    let api;
    let enabled = true;
    class WeekendHighlightAction extends Action {
        constructor(element, data) {
            super();
            this.highlight(element, data.time.leftGlobal);
        }
        update(element, data) {
            this.highlight(element, data.time.leftGlobal);
        }
        highlight(element, time) {
            const hasClass = element.classList.contains(className);
            if (!enabled) {
                if (hasClass) {
                    element.classList.remove(className);
                }
                return;
            }
            const isWeekend = weekdays.includes(api.time.date(time).day());
            if (!hasClass && isWeekend) {
                element.classList.add(className);
            }
            else if (hasClass && !isWeekend) {
                element.classList.remove(className);
            }
        }
    }
    return function initialize(vidoInstance) {
        api = vidoInstance.api;
        className = options.className || api.getClass('chart-timeline-grid-row-cell') + '--weekend';
        const destroy = vidoInstance.state.subscribe('$data.chart.time.format.period', period => (enabled = period === 'day'));
        vidoInstance.state.update('config.actions.chart-timeline-grid-row-cell', actions => {
            actions.push(WeekendHighlightAction);
            return actions;
        });
        return function onDestroy() {
            destroy();
        };
    };
}

var WeekendHighlight = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Plugin: Plugin$4
});

var plugins = { TimelinePointer, ItemHold: ItemHold$1, ItemMovement: ItemMovement$1, Selection, CalendarScroll, WeekendHighlight };

export default plugins;
//# sourceMappingURL=plugins.js.map
