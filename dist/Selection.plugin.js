(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Selection = {}));
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
  //# sourceMappingURL=TimelinePointer.plugin.js.map

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
  const pluginPath = 'config.plugin.Selection';
  function generateEmptyData() {
      return {
          enabled: true,
          isSelecting: false,
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
          this.unsub.push(this.state.subscribe(pluginPath, value => {
              this.data = value;
          }));
      }
      destroy() {
          this.unsub.forEach(unsub => unsub());
      }
      updateData() {
          this.state.update(pluginPath, Object.assign({}, this.data));
      }
      getItemsUnderSelectionArea() { }
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
      onPointerData() {
          if (this.poitnerData.isMoving) {
              this.data.isSelecting = true;
              this.data.selectionArea = this.getSelectionArea();
              console.log(this.data.selectionArea);
              const selectingItems = this.getItemsUnderSelectionArea();
          }
          else if (!this.poitnerData.isMoving) {
              this.data.isSelecting = false;
          }
          this.updateData();
      }
  }
  function Plugin(options = {}) {
      options = prepareOptions(options);
      return function initialize(vido) {
          const selectionPlugin = new SelectionPlugin(vido, options);
          vido.state.update(pluginPath, generateEmptyData());
          vido.state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
              return Wrap(oldWrapper, vido);
          });
          return function destroy() {
              selectionPlugin.destroy();
          };
      };
  }
  //# sourceMappingURL=Selection.plugin.js.map

  exports.Plugin = Plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=Selection.plugin.js.map
