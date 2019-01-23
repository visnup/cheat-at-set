import { scaleThreshold } from 'd3-scale'
import { polygonArea } from 'd3-polygon'

const scale = scaleThreshold()
  .domain([0.1, 0.13, 0.165, 0.2])
  .range([null, 'diamond', 'squiggle', 'oval', null])

function shapeArea(contours, area) {
  return polygonArea(contours[0]) / area
}

export default function shape(contours, width, height) {
  if (!contours.length) return null
  return scale(shapeArea(contours, width * height))
}
