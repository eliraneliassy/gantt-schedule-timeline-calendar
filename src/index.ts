/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import 'pepjs';
import Vido from '@neuronet.io/vido/vido';
//import Vido from '../../vido/vido';
import publicApi, { getDataApi } from './api/Api';
import Main from './components/Main';
import { Data } from './types';

function GSTC(options) {
  const state = options.state;
  const api = getDataApi(state);
  const $data: Data = {
    components: {
      Main
    },
    treeMap: { id: '', $data: { children: [], parents: [], items: [] } },
    flatTreeMap: [],
    flatTreeMapById: {},
    list: {
      visibleRows: [],
      width: 0
    },
    dimensions: {
      width: 0,
      height: 0
    },
    chart: {
      dimensions: {
        width: 0,
        innerWidth: 0,
        height: 0
      },
      visibleItems: [],
      time: {
        zoom: 0,
        format: {
          period: 'day',
          zoomTo: 0,
          format() {
            return '';
          }
        },
        level: 0,
        levels: [],
        timePerPixel: 0,
        totalViewDurationMs: 0,
        totalViewDurationPx: 0,
        leftGlobal: 0,
        rightGlobal: 0,
        leftPx: 0,
        rightPx: 0,
        leftInner: 0,
        rightInner: 0,
        period: 'day',
        leftGlobalDate: null,
        rightGlobalDate: null,
        centerGlobal: 0,
        centerGlobalDate: null,
        from: 0,
        to: 0,
        fromDate: null,
        toDate: null,
        finalFrom: null,
        finalTo: null,
        finalFromDate: null,
        finalToDate: null
      }
    },
    elements: {},
    loaded: {}
  };
  if (typeof options.debug === 'boolean' && options.debug) {
    // @ts-ignore
    window.state = state;
  }

  state.update('', oldValue => {
    return {
      config: oldValue.config,
      $data
    };
  });
  // @ts-ignore
  const vido = new Vido(state, api);
  api.setVido(vido);
  const app = vido.createApp({ component: Main, props: {}, element: options.element });
  const internalApi = app.vidoInstance.api;
  return { state, app, api: internalApi };
}

GSTC.api = publicApi;
export default GSTC;
