import { polygonArea, polygonHull, polygonLength } from 'd3-polygon'
import { chain, inRange, pick } from 'lodash'
import contourFinder from 'contours'
import perspectiveTransform from 'perspective-transform'
import { luminosity, threshold } from './luminosity'
import color from './attributes/color'
import number from './attributes/number'
import shade from './attributes/shade'
import shape from './attributes/shape'

export function thresholded(image) {
  const result = new ImageData(image.width, image.height),
    r = result.data,
    d = image.data
  for (let i = 0; i < d.length; i += 4) {
    r[i] = r[i + 1] = r[i + 2] = threshold(luminosity(d[i], d[i + 1], d[i + 2]))
    r[i + 3] = d[i + 3]
  }

  return result
}

function rectangle(points) {
  let rect = points
  while (rect.length > 4) {
    const area = polygonArea(rect)
    let min = Infinity,
      minRect = null
    for (let i = 0; i < rect.length; i++) {
      const smaller = rect.slice(0, i).concat(rect.slice(i + 1)),
        difference = area - polygonArea(smaller)
      if (difference < min) {
        min = difference
        minRect = smaller
      }
    }
    rect = minRect
  }

  // try to correct vertex order (counter-clockwise from top right corner (upside down is ok))
  const edges = [
    polygonLength([rect[1], rect[0]]),
    polygonLength([rect[2], rect[1]]),
  ]
  if (edges[1] > edges[0])
    // need to rotate starting vertex
    rect = rect.slice(1).concat(rect.slice(0, 1))

  return rect
}

function transform(image, rectangle) {
  const crop = 5,
    cw = 150,
    ch = (cw / 3) * 2,
    target = _.flatten([
      [cw + crop, -crop],
      [-crop, -crop],
      [-crop, ch + crop],
      [cw + crop, ch + crop],
    ])

  const tx = perspectiveTransform(_.flatten(rectangle), target)

  const card = new ImageData(cw, ch)

  for (let i = 0; i < card.data.length; i += 4) {
    const x = (i / 4) % cw,
      y = Math.floor(i / 4 / cw),
      [xs, ys] = tx.transformInverse(x, y).map(Math.floor),
      j = (ys * image.width + xs) * 4
    for (let d = 0; d < 4; d++) card.data[i + d] = image.data[j + d]
  }

  return card
}

function contours(image) {
  const area = image.width * image.height
  return chain(contourFinder(thresholded(image)))
    .filter(c => c.length > 4) // large enough to have area
    .map(c => c.map(p => [p % image.width, Math.floor(p / image.width)])) // switch to x,y
    .filter(contour => inRange(polygonArea(contour), area / 10, area / 5))
    .value()
}

function whiteBalance(image) {
  const { data } = image

  // average the top and bottom border for what should be white
  const border = [0, 0, 0, 255]
  for (let y of [0, image.height - 1]) {
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4
      for (let d = 0; d < 3; d++) border[d] += data[i + d]
    }
  }
  for (let d = 0; d < 3; d++) border[d] /= image.width * 2

  // adjust in RGB space
  const result = new ImageData(image.width, image.height)
  const multiplier = border.map(x => 255 / x)
  for (let i = 0; i < data.length; i += 4)
    for (let d = 0; d < 4; d++) result.data[i + d] = data[i + d] * multiplier[d]

  return result
}

export class Card {
  constructor(image, contour) {
    this.contour = contour
    this.area = polygonArea(contour)
    this.rectangle = rectangle(contour)
    this.image = transform(image, this.rectangle)
    this.whiteBalanced = whiteBalance(this.image)
    this.contours = contours(this.image)

    this.color = color(this.whiteBalanced)
    this.shade = shade(this.whiteBalanced, this.contours)
    this.number = number(this.contours, this.image.width)
    this.shape = shape(this.contours, this.image.width, this.image.height)

    this.valid = this.shade && this.shape && this.number && this.color
  }

  toJSON() {
    return pick(this, ['shade', 'shape', 'number', 'color', 'contour'])
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }
}

export default function cards(image) {
  const area = image.width * image.height
  return chain(contourFinder(thresholded(image)))
    .filter(c => c.length > 4) // large enough to have area
    .map(c => c.map(p => [p % image.width, Math.floor(p / image.width)])) // switch to x,y
    .map(polygonHull)
    .filter(hull => inRange(polygonArea(hull), area / 100, area / 5))
    .map(hull => new Card(image, hull))
    .filter('valid')
    .sortBy('area')
    .take(16)
    .value()
}
