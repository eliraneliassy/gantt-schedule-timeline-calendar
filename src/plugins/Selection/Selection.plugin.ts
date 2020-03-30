/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Options, prepareOptions, SelectionData } from './helpers';
import { prepareSelectAction, generateEmptyData } from './SelectAction';
import { Wrap } from './Wrapper';

export default function Selection(options: Options = {}) {
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
