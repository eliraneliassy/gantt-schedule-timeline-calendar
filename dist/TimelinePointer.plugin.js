(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.TimelinePointer = {}));
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
              this.data.isMoving = false;
              this.data.events.up = ev;
              this.data.currentPosition = this.getRealPosition(ev);
              this.updateData();
          }
          pointerMove(ev) {
              if (!this.data.enabled || !this.data.isMoving)
                  return;
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
          const unsub = state.subscribe('_internal.elements.chart-timeline', el => (chartTimelineElement = el));
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

  exports.CELL = CELL;
  exports.ITEM = ITEM;
  exports.Plugin = Plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=TimelinePointer.plugin.js.map
