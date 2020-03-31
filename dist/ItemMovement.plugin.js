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
      return Object.assign({ enabled: true, className: '' }, options);
  }
  const pluginPath = 'config.plugin.ItemMovement';
  function gemerateEmptyPluginData(options) {
      return Object.assign({ moving: [], lastMoved: [], movement: {
              px: { horizontal: 0, vertical: 0 },
              time: 0
          }, onStart(items) {
              console.log('start moving', items);
          },
          onMove(items) {
              console.log('move', items);
          },
          onEnd(items) {
              console.log('end move', items);
          },
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
          this.lastPointerState = 'up';
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
      getItemTime(currentTime) {
          return currentTime;
      }
      moveItems() {
          for (const item of this.data.lastMoved) {
              const startTime = this.getItemTime(item.$data.time.startDate);
          }
      }
      updatePointerState() {
          if (this.lastPointerState === 'up' && this.selection.pointerState === 'down') {
              this.data.onStart(this.data.moving);
          }
          else if ((this.lastPointerState === 'down' || this.lastPointerState === 'move') &&
              this.selection.pointerState === 'up') {
              this.data.moving = [];
              this.data.onEnd(this.data.lastMoved);
          }
          else if (this.selection.pointerState === 'move') {
              this.data.onMove(this.data.moving);
          }
          this.lastPointerState = this.selection.pointerState;
      }
      onSelectionChange(data) {
          if (!this.data.enabled)
              return;
          this.selection = data;
          if (this.selection.events.move) {
              this.selection.events.move.preventDefault();
              this.selection.events.move.stopPropagation();
          }
          if (this.selection.events.down) {
              this.selection.events.down.preventDefault();
              this.selection.events.down.stopPropagation();
          }
          this.data.moving = [...this.selection.selected[ITEM]];
          if (this.data.moving.length)
              this.data.lastMoved = [...this.data.moving];
          this.updatePointerState();
          this.data.movement.px.horizontal = this.selection.currentPosition.x - this.selection.initialPosition.x;
          this.data.movement.px.vertical = this.selection.currentPosition.y - this.selection.initialPosition.y;
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
//# sourceMappingURL=ItemMovement.plugin.js.map
