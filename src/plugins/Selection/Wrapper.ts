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
let SelectionData;
let className, style;

// this function will be called at each rerender
function ChartTimelineWrapper(input, props) {
  const oldContent = wrapped(input, props);

  const SelectionRectangle = html`
    <div class=${className} style=${style}></div>
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
  style = new vido.StyleMap({ display: 'none' });

  state.subscribe('config.plugin.Selection', Selection => {
    SelectionData = Selection;
    vido.update(); // rerender to update rectangle
  });

  return ChartTimelineWrapper;
}
