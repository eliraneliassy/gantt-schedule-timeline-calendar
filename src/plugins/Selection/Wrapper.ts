/**
 * Selection ChartTimeline Wrapper
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { SelectionData } from './helpers';

let wrapped, vido, api, state, html;
let data: SelectionData;
let className, styleMap;

// this function will be called at each rerender
function ChartTimelineWrapper(input, props) {
  const oldContent = wrapped(input, props);
  if (data.isSelecting) {
    styleMap.style.display = 'block';
  } else {
    styleMap.style.display = 'none';
  }
  const SelectionRectangle = html`
    <div class=${className} style=${styleMap}>${data.targetType}</div>
  `;
  return html`
    ${oldContent}${SelectionRectangle}
  `;
}

export function Wrap(oldWrapper, vidoInstance) {
  wrapped = oldWrapper;
  vido = vidoInstance;
  api = vido.api;
  state = vido.state;
  html = vido.html;
  className = api.getClass('chart-selection');
  styleMap = new vido.StyleMap({ display: 'none' });

  state.subscribe('config.plugin.Selection', (Selection: SelectionData) => {
    data = Selection;
    vido.update(); // rerender to update rectangle
  });

  return ChartTimelineWrapper;
}
