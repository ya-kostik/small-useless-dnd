export function px(value) {
  return `${value}px`;
}

export function rgba(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`
}

export function rgb(r, g, b) {
  return rgba(r, g, b, 1);
}

export function getRect(element) {
  return element.getBoundingClientRect();
}

export function getStyle(element, pseudoElement) {
  return window.getComputedStyle(element, pseudoElement);
}

export function setStyle(element, style) {
  Object.assign(element.style, style);
}

export function opacity(element, value) {
  element.style.opacity = value;
}

export function display(element, value) {
  element.style.display = value;
}
