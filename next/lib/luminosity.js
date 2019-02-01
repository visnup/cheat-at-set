export function luminosity(r, g, b) {
  return 0.2126 * r + 0.7125 * g + 0.0722 * b
}

export function threshold(l, value) {
  return l > value ? 255 : 0
}
