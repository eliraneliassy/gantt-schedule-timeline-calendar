/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { PluginData as TimelinePointerPluginData, ITEM, CELL, Point } from '../TimelinePointer.plugin';

import { Wrap } from './Wrapper';

export interface Options {
  enabled?: boolean;
  grid?: boolean;
  items?: boolean;
  rows?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  selecting?: (data, type: string) => void;
  deselecting?: (data, type: string) => void;
  selected?: (data, type) => void;
  deselected?: (data, type) => void;
  canSelect?: (type, state, all) => any[];
  canDeselect?: (type, state, all) => any[];
}

export interface Items {
  [key: string]: string[];
}

export interface SelectState {
  selecting?: Items;
  selected?: Items;
}

function prepareOptions(options) {
  const defaultOptions: Options = {
    enabled: true,
    grid: false,
    items: true,
    rows: false,
    horizontal: true,
    vertical: true,
    selecting() {},
    deselecting() {},
    selected() {},
    deselected() {},
    canSelect(type, currently, all) {
      return currently;
    },
    canDeselect(type, currently, all) {
      return [];
    }
  };
  options = { ...defaultOptions, ...options } as Options;
  return options;
}

const pluginPath = 'config.plugin.Selection';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Selection {
  [ITEM]: [];
  [CELL]: [];
}

export interface PluginData {
  enabled: boolean;
  isSelecting: boolean;
  initialPosition: Point;
  currentPosition: Point;
  selectionArea: Area;
  selected: Selection;
  selecting: Selection;
}

function generateEmptyData(): PluginData {
  return {
    enabled: true,
    isSelecting: false,
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    selectionArea: { x: 0, y: 0, width: 0, height: 0 },
    selecting: {
      [ITEM]: [],
      [CELL]: []
    },
    selected: {
      [ITEM]: [],
      [CELL]: []
    }
  };
}

class SelectionPlugin {
  private data: PluginData;
  private poitnerData: TimelinePointerPluginData;
  private vido: any;
  private state: any;
  private api: any;
  private options: Options;
  private unsub = [];

  constructor(vido, options) {
    this.vido = vido;
    this.state = vido.state;
    this.api = vido.api;
    this.options = options;
    this.data = generateEmptyData();
    this.unsub.push(
      this.state.subscribe('config.plugin.TimelinePointer', timelinePointerData => {
        this.poitnerData = timelinePointerData;
        this.onPointerData();
      })
    );
    this.updateData();
    this.unsub.push(
      this.state.subscribe(pluginPath, value => {
        this.data = value;
      })
    );
  }

  public destroy() {
    this.unsub.forEach(unsub => unsub());
  }

  private updateData() {
    this.state.update(pluginPath, { ...this.data });
  }

  private getItemsUnderSelectionArea() {}

  private getSelectionArea(): Area {
    const area = { x: 0, y: 0, width: 0, height: 0 };
    const initial = { ...this.poitnerData.initialPosition };
    const current = { ...this.poitnerData.currentPosition };
    const width = current.x - initial.x;
    const height = current.y - initial.y;
    if (width >= 0) {
      area.x = initial.x;
      area.width = width;
    } else {
      area.x = current.x;
      area.width = Math.abs(width);
    }
    if (height >= 0) {
      area.y = initial.y;
      area.height = height;
    } else {
      area.y = current.y;
      area.height = Math.abs(height);
    }
    return area;
  }

  private onPointerData() {
    if (this.poitnerData.isMoving) {
      this.data.isSelecting = true;
      this.data.selectionArea = this.getSelectionArea();
      console.log(this.data.selectionArea);
      const selectingItems = this.getItemsUnderSelectionArea();
    } else if (!this.poitnerData.isMoving) {
      this.data.isSelecting = false;
    }
    this.updateData();
  }
}

export function Plugin(options: Options = {}) {
  options = prepareOptions(options);

  return function initialize(vido) {
    const selectionPlugin = new SelectionPlugin(vido, options);
    vido.state.update(pluginPath, generateEmptyData());
    vido.state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
      return Wrap(oldWrapper, vido);
    });
    return function destroy() {
      selectionPlugin.destroy();
    };
  };
}
