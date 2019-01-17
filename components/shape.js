import { scaleThreshold } from 'd3-scale'
import { polygonArea } from 'd3-polygon'

const threshold = scaleThreshold()
  .domain([0.13, 0.165])
  .range(['diamond', 'squiggle', 'oval'])

function shapeArea(contours, area) {
  return polygonArea(contours[0]) / area
}

export default function shape(contours, width, height) {
  if (!contours.length) return null
  return threshold(shapeArea(contours, width * height))
}
