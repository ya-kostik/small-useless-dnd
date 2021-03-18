export function find(selector, element = document) {
  return element.querySelector(selector);
}

export function findAll(selector, element = document) {
  return element.querySelectorAll(selector);
}

export function search(element, searcher, topElement = document.body) {
  if (element === topElement) return null;
  if (searcher(element)) return element;
  if (element.parentElement === null) return null;
  return search(element.parentElement, searcher);
}
