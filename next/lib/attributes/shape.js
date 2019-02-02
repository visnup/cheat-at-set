import { mean } from 'd3-array'
import { polygonArea, polygonHull } from 'd3-polygon'
import { sortBy } from 'lodash'

const shapeCentroids = [
  { shape: 'diamond', center: [0.104, 0.068] },
  { shape: 'squiggle', center: [0.124, 0.161] },
  { shape: 'oval', center: [0.149, 0.040] },
]

function shapeArea(contours, area) {
  return mean(contours.map(contour => Math.abs(polygonArea(contour)) / area))
}

function hullArea(contours) {
  return mean(contours.map(contour => {
    const hullArea = Math.abs(polygonArea(polygonHull(contour)))
    return (hullArea - Math.abs(polygonArea(contour))) / hullArea
  }))
}

export default function shape(contours, width, height) {
  if (!contours.length) return null
  const point = [shapeArea(contours, width * height), hullArea(contours)]
  return sortBy(shapeCentroids, ({ center }) => {
    const d = [point[0] - center[0], point[1] - center[1]]
    return d[0] * d[0] + d[1] * d[1]
  })[0].shape
}
