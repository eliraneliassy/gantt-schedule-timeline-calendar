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

/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
function ItemMovement(options = {}) {
    const defaultOptions = {
        moveable: true,
        resizable: true,
        resizerContent: '',
        collisionDetection: true,
        outOfBorders: false,
        snapStart(timeStart, startDiff) {
            return timeStart + startDiff;
        },
        snapEnd(timeEnd, endDiff) {
            return timeEnd + endDiff;
        },
        ghostNode: true,
        wait: 0
    };
    options = Object.assign(Object.assign({}, defaultOptions), options);
    const movementState = {};
    /**
     * Add moving functionality to items as action
     *
     * @param {HTMLElement} element DOM Node
     * @param {Object} data
     */
    function ItemAction(element, data) {
        if (!options.moveable && !options.resizable) {
            return;
        }
        const state = data.state;
        const api = data.api;
        function isMoveable(data) {
            let moveable = options.moveable;
            if (data.item.hasOwnProperty('moveable') && moveable) {
                moveable = data.item.moveable;
            }
            if (data.row.hasOwnProperty('moveable') && moveable) {
                moveable = data.row.moveable;
            }
            return moveable;
        }
        function isResizable(data) {
            let resizable = options.resizable && (!data.item.hasOwnProperty('resizable') || data.item.resizable === true);
            if (data.row.hasOwnProperty('resizable') && resizable) {
                resizable = data.row.resizable;
            }
            return resizable;
        }
        function getMovement(data) {
            const itemId = data.item.id;
            if (typeof movementState[itemId] === 'undefined') {
                movementState[itemId] = { moving: false, resizing: false, waiting: false };
            }
            return movementState[itemId];
        }
        function saveMovement(itemId, movement) {
            state.update(`config.plugin.ItemMovement.item`, Object.assign({ id: itemId }, movement));
            state.update('config.plugin.ItemMovement.movement', (current) => {
                if (!current) {
                    current = { moving: false, waiting: false, resizing: false };
                }
                current.moving = movement.moving;
                current.waiting = movement.waiting;
                current.resizing = movement.resizing;
                return current;
            });
        }
        function createGhost(data, normalized, ganttLeft, ganttTop) {
            const movement = getMovement(data);
            if (!options.ghostNode || typeof movement.ghost !== 'undefined') {
                return;
            }
            const ghost = element.cloneNode(true);
            const style = getComputedStyle(element);
            ghost.style.position = 'absolute';
            ghost.style.left = normalized.clientX - ganttLeft + 'px';
            const itemTop = normalized.clientY - ganttTop - element.offsetTop + parseInt(style['margin-top']);
            movement.itemTop = itemTop;
            ghost.style.top = normalized.clientY - ganttTop - itemTop + 'px';
            ghost.style.width = style.width;
            ghost.style['box-shadow'] = '10px 10px 6px #00000020';
            const height = element.clientHeight + 'px';
            ghost.style.height = height;
            ghost.style['line-height'] = element.clientHeight - 18 + 'px';
            ghost.style.opacity = '0.6';
            ghost.style.transform = 'scale(1.05, 1.05)';
            state.get('_internal.elements.chart-timeline').appendChild(ghost);
            movement.ghost = ghost;
            saveMovement(data.item.id, movement);
            return ghost;
        }
        function moveGhost(data, normalized) {
            if (options.ghostNode) {
                const movement = getMovement(data);
                const left = normalized.clientX - movement.ganttLeft;
                movement.ghost.style.left = left + 'px';
                movement.ghost.style.top =
                    normalized.clientY -
                        movement.ganttTop -
                        movement.itemTop +
                        parseInt(getComputedStyle(element)['margin-top']) +
                        'px';
                saveMovement(data.item.id, movement);
            }
        }
        function destroyGhost(itemId) {
            if (!options.ghostNode) {
                return;
            }
            if (typeof movementState[itemId] !== 'undefined' && typeof movementState[itemId].ghost !== 'undefined') {
                state.get('_internal.elements.chart-timeline').removeChild(movementState[itemId].ghost);
                delete movementState[itemId].ghost;
                saveMovement(data.item.id, movementState[itemId]);
            }
        }
        function getSnapStart(data) {
            let snapStart = options.snapStart;
            if (typeof data.item.snapStart === 'function') {
                snapStart = data.item.snapStart;
            }
            return snapStart;
        }
        function getSnapEnd(data) {
            let snapEnd = options.snapEnd;
            if (typeof data.item.snapEnd === 'function') {
                snapEnd = data.item.snapEnd;
            }
            return snapEnd;
        }
        const resizerHTML = `<div class="${api.getClass('chart-timeline-items-row-item-resizer')}">${options.resizerContent}</div>`;
        // @ts-ignore
        element.insertAdjacentHTML('beforeend', resizerHTML);
        const resizerEl = element.querySelector('.gantt-schedule-timeline-calendar__chart-timeline-items-row-item-resizer');
        if (!isResizable(data)) {
            resizerEl.style.visibility = 'hidden';
        }
        else {
            resizerEl.style.visibility = 'visible';
        }
        function labelDown(ev) {
            if ((ev.type === 'pointerdown' || ev.type === 'mousedown') && ev.button !== 0) {
                return;
            }
            const movement = getMovement(data);
            movement.waiting = true;
            saveMovement(data.item.id, movement);
            setTimeout(() => {
                ev.stopPropagation();
                ev.preventDefault();
                if (!movement.waiting)
                    return;
                movement.moving = true;
                const item = state.get(`config.chart.items.${data.item.id}`);
                const chartLeftTime = state.get('_internal.chart.time.leftGlobal');
                const timePerPixel = state.get('_internal.chart.time.timePerPixel');
                const ganttRect = state.get('_internal.elements.chart-timeline').getBoundingClientRect();
                movement.ganttTop = ganttRect.top;
                movement.ganttLeft = ganttRect.left;
                movement.itemX = Math.round((item.time.start - chartLeftTime) / timePerPixel);
                saveMovement(data.item.id, movement);
                createGhost(data, ev, ganttRect.left, ganttRect.top);
            }, options.wait);
        }
        function resizerDown(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            if ((ev.type === 'pointerdown' || ev.type === 'mousedown') && ev.button !== 0) {
                return;
            }
            const movement = getMovement(data);
            movement.resizing = true;
            const item = state.get(`config.chart.items.${data.item.id}`);
            const chartLeftTime = state.get('_internal.chart.time.leftGlobal');
            const timePerPixel = state.get('_internal.chart.time.timePerPixel');
            const ganttRect = state.get('_internal.elements.chart-timeline').getBoundingClientRect();
            movement.ganttTop = ganttRect.top;
            movement.ganttLeft = ganttRect.left;
            movement.itemX = (item.time.end - chartLeftTime) / timePerPixel;
            saveMovement(data.item.id, movement);
        }
        function isCollision(rowId, itemId, start, end) {
            if (!options.collisionDetection) {
                return false;
            }
            const time = state.get('_internal.chart.time');
            if (options.outOfBorders && (start < time.from || end > time.to)) {
                return true;
            }
            let diff = api.time.date(end).diff(start, 'milliseconds');
            if (Math.sign(diff) === -1) {
                diff = -diff;
            }
            if (diff <= 1) {
                return true;
            }
            const row = state.get('config.list.rows.' + rowId);
            for (const rowItem of row._internal.items) {
                if (rowItem.id !== itemId) {
                    if (start >= rowItem.time.start && start <= rowItem.time.end) {
                        return true;
                    }
                    if (end >= rowItem.time.start && end <= rowItem.time.end) {
                        return true;
                    }
                    if (start <= rowItem.time.start && end >= rowItem.time.end) {
                        return true;
                    }
                }
            }
            return false;
        }
        function movementX(normalized, row, item, zoom, timePerPixel) {
            const movement = getMovement(data);
            const left = normalized.clientX - movement.ganttLeft;
            moveGhost(data, normalized);
            const leftMs = state.get('_internal.chart.time.leftGlobal') + left * timePerPixel;
            const add = leftMs - item.time.start;
            const originalStart = item.time.start;
            const finalStartTime = getSnapStart(data)(item.time.start, add, item);
            const finalAdd = finalStartTime - originalStart;
            const collision = isCollision(row.id, item.id, item.time.start + finalAdd, item.time.end + finalAdd);
            if (finalAdd && !collision) {
                state.update(`config.chart.items.${data.item.id}.time`, function moveItem(time) {
                    time.start += finalAdd;
                    time.end = getSnapEnd(data)(time.end, finalAdd, item) - 1;
                    return time;
                });
            }
        }
        function resizeX(normalized, row, item, zoom, timePerPixel) {
            if (!isResizable(data)) {
                return;
            }
            const time = state.get('_internal.chart.time');
            const movement = getMovement(data);
            const left = normalized.clientX - movement.ganttLeft;
            const leftMs = time.leftGlobal + left * timePerPixel;
            const add = leftMs - item.time.end;
            if (item.time.end + add < item.time.start) {
                return;
            }
            const originalEnd = item.time.end;
            const finalEndTime = getSnapEnd(data)(item.time.end, add, item) - 1;
            const finalAdd = finalEndTime - originalEnd;
            const collision = isCollision(row.id, item.id, item.time.start, item.time.end + finalAdd);
            if (finalAdd && !collision) {
                state.update(`config.chart.items.${data.item.id}.time`, time => {
                    time.start = getSnapStart(data)(time.start, 0, item);
                    time.end = getSnapEnd(data)(time.end, finalAdd, item) - 1;
                    return time;
                });
            }
        }
        function movementY(normalized, row, item, zoom, timePerPixel) {
            moveGhost(data, normalized);
            const movement = getMovement(data);
            const top = normalized.clientY - movement.ganttTop;
            const visibleRows = state.get('_internal.list.visibleRows');
            let index = 0;
            for (const currentRow of visibleRows) {
                if (currentRow.top > top) {
                    if (index > 0) {
                        return index - 1;
                    }
                    return 0;
                }
                index++;
            }
            return index;
        }
        function documentMove(ev) {
            const movement = getMovement(data);
            let item, rowId, row, zoom, timePerPixel;
            if (movement.moving || movement.resizing) {
                ev.stopPropagation();
                ev.preventDefault();
                item = state.get(`config.chart.items.${data.item.id}`);
                rowId = state.get(`config.chart.items.${data.item.id}.rowId`);
                row = state.get(`config.list.rows.${rowId}`);
                zoom = state.get('_internal.chart.time.zoom');
                timePerPixel = state.get('_internal.chart.time.timePerPixel');
            }
            const moveable = isMoveable(data);
            if (movement.moving) {
                if (moveable === true || moveable === 'x' || (Array.isArray(moveable) && moveable.includes(rowId))) {
                    movementX(ev, row, item, zoom, timePerPixel);
                }
                if (!moveable || moveable === 'x') {
                    return;
                }
                let visibleRowsIndex = movementY(ev);
                const visibleRows = state.get('_internal.list.visibleRows');
                if (typeof visibleRows[visibleRowsIndex] === 'undefined') {
                    if (visibleRowsIndex > 0) {
                        visibleRowsIndex = visibleRows.length - 1;
                    }
                    else if (visibleRowsIndex < 0) {
                        visibleRowsIndex = 0;
                    }
                }
                const newRow = visibleRows[visibleRowsIndex];
                const newRowId = newRow.id;
                const collision = isCollision(newRowId, item.id, item.time.start, item.time.end);
                if (newRowId !== item.rowId && !collision) {
                    if (!Array.isArray(moveable) || moveable.includes(newRowId)) {
                        if (!newRow.hasOwnProperty('moveable') || newRow.moveable) {
                            state.update(`config.chart.items.${item.id}.rowId`, newRowId);
                        }
                    }
                }
            }
            else if (movement.resizing && (typeof item.resizable === 'undefined' || item.resizable === true)) {
                resizeX(ev, row, item, zoom, timePerPixel);
            }
        }
        function documentUp(ev) {
            const movement = getMovement(data);
            if (movement.moving || movement.resizing || movement.waiting) {
                ev.stopPropagation();
                ev.preventDefault();
            }
            else {
                return;
            }
            movement.moving = false;
            movement.waiting = false;
            movement.resizing = false;
            saveMovement(data.item.id, movement);
            for (const itemId in movementState) {
                movementState[itemId].moving = false;
                movementState[itemId].resizing = false;
                movementState[itemId].waiting = false;
                destroyGhost(itemId);
            }
        }
        element.addEventListener('pointerdown', labelDown);
        resizerEl.addEventListener('pointerdown', resizerDown);
        document.addEventListener('pointermove', documentMove);
        document.addEventListener('pointerup', documentUp);
        return {
            update(node, changedData) {
                if (!isResizable(changedData) && resizerEl.style.visibility === 'visible') {
                    resizerEl.style.visibility = 'hidden';
                }
                else if (isResizable(changedData) && resizerEl.style.visibility === 'hidden') {
                    resizerEl.style.visibility = 'visible';
                }
                data = changedData;
            },
            destroy(node, data) {
                element.removeEventListener('pointerdown', labelDown);
                resizerEl.removeEventListener('pointerdown', resizerDown);
                document.removeEventListener('pointermove', documentMove);
                document.removeEventListener('pointerup', documentUp);
                resizerEl.remove();
            }
        };
    }
    return function initialize(vido) {
        vido.state.update('config.actions.chart-timeline-items-row-item', actions => {
            actions.push(ItemAction);
            return actions;
        });
    };
}

/**
 * Selection plugin helpers
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

/**
 * Select Action
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
let vido, api, state;
function prepareSelectAction(vidoInstance) {
    vido = vidoInstance;
    api = vido.api;
    state = vido.state;
}

/**
 * Selection ChartTimeline Wrapper
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */
let wrapped, vido$1, api$1, state$1, html;
let className, style;
// this function will be called at each rerender
function ChartTimelineWrapper(input, props) {
    const oldContent = wrapped(input, props);
    const SelectionRectangle = html `
    <div class=${className} style=${style}></div>
  `;
    return html `
    ${oldContent}${SelectionRectangle}
  `;
}
function Wrap(oldWrapper, vidoInstance) {
    wrapped = oldWrapper;
    vido$1 = vidoInstance;
    api$1 = vido$1.api;
    state$1 = vido$1.state;
    html = vido$1.html;
    className = api$1.getClass('chart-selection');
    style = new vido$1.StyleMap({ display: 'none' });
    state$1.subscribe('config.plugin.Selection', Selection => {
        vido$1.update(); // rerender to update rectangle
    });
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
function Selection(options = {}) {
    let vido, api, state;
    options = prepareOptions(options);
    return function initialize(vidoInstance) {
        vido = vidoInstance;
        api = vido.api;
        state = vido.state;
        state.update('config.actions.chart-timeline', timelineActions => {
            timelineActions.push(prepareSelectAction(vido));
            return timelineActions;
        });
        state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
            return Wrap(oldWrapper, vido);
        });
    };
}

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
function CalendarScroll(options = defaultOptions) {
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
            const time = state.get('_internal.chart.time');
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
 * Used to clone existing node instead of each time creating new one which is
 * slower
 */
const emptyTemplateNode = document.createElement('template');
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
function WeekendHiglight(options = {}) {
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
    return function initialize(vido) {
        api = vido.api;
        className = options.className || api.getClass('chart-timeline-grid-row-cell') + '--weekend';
        const destroy = vido.state.subscribe('_internal.chart.time.format.period', period => (enabled = period === 'day'));
        vido.state.update('config.actions.chart-timeline-grid-row-cell', actions => {
            actions.push(WeekendHighlightAction);
            return actions;
        });
        return function onDestroy() {
            destroy();
        };
    };
}

var plugins = { ItemHold, ItemMovement, Selection, CalendarScroll, WeekendHighlight: WeekendHiglight };

export default plugins;
//# sourceMappingURL=plugins.js.map
