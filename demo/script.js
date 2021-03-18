import { findAll } from '/dom-kit/query.js';
import { on } from '/dom-kit/event.js';

import { dragStart, dragEnd } from '/DnD.js';

import { enter, leave, over, drop } from '/demo/hooks.js';


const items = findAll('.Item');
const trash = findAll('.Trash');

const isDropTarget = (element) => element.classList.contains('Bucket');

const onDragStart = (evt) => {
  dragStart(evt.currentTarget, {
    isDropTarget,
    hooks: { enter, leave, over, drop }
  });
}

const onDragEnd = (evt) => {
  dragEnd(evt.currentTarget);
}

const addEvents = (item) => {
  on(item, 'dragstart', onDragStart);
  on(item, 'dragend', onDragEnd);
}

items.forEach(addEvents);
trash.forEach(addEvents);


