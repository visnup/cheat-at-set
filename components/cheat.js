import React, { Component } from 'react'
import styled from 'styled-components'
import { polygonArea, polygonHull, polygonLength } from 'd3-polygon'
import chain from 'lodash'
import contourFinder from 'contours'
import perspectiveTransform from 'perspective-transform'

const DOM = {
  size(video) {
    const track = video.srcObject.getVideoTracks()[0]
    return track.getSettings()
  },

  canvas({ width, height }) {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    return c
  }
}

function luminosity(r, g, b) {
  return 0.2126 * r + 0.7125 * g + 0.0722 * b
}

function threshold(l, value=212) {
  return l > value ? 255 : 0
}

function thresholded(image) {
  const result = new ImageData(image.width, image.height),
        r = result.data,
        d = image.data
  for (let i = 0; i < d.length; i += 4)
    r[i] = r[i+1] = r[i+2] = threshold(luminosity(d[i], d[i+1], d[i+2]))

  return result
}

function rectangle(points) {
  let rect = points
  while (rect.length > 4) {
    const area = polygonArea(rect)
    let min = Infinity,
        minRect = null
    for (let i = 0; i < rect.length; i++) {
      const smaller = rect.slice(0, i).concat(rect.slice(i+1)),
            difference = area - polygonArea(smaller)
      if (difference < min) {
        min = difference
        minRect = smaller
      }
    }
    rect = minRect
  }
  
  // try to correct vertex order (counter-clockwise from top right corner (upside down is ok))
  const edges = [ polygonLength([rect[1], rect[0]]), polygonLength([rect[2], rect[1]]) ]
  if (edges[1] > edges[0]) // need to rotate starting vertex
    rect = rect.slice(1).concat(rect.slice(0, 1))
  
  return rect
}

function cards(image, contours) {
  const crop = 5,
        cw = 150, ch = cw / 3 * 2,
        target = _.flatten([[cw, 0], [0, 0], [0, ch], [cw, ch]])

  return contours
    .map(rectangle)
    .map(rectangle => {
      const tx = perspectiveTransform(_.flatten(rectangle), target)

      const canvas = DOM.canvas(cw-crop-crop, ch-crop-crop),
            ctx = canvas.getContext('2d'),
            card = new ImageData(cw, ch)
      
      for (let i = 0; i < card.data.length; i += 4) {
        const x = i/4 % cw, y = Math.floor(i/4 / cw),
              [xs, ys] = tx.transformInverse(x, y).map(Math.floor),
              j = (ys * image.width + xs) * 4
        for (let d = 0; d < 4; d++)
          card.data[i + d] = image.data[j + d]
      }
      ctx.putImageData(card, -crop, -crop)

      return canvas
    })
}

function cheat(src, canvas) {
  const ctx = canvas.getContext('2d')
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const thresholdedImage = thresholded(image)
  const contours = chain(contourFinder(thresholdedImage))
    .filter(c => c.length > 100) // large enough ones to be cards
    .map(c => c.map(p => [p % canvas.width, Math.floor(p / canvas.width)])) // switch to x,y
    .map(polygonHull)
    .sortBy(polygonArea)
    .take(12)
    .value()
  // const c = cards(image, contours)
  // console.log(c)

  for (const contour of contours) {
    // const rect = rectangle(contour)
    ctx.beginPath()
    for (const [x, y] of contour)
      ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
  }
}

class Cheat extends Component {
  async componentDidMount() {
    const src = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    this.video.srcObject = src

    if (this.canvas) {
      const track = src.getVideoTracks()[0],
            { width, height } = track.getSettings()
      this.canvas.width = width
      this.canvas.height = height
    }

    this.loop()
  }

  loop = () => {
    const { video, canvas } = this
    if (!canvas) return

    cheat(video, canvas)
    setTimeout(this.loop, 30)
  }

  render() {
    return (
      <div {...this.props}>
        <video ref={ref => this.video = ref} autoPlay muted playsInline />
        <canvas ref={ref => this.canvas = ref} />
      </div>
    )
  }
}

export default styled(Cheat)`
  video {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  canvas {
    width: 100vw;
    height: auto;
  }
`
