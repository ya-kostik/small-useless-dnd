import { rgb, getRect, setStyle } from '/dom-kit/style.js';

import { getColorVector } from '/demo/colors.js';

export function enter(evt, element) {
  element.classList.add('Bucket_dropzone');
}

export function over(evt, element) {
  if (element.dataset.id === '2') {
    setStyle(element, {
      position: 'relative',
      top: '100px'
    })
    return;
  }

  const rect = getRect(element);
  const y = evt.clientY - rect.top;
  const x = evt.clientX - rect.left;

  const color = getColorVector(x, y, rect.height, rect.width);

  setStyle(element, {
    backgroundColor: rgb(...color)
  });
}

export function leave(evt, element) {
  setStyle(element, { backgroundColor: null, position: null, left: null, top: null });
  element.classList.remove('Bucket_dropzone');
}

export function drop(evt, element, self) {
  // Мусор только накапливается
  if (self.classList.contains('Trash')) {
    const nextTrash = self.cloneNode(true);
    nextTrash.draggable = null;
    setStyle(nextTrash, { backgroundColor: 'black' });
    return element.appendChild(nextTrash);
  }

  self.remove();
  element.appendChild(self);
}
