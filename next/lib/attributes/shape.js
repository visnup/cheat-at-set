import { mean } from 'd3-array'
import { polygonArea, polygonHull } from 'd3-polygon'
import { sortBy } from 'lodash'

const shapeCentroids = [
  { shape: 'diamond', center: [0.109, 0.068] },
  { shape: 'squiggle', center: [0.125, 0.158] },
  { shape: 'oval', center: [0.162, 0.031] },
]

function shapeArea(contours, area) {
  return mean(contours.map(contour => polygonArea(contour) / area))
}

function hullArea(contours) {
  return mean(contours.map(contour => {
    const hullArea = polygonArea(polygonHull(contour))
    return (hullArea - polygonArea(contour)) / hullArea
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
