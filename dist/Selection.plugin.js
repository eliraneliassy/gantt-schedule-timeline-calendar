(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Selection = factory());
}(this, (function () { 'use strict';

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
  //# sourceMappingURL=helpers.js.map

  /**
   * Select Action
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
   * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
   */
  let vido, api, state, options;
  const pluginPath = 'config.plugin.Selection';
  const classNames = {
      cell: '',
      item: ''
  };
  function generateEmptyData() {
      return {
          enabled: options.enabled,
          currentTarget: null,
          realTarget: null,
          targetType: '',
          isSelecting: false,
          events: {
              down: null,
              move: null,
              up: null
          }
      };
  }
  class SelectAction {
      constructor(element) {
          this.pointerDown = this.pointerDown.bind(this);
          this.pointerMove = this.pointerMove.bind(this);
          this.pointerUp = this.pointerUp.bind(this);
          this.data = generateEmptyData();
          element.addEventListener('pointerdown', this.pointerDown);
          document.addEventListener('pointerup', this.pointerUp);
          document.addEventListener('pointermove', this.pointerMove);
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
      pointerDown(ev) {
          this.data.currentTarget = ev.target;
          this.data.realTarget = this.getRealTarget(ev);
          if (this.data.realTarget) {
              if (this.data.realTarget.classList.contains(classNames.item)) {
                  this.data.targetType = 'item';
              }
              else if (this.data.realTarget.classList.contains(classNames.cell)) {
                  this.data.targetType = 'cell';
              }
              else {
                  this.data.targetType = '';
              }
          }
          else {
              this.data.targetType = '';
          }
          this.data.isSelecting = !!this.data.realTarget;
          this.data.events.down = ev;
          this.updateData();
      }
      pointerUp(ev) {
          this.data.isSelecting = false;
          this.data.events.up = ev;
          this.updateData();
      }
      pointerMove(ev) {
          if (this.data.isSelecting) {
              this.data.events.move = ev;
              this.updateData();
          }
      }
  }
  function prepareSelectAction(vidoInstance, opts) {
      options = opts;
      vido = vidoInstance;
      api = vido.api;
      state = vido.state;
      classNames.cell = api.getClass('chart-timeline-grid-row-cell');
      classNames.item = api.getClass('chart-timeline-items-row-item');
      return SelectAction;
  }
  //# sourceMappingURL=SelectAction.js.map

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
  let data;
  let className, styleMap;
  // this function will be called at each rerender
  function ChartTimelineWrapper(input, props) {
      const oldContent = wrapped(input, props);
      if (data.isSelecting) {
          styleMap.style.display = 'block';
      }
      else {
          styleMap.style.display = 'none';
      }
      const SelectionRectangle = html `
    <div class=${className} style=${styleMap}>${data.targetType}</div>
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
      styleMap = new vido$1.StyleMap({ display: 'none' });
      state$1.subscribe('config.plugin.Selection', (Selection) => {
          data = Selection;
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
              timelineActions.push(prepareSelectAction(vido, options));
              return timelineActions;
          });
          state.update('config.plugin.Selection', data => {
              return generateEmptyData();
          });
          state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
              return Wrap(oldWrapper, vido);
          });
      };
  }
  //# sourceMappingURL=Selection.plugin.js.map

  return Selection;

})));
//# sourceMappingURL=Selection.plugin.js.map
