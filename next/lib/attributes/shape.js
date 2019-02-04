import { extent, mean } from 'd3-array'
import { polygonArea, polygonHull } from 'd3-polygon'
import { sortBy, zip } from 'lodash'

const shapeCentroids = [
  { shape: 'diamond', center: [0.53, 0.068] },
  { shape: 'squiggle', center: [0.735, 0.161] },
  { shape: 'oval', center: [0.825, 0.040] },
]

function polygonBox(points) {
  return zip(extent(points, ([x, y]) => x), extent(points, ([x, y]) => y))
}

function polygonBoxArea(points) {
  const [min, max] = polygonBox(points)
  return (max[0] - min[0]) * (max[1] - min[1])
}

function shapeArea(contours) {
  return mean(contours.map(contour => Math.abs(polygonArea(contour)) / polygonBoxArea(contour)))
}

function hullArea(contours) {
  return mean(contours.map(contour => {
    const hullArea = Math.abs(polygonArea(polygonHull(contour)))
    return (hullArea - Math.abs(polygonArea(contour))) / hullArea
  }))
}

export default function shape(contours) {
  if (!contours.length) return null
  const point = [shapeArea(contours), hullArea(contours)]
  return sortBy(shapeCentroids, ({ center }) => {
    const d = [point[0] - center[0], point[1] - center[1]]
    return d[0] * d[0] + d[1] * d[1]
  })[0].shape
}
