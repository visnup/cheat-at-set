import { extent } from 'd3-array'
import { scaleThreshold } from 'd3-scale'
import { luminosity } from '../luminosity'

const scale = scaleThreshold()
  .domain([180, 240])
  .range(['solid', 'striped', 'outlined'])

function interiorLuminosity(image, contours) {
  const { data } = image
  let sum = 0, n = 0

  for (const shape of contours) {
    // sample interior
    const xExtent = extent(shape, p => p[0]),
      yExtent = extent(shape, p => p[1]),
      dx = Math.floor((xExtent[1] - xExtent[0]) / 3),
      dy = Math.floor((yExtent[1] - yExtent[0]) / 4)

    for (let y = yExtent[0] + dy; y < yExtent[1] - dy; y++) {
      for (let x = xExtent[0] + dx; x < xExtent[1] - dx; x++) {
        const i = (y * image.width + x) * 4
        sum += luminosity(data[i], data[i + 1], data[i + 2])
        n++
      }
    }
  }

  return sum / n
}

export default function shade(image, contours) {
  if (!contours.length) return null
  return scale(interiorLuminosity(image, contours))
}
