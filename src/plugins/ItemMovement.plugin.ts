/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import DeepState from 'deep-state-observer';
import { vido } from '@neuronet.io/vido/vido';
import { Api } from '../api/Api';
import { PluginData as SelectionPluginData } from './Selection/Selection.plugin';

export function Plugin() {
  let vido: vido<DeepState, Api>, state: DeepState, api: Api;
  let selectionData: SelectionPluginData;

  function onSelectionChange(data: SelectionPluginData) {
    selectionData = data;
  }

  return function initialize(vidoInstance: vido<DeepState, Api>) {
    vido = vidoInstance;
    state = vido.state;
    api = vido.api;
    const unsub = state.subscribe('config.plugin.Selection', onSelectionChange);
    return function destroy() {};
  };
}
