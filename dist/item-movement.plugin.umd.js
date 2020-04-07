(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.ItemMovement = {}));
}(this, (function (exports) { 'use strict';

  /**
   * TimelinePointer plugin
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
   * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
   */
  const ITEM = 'chart-timeline-items-row-item';

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
      return Object.assign({ enabled: true, className: '', bodyClass: 'gstc-item-movement', bodyClassMoving: 'gstc-items-moving' }, options);
  }
  const pluginPath = 'config.plugin.ItemMovement';
  function gemerateEmptyPluginData(options) {
      return Object.assign({ moving: [], lastMoved: [], state: 'up', pointerMoved: false, lastPosition: { x: 0, y: 0 }, movement: {
              px: { horizontal: 0, vertical: 0 },
              time: 0,
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
          this.onDestroy.push(this.state.subscribe(pluginPath, (data) => {
              this.data = data;
              if (!data.enabled) {
                  document.body.classList.remove(this.data.bodyClass);
              }
              else {
                  document.body.classList.add(this.data.bodyClass);
              }
          }));
          if (!this.data.className)
              this.data.className = this.api.getClass('chart-timeline-items-row-item--moving');
          this.onSelectionChange = this.onSelectionChange.bind(this);
          this.onDestroy.push(this.state.subscribe('config.plugin.Selection', this.onSelectionChange));
      }
      destroy() {
          this.onDestroy.forEach((unsub) => unsub());
      }
      updateData() {
          this.state.update(pluginPath, this.data);
      }
      getItemMovingTime(item, time) {
          const horizontal = this.data.movement.px.horizontal;
          const x = item.$data.position.left + horizontal;
          const leftGlobal = this.api.time.getTimeFromViewOffsetPx(x, time);
          const rightPx = this.api.time.getViewOffsetPxFromDates(item.$data.time.endDate);
          return {
              time: this.api.time.date(leftGlobal),
              position: x,
              width: rightPx - x,
          };
      }
      moveItems() {
          const time = this.state.get('$data.chart.time');
          let multi = this.state.multi();
          for (const item of this.data.lastMoved) {
              const start = this.getItemMovingTime(item, time);
              let newItemTime;
              multi = multi
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
                  itemData.width = start.width;
                  itemData.actualWidth = itemData.position.actualRight - itemData.position.actualLeft;
                  itemData.position.right = itemData.position.left + itemData.width;
                  itemData.position.actualRight = this.api.time.limitOffsetPxToView(itemData.position.right);
                  return itemData;
              });
          }
          multi.done();
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
          document.body.classList.add(this.data.bodyClassMoving);
          this.data.lastPosition = Object.assign({}, this.selection.currentPosition);
      }
      onEnd() {
          document.body.classList.remove(this.data.bodyClassMoving);
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
          else if ((this.data.state === 'down' || this.data.state === 'move') && this.selection.pointerState === 'up') {
              this.onEnd();
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
  function Plugin(options = {}) {
      return function initialize(vidoInstance) {
          vidoInstance.state.update(pluginPath, gemerateEmptyPluginData(prepareOptions(options)));
          new ItemMovement(vidoInstance);
      };
  }

  exports.Plugin = Plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=item-movement.plugin.umd.js.map
