/**
 * Selection ChartTimeline Wrapper
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { PluginData } from './Selection.plugin';
import { vido, lithtml } from '@neuronet.io/vido/vido';
import DeepState from 'deep-state-observer';
import { Api } from '../../api/Api';
import { Vido } from '../../types';

let wrapped, vido: Vido, api: Api, state: DeepState, html: typeof lithtml.html;
let pluginData: PluginData;
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
  } else {
    styleMap.style.display = 'none';
  }
  const SelectionRectangle = html`
    <div class=${className} style=${styleMap}></div>
  `;
  return html`
    ${oldContent}${SelectionRectangle}
  `;
}

export function Wrap(oldWrapper, vidoInstance: Vido) {
  if (wrapped) return;
  wrapped = oldWrapper;
  vido = vidoInstance;
  api = vido.api;
  state = vido.state;
  html = vido.html;
  className = api.getClass('chart-selection');
  styleMap = new vido.StyleMap({ display: 'none' });

  vido.onDestroy(
    state.subscribe('config.plugin.Selection', (PluginData: PluginData) => {
      pluginData = PluginData;
      vido.update(); // rerender to update rectangle
    })
  );

  return ChartTimelineWrapper;
}
