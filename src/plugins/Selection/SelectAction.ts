/**
 * Select Action
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { SelectionData } from './helpers';

let vido, api, state, options;
const pluginPath = 'config.plugin.Selection';

const classNames = {
  cell: '',
  item: ''
};

export function generateEmptyData(): SelectionData {
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
  private data: SelectionData;

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

  private updateData() {
    state.update(pluginPath, () => ({ ...this.data }));
  }

  private getRealTarget(ev: PointerEvent) {
    let realTarget: HTMLElement = (ev.target as HTMLElement).closest('.' + classNames.item) as HTMLElement;
    if (realTarget) {
      return realTarget;
    }
    realTarget = (ev.target as HTMLElement).closest('.' + classNames.cell) as HTMLElement;
    if (realTarget) {
      return realTarget;
    }
    return null;
  }

  private pointerDown(ev: PointerEvent) {
    this.data.currentTarget = ev.target as HTMLElement;
    this.data.realTarget = this.getRealTarget(ev);
    if (this.data.realTarget) {
      if (this.data.realTarget.classList.contains(classNames.item)) {
        this.data.targetType = 'item';
      } else if (this.data.realTarget.classList.contains(classNames.cell)) {
        this.data.targetType = 'cell';
      } else {
        this.data.targetType = '';
      }
    } else {
      this.data.targetType = '';
    }
    this.data.isSelecting = !!this.data.realTarget;
    this.data.events.down = ev;
    this.updateData();
  }

  private pointerUp(ev: PointerEvent) {
    this.data.isSelecting = false;
    this.data.events.up = ev;
    this.updateData();
  }

  private pointerMove(ev: PointerEvent) {
    if (this.data.isSelecting) {
      this.data.events.move = ev;
      this.updateData();
    }
  }
}

export function prepareSelectAction(vidoInstance, opts) {
  options = opts;
  vido = vidoInstance;
  api = vido.api;
  state = vido.state;
  classNames.cell = api.getClass('chart-timeline-grid-row-cell');
  classNames.item = api.getClass('chart-timeline-items-row-item');
  return SelectAction;
}
