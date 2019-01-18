import { extent } from 'd3-array'
import { scaleThreshold } from 'd3-scale'
import { luminosity } from './luminosity'

const threshold = scaleThreshold()
  .domain([180, 240])
  .range(['solid', 'striped', 'outlined'])

function interiorLuminosity(image, contours) {
  // single shape
  const shape = contours[0]

  // sample interior
  const x = extent(shape, p => p[0]),
    y = extent(shape, p => p[1]),
    w = x[1] - x[0],
    width = w / 3,
    dw = (w - width) / 2,
    h = y[1] - y[0],
    height = h / 2,
    dh = (h - height) / 2
  const { data } = image
  let sum = 0
  for (let i = 0; i < data.length; i += 4)
    sum += data[i + 3] ? luminosity(data[i], data[i + 1], data[i + 2]) : 255
  return (sum / data.length) * 4
}

export default function shade(image, contours) {
  if (!contours.length) return null
  return threshold(interiorLuminosity(image, contours))
}
