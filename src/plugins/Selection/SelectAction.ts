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

const classNames = {
  cell: '',
  item: '',
  row: ''
};

class SelectAction {
  private element: HTMLElement;
  private currentTarget: HTMLElement;
  private realTarget: HTMLElement;
  private targetType: string = '';

  constructor(element) {
    this.element = element;
    this.pointerDown = this.pointerDown.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
    element.addEventListener('pointerdown', this.pointerDown);
  }

  private pointerDown(ev: PointerEvent) {
    this.currentTarget = ev.target as HTMLElement;
  }

  private pointerUp(ev: PointerEvent) {}

  private pointerMove(ev: PointerEvent) {}

  destroy() {}
}

export function prepareSelectAction(vidoInstance) {
  vido = vidoInstance;
  api = vido.api;
  state = vido.state;
}
