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

  return Selection;

})));
//# sourceMappingURL=Selection.plugin.js.map
