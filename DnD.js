import { on, off, stop, prevent } from '/dom-kit/event.js';
import { search } from '/dom-kit/query.js';
import { HooksMixin } from '/HooksMixin.js';

const DND = Symbol('DnD container symbol');

const alwaysFalsy = () => false;

export function dragStart(context, options) {
  const dnd = new DnD(context, options);
  context[DND] = dnd;
  dnd.start();
  return dnd;
}

export function dragEnd(context) {
  if (!Object.prototype.hasOwnProperty.call(context, DND)) {
    return null;
  }
  const dnd = context[DND];
  if (!dnd) return null;
  context[DND] = null;
  dnd.end();
  dnd.removeHooks();

  return dnd;
}

export class DnD {
  constructor(context, options) {
    this.context = context;

    const {
      isDropTarget = alwaysFalsy,
      stop = true,
      prevent = true,
      hooks = {}
    } = options;

    this.options = Object.assign({}, {
      isDropTarget,
      hooks,
      stop, prevent
    });

    this._target = null;
    this._lastTrackEvt = null;

    this.onElementDrop = this.onElementDrop.bind(this);
    this.onElementDragOver = this.onElementDragOver.bind(this);
    this.onWindowDragEnter = this.onWindowDragEnter.bind(this);

    if (this.options.hooks) this.hooks(this.options.hooks);
  }

  _prepareEvents(evt) {
    if (this.options.stop) {
      stop(evt);
      stop(evt, true);
    }

    if (this.options.prevent) {
      prevent(evt);
    }
  }

  onElementDrop(evt) {
    this._prepareEvents(evt);
    this.processHooks('drop', evt, this._target, this.context);
  }

  onElementDragOver(evt) {
    this._prepareEvents(evt);
    this.processHooks('over', evt, this._target, this.context);
  }

  _track(element, evt) {
    if (this._target) this._unTrack(evt);
    on(element, 'dragover', this.onElementDragOver);
    on(element, 'drop', this.onElementDrop);
    this._target = element;
    this._lastTrackEvt = evt;
    this.processHooks('enter', evt, this._target, this.context);
  }

  _unTrack(evt) {
    off(this._target, 'dragover', this.onElementDragOver);
    off(this._target, 'drop', this.onElementDrop);
    this.processHooks(
      'leave',
      evt ? evt : this._lastTrackEvt,
      this._target,
      this.context
    );
    this._target = null;
    this._lastTrackEvt = null;
  }

  onWindowDragEnter(evt) {
    this._prepareEvents(evt);

    const element = search(evt.target, this.options.isDropTarget);
    if (element === this._target) return;

    element === null
      ? this._unTrack(evt)
      : this._track(element, evt);
  }

  start() {
    on(window, 'dragenter', this.onWindowDragEnter);
    this.processHooks('start', this.context);
  }

  end() {
    if (this._target) this._unTrack();
    off(window, 'dragenter', this.onWindowDragEnter)
    this.processHooks('end', this.context);
  }
}

HooksMixin(DnD);
