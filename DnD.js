import { on, off, stop, prevent } from '/dom-kit/event.js';
import { search } from '/dom-kit/query.js';
import { HooksMixin } from '/HooksMixin.js';

/**
 * Функция возвращающая bool
 * @typedef {Function} BoolFunction
 * @return {Boolean}
 */

/**
 * Бессобытийный хук
 * Т. е. хук без объекта события и элемента-контейнера,
 * например start и end
 *
 * @typedef {Function} EvtlessHook
 * @param {Object} context — привязанный к перетаскиванию контекст
 * @param {DnD} dnd — экземпляр контроллера, на котором запустился хук
 */

/**
 * Событийный хук
 * Т. е. хук из событий dragover, dragenter, drop
 *
 * @typedef {Function} EvtHook
 * @param {Event} evt — событие в DOM
 * @param {Element} element — элемент, готовый принять объект для сброса
 * @param {Object} context — привязанный к перетаскиванию контекст
 * @param {DnD} dnd — экземпляр контроллера, на котором запустился хук
 */

/**
 * Хуки для DnD
 *
 * @typedef {Object} Hooks
 * @prop {(EvtlessHook|[EvtlessHook])} start — хук начала перетаскивания в контроллере
 * @prop {(EvtHook|[EvtHook])} enter — хук входа в подходящий элемент-контейнер
 * @prop {(EvtHook|[EvtHook])} over — хук движения над подходящим элементом-контейнером
 * @prop {(EvtHook|[EvtHook])} drop — хук сброса объекта в элемент-контейнер
 * @prop {(EvtHook|[EvtHook])} leave — хук выхода из подходящего элемента-контейнера
 * @prop {(EvtlessHook|[EvtlessHook])} stop — хук завершения перетаскивания в контроллере
 */

/**
 * Опции для DnD контроллера
 *
 * @typedef {Object} Options
 * @memberof DnD
 * @prop {BoolFunction} isDropTarget — функция-определитель подходящего контейнера сброса
 * @prop {Boolean} [stop=true] — флаг, если true всплытие событий будет остановлено
 * @prop {Boolean} [prevent=true] — флаг, если true, поведение по умолчанию у событий будет отменено
 * @prop {Hooks} hooks — словарь хуков контроллера DnD
 */


const DND = Symbol('DnD container symbol');

/**
 * Стандартный «проверяльщик» подходящего элемента-контейнера
 * Всегда возвращает false, так что по его мнению ни один элемент не достоин
 * @type {BoolFunction}
 */
const alwaysFalsy = () => false;

/**
 * Начать отслеживание DnD
 *
 * @param  {Object} context — контекст для DnD, может быть любым объектом, в который можно писать новые поля, например DOMElement
 * @param  {Options} options — опции контроллера DnD
 * @return {DnD}
 */
export function dragStart(context, options) {
  const dnd = new DnD(context, options);
  context[DND] = dnd;
  dnd.start();
  return dnd;
}

/**
 * Завершить отслеживание DnD
 *
 * @param  {Object} context — контекст для DnD, может быть любым объектом, в который можно писать новые поля, например DOMElement
 * @return {(null|DnD)} — вернет ранее привязанный объект dnd, или null, если для контекста не вызывали функцию dragStart
 */
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

/**
 * Контроллер перетаскивания для DnD
 *
 * @param {Object} context — любой контекстный объект, для которого реализуем перетаскивание
 * @param {Options} options — опции контроллера
 */
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

  /**
   * Начать ослеживание перетаскивания
   */
  start() {
    on(window, 'dragenter', this.onWindowDragEnter);
    this.processHooks('start', this.context);
  }

  /**
   * Завершить ослеживание перетаскивания
   */
  end() {
    if (this._target) this._unTrack();
    off(window, 'dragenter', this.onWindowDragEnter)
    this.processHooks('end', this.context);
  }
}

HooksMixin(DnD);
