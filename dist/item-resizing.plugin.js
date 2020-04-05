(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.ItemResizing = {}));
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
   * ItemResizing plugin
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
   * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
   */
  function generateEmptyData(options = {}) {
      const result = Object.assign({ enabled: true, handle: {
              width: 18,
              horizontalMargin: 1,
              verticalMargin: 1,
              outside: false,
              onlyWhenSelected: true,
          }, initialPosition: { x: 0, y: 0 }, currentPosition: { x: 0, y: 0 }, movement: 0, itemsInitial: [], leftIsMoving: false, rightIsMoving: false }, options);
      if (options.handle)
          result.handle = Object.assign(Object.assign({}, result.handle), options.handle);
      return result;
  }
  class ItemResizing {
      constructor(vido, options) {
          this.spacing = 1;
          this.unsubs = [];
          this.vido = vido;
          this.state = vido.state;
          this.api = vido.api;
          this.data = generateEmptyData(options);
          this.html = vido.html;
          this.wrapper = this.wrapper.bind(this);
          this.onRightPointerDown = this.onRightPointerDown.bind(this);
          this.onRightPointerMove = this.onRightPointerMove.bind(this);
          this.onRightPointerUp = this.onRightPointerUp.bind(this);
          this.onLeftPointerDown = this.onLeftPointerDown.bind(this);
          this.onLeftPointerMove = this.onLeftPointerMove.bind(this);
          this.onLeftPointerUp = this.onLeftPointerUp.bind(this);
          this.updateData();
          this.unsubs.push(this.state.subscribe('config.plugin.ItemResizing', (data) => (this.data = data)));
          document.addEventListener('pointermove', this.onLeftPointerMove);
          document.addEventListener('pointerup', this.onLeftPointerUp);
          document.addEventListener('pointermove', this.onRightPointerMove);
          document.addEventListener('pointerup', this.onRightPointerUp);
      }
      destroy() {
          this.unsubs.forEach((unsub) => unsub());
          document.removeEventListener('pointermove', this.onLeftPointerMove);
          document.removeEventListener('pointerup', this.onLeftPointerUp);
          document.removeEventListener('pointermove', this.onRightPointerMove);
          document.removeEventListener('pointerup', this.onRightPointerUp);
      }
      updateData() {
          this.state.update('config.plugin.ItemResizing', this.data);
      }
      initializeWrapper() {
          this.leftClassName = this.api.getClass('chart-timeline-items-row-item-resizing-handle');
          this.leftClassName += ' ' + this.leftClassName + '--left';
          this.rightClassName = this.api.getClass('chart-timeline-items-row-item-resizing-handle');
          this.rightClassName += ' ' + this.rightClassName + '--right';
          this.spacing = this.state.get('config.chart.spacing');
      }
      getSelectedItems() {
          return this.state.get(`config.plugin.Selection.selected.${ITEM}`);
      }
      getRightStyleMap(item, visible) {
          const rightStyleMap = new this.vido.StyleMap({});
          rightStyleMap.style.display = visible ? 'block' : 'none';
          rightStyleMap.style.top = item.$data.position.actualTop + this.data.handle.verticalMargin + 'px';
          if (this.data.handle.outside) {
              rightStyleMap.style.left = item.$data.position.right + this.data.handle.horizontalMargin - this.spacing + 'px';
          }
          else {
              rightStyleMap.style.left =
                  item.$data.position.right - this.data.handle.width - this.data.handle.horizontalMargin - this.spacing + 'px';
          }
          rightStyleMap.style.width = this.data.handle.width + 'px';
          rightStyleMap.style.height = item.$data.actualHeight - this.data.handle.verticalMargin * 2 + 'px';
          return rightStyleMap;
      }
      getLeftStyleMap(item, visible) {
          const leftStyleMap = new this.vido.StyleMap({});
          leftStyleMap.style.display = visible ? 'block' : 'none';
          leftStyleMap.style.top = item.$data.position.actualTop + this.data.handle.verticalMargin + 'px';
          if (this.data.handle.outside) {
              leftStyleMap.style.left =
                  item.$data.position.left - this.data.handle.width - this.data.handle.horizontalMargin + 'px';
          }
          else {
              leftStyleMap.style.left = item.$data.position.left + this.data.handle.horizontalMargin + 'px';
          }
          leftStyleMap.style.width = this.data.handle.width + 'px';
          leftStyleMap.style.height = item.$data.actualHeight - this.data.handle.verticalMargin * 2 + 'px';
          return leftStyleMap;
      }
      onPointerDown(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          this.data.itemsInitial = this.getSelectedItems().map((item) => {
              return {
                  id: item.id,
                  left: item.$data.position.left,
                  width: item.$data.width,
              };
          });
          this.data.initialPosition = {
              x: ev.screenX,
              y: ev.screenY,
          };
          this.data.currentPosition = Object.assign({}, this.data.initialPosition);
      }
      onLeftPointerDown(ev) {
          /*if (!this.data.enabled) return;
          this.data.leftIsMoving = true;
          this.onPointerDown(ev);
          this.updateData();*/
      }
      onRightPointerDown(ev) {
          if (!this.data.enabled)
              return;
          this.data.rightIsMoving = true;
          this.onPointerDown(ev);
          this.updateData();
      }
      onPointerMove(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          this.data.currentPosition.x = ev.screenX;
          this.data.currentPosition.y = ev.screenY;
          this.data.movement = this.data.currentPosition.x - this.data.initialPosition.x;
      }
      onLeftPointerMove(ev) {
          if (!this.data.enabled || !this.data.leftIsMoving)
              return;
          this.onPointerMove(ev);
          const selected = this.getSelectedItems();
          const movement = this.data.movement;
          const time = this.state.get('$data.chart.time');
          let multi = this.state.multi();
          for (let i = 0, len = selected.length; i < len; i++) {
              const item = selected[i];
              item.$data.position.left = this.data.itemsInitial[i].left + movement;
              if (item.$data.position.left > item.$data.position.right)
                  item.$data.position.left = item.$data.position.right;
              item.$data.position.actualLeft = item.$data.position.left;
              item.$data.width = item.$data.position.right - item.$data.position.left;
              item.$data.actualWidth = item.$data.width;
              const leftGlobal = this.api.time.getTimeFromViewOffsetPx(item.$data.position.left, time);
              item.time.start = leftGlobal;
              item.$data.time.startDate = this.api.time.date(leftGlobal);
              multi = multi.update(`config.chart.items.${item.id}`, item);
          }
          multi.done();
          this.updateData();
      }
      onRightPointerMove(ev) {
          if (!this.data.enabled || !this.data.rightIsMoving)
              return;
          this.onPointerMove(ev);
          const selected = this.getSelectedItems();
          const movement = this.data.movement;
          const time = this.state.get('$data.chart.time');
          let multi = this.state.multi();
          for (let i = 0, len = selected.length; i < len; i++) {
              const item = selected[i];
              item.$data.width = this.data.itemsInitial[i].width + movement;
              if (item.$data.width < 0)
                  item.$data.width = 0;
              item.$data.actualWidth = item.$data.width;
              const right = item.$data.position.left + item.$data.width;
              item.$data.position.right = right;
              item.$data.position.actualRight = right;
              const rightGlobal = this.api.time.getTimeFromViewOffsetPx(right, time);
              item.time.end = rightGlobal;
              item.$data.time.endDate = this.api.time.date(rightGlobal);
              multi = multi.update(`config.chart.items.${item.id}`, item);
          }
          multi.done();
          this.updateData();
      }
      onPointerUp(ev) {
          ev.preventDefault();
          ev.stopPropagation();
      }
      onLeftPointerUp(ev) {
          if (!this.data.enabled || !this.data.leftIsMoving)
              return;
          this.onPointerUp(ev);
          this.data.leftIsMoving = false;
          this.updateData();
      }
      onRightPointerUp(ev) {
          if (!this.data.enabled || !this.data.rightIsMoving)
              return;
          this.onPointerUp(ev);
          this.data.rightIsMoving = false;
          this.updateData();
      }
      wrapper(input, props) {
          const oldContent = this.oldWrapper(input, props);
          const item = props.props.item;
          let visible = !item.$data.detached;
          if (this.data.handle.onlyWhenSelected) {
              visible = visible && item.selected;
          }
          const rightStyleMap = this.getRightStyleMap(item, visible);
          const leftStyleMap = this.getLeftStyleMap(item, visible);
          const onLeftPointerDown = {
              handleEvent: this.onLeftPointerDown,
          };
          const onRightPointerDown = {
              handleEvent: this.onRightPointerDown,
          };
          const leftHandle = this
              .html `<div class=${this.leftClassName} style=${leftStyleMap} @pointerdown=${onLeftPointerDown}></div>`;
          const rightHandle = this
              .html `<div class=${this.rightClassName} style=${rightStyleMap} @pointerdown=${onRightPointerDown}></div>`;
          return this.html `${oldContent}${rightHandle}`;
          //return this.html`${leftHandle}${oldContent}${rightHandle}`;
      }
      getWrapper(oldWrapper) {
          if (!this.oldWrapper) {
              this.oldWrapper = oldWrapper;
          }
          this.initializeWrapper();
          return this.wrapper;
      }
  }
  function Plugin(options = {}) {
      return function initialize(vidoInstance) {
          const itemResizing = new ItemResizing(vidoInstance, options);
          vidoInstance.state.update('config.wrappers.ChartTimelineItemsRowItem', (oldWrapper) => {
              return itemResizing.getWrapper(oldWrapper);
          });
      };
  }

  exports.Plugin = Plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=item-resizing.plugin.js.map
