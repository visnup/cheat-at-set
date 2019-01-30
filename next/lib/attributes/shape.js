import { mean } from 'd3-array'
import { scaleThreshold } from 'd3-scale'
import { polygonArea, polygonHull } from 'd3-polygon'

const areaScale = scaleThreshold()
  .domain([0.1, 0.15, 0.2])
  .range([null, 'diamond-squiggle', 'oval', null])

function shapeArea(contours, area) {
  return mean(contours.map(contour => polygonArea(contour) / area))
}

const hullScale = scaleThreshold()
  .domain([0.1, 0.2])
  .range(['diamond', 'squiggle', null])

function hullArea(contours) {
  return mean(contours.map(contour => {
    const hullArea = polygonArea(polygonHull(contour))
    return (hullArea - polygonArea(contour)) / hullArea
  }))
}

export default function shape(contours, width, height) {
  if (!contours.length) return null
  const area = areaScale(shapeArea(contours, width * height))
  return area === 'diamond-squiggle' ? hullScale(hullArea(contours)) : area
}
