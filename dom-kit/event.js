export function on(element, event, handler, options) {
  return element.addEventListener(event, handler, options);
}

export function off(element, event, handler, options) {
  return element.removeEventListener(event, handler, options);
}

export function prevent(evt) {
  evt.preventDefault();
}

export function stop(evt, immediate) {
  immediate
    ? evt.stopImmediatePropagation()
    : evt.stopPropagation();
}


