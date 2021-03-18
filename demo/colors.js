export function calcPercents(value, maxValue) {
  return Math.round(value / maxValue * 100);
}

export function getColor(p, max) {
  return Math.min(255 * p / 100 + 100, max);
}

export function getColorVector(x, y, maxX, maxY) {
  const [pX, pY, pZ] = [
    calcPercents(x, maxX),
    calcPercents(y, maxY),
    calcPercents(x + y, maxX + maxY)
  ];

  return [
    getColor(pX, 200),
    getColor(pY, 200),
    getColor(pZ, 255)
  ];
}
