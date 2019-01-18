import { scaleThreshold } from 'd3-scale'

const threshold = scaleThreshold()
  .domain([0.45, 0.75])
  .range([1, 2, 3])

function percentageWidth(contours, width) {
  let min = width,
    max = 0

  for (const shape of contours) {
    for (const [x, y] of shape) {
      if (x < min) min = x
      if (x > max) max = x
    }
  }

  // mirror a min or max to the other side for incomplete shape finding
  if (width - min > max) max = width - min
  if (width - max < min) min = width - max

  return (max - min) / width
}

export default function number(contours, width) {
  return threshold(percentageWidth(contours, width))
}
