export function luminosity(r, g, b) {
  return 0.2126 * r + 0.7125 * g + 0.0722 * b
}

export function threshold(l) {
  return l > threshold.value ? 255 : 0
}
threshold.value = 212
