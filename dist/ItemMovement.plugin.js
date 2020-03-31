(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.ItemMovement = {}));
}(this, (function (exports) { 'use strict';

  /**
   * ItemMovement plugin
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
   * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
   */
  function Plugin() {
      let vido, state, api;
      function onSelectionChange(data) {
      }
      return function initialize(vidoInstance) {
          vido = vidoInstance;
          state = vido.state;
          api = vido.api;
          const unsub = state.subscribe('config.plugin.Selection', onSelectionChange);
          return function destroy() { };
      };
  }

  exports.Plugin = Plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ItemMovement.plugin.js.map
