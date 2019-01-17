// URL: https://beta.observablehq.com/@visnup/cheat-at-set/2
// Title: Runtime
// Author: Visnu Pitiyanuvath (@visnup)
// Version: 3086
// Runtime version: 1

const m0 = {
  id: "df8ca6e8f8bb9861@3086",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Runtime

A runtime version of [Cheat at Set](https://beta.observablehq.com/@visnup/cheat-at-set).`
)})
    },
    {
      name: "video",
      inputs: ["html","width","height"],
      value: (async function(html,width,height)
{
  const video = html`<video width="${width/10}" height="${height/10}" autoplay muted playsinline />`

  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  video.srcObject = stream
  
  return video
}
)
    },
    {
      name: "result",
      inputs: ["DOM","width","height","src","contours","d3","cards","sets"],
      value: (function(DOM,width,height,src,contours,d3,cards,sets)
{
  const canvas = DOM.canvas(width, height),
        ctx = canvas.getContext('2d')

  ctx.drawImage(src, 0, 0, width, height)

  const hulls = contours.map(d3.polygonHull),
        widths = new Array(cards.length).fill(12),
        colors = d3.schemeCategory10.map(c => {
          c = d3.color(c)
          c.opacity = 0.9
          return c
        })
  
  sets.forEach((set, i) => {
    ctx.strokeStyle = colors[i % colors.length]
    for (const card of set) {
      const hull = hulls[card]
      ctx.lineWidth = widths[card]
      widths[card] /= 2
      ctx.beginPath()
      for (const [x, y] of hull)
        ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }
  })

  return canvas
}
)
    },
    {
      name: "width",
      value: (function(){return(
800
)})
    },
    {
      name: "height",
      value: (function(){return(
600
)})
    },
    {
      name: "luminosity",
      value: (function(){return(
function luminosity(r, g, b) {
  return 0.2126 * r + 0.7125 * g + 0.0722 * b
}
)})
    },
    {
      name: "threshold",
      value: (function(){return(
function threshold(l, value=212) {
  return l > value ? 255 : 0
}
)})
    },
    {
      name: "thresholded",
      inputs: ["height","DOM","width","threshold","luminosity"],
      value: (function(height,DOM,width,threshold,luminosity){return(
function thresholded(src) {
  if (isNaN(height)) return null
  const canvas = DOM.canvas(width, height),
        ctx = canvas.getContext('2d')

  ctx.drawImage(src, 0, 0, width, height)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image
  for (let i = 0; i < data.length; i += 4)
    data[i] = data[i+1] = data[i+2] = threshold(luminosity(data[i], data[i+1], data[i+2]))
  ctx.putImageData(image, 0, 0)

  return canvas
}
)})
    },
    {
      name: "src",
      inputs: ["DOM","width","height","video"],
      value: (function*(DOM,width,height,video)
{
  const canvas = DOM.canvas(width, height)
  const ctx = canvas.getContext('2d')
  
  while (true) {
    yield new Promise(resolve => {
      ctx.drawImage(video, 0, 0, width, height)
      setTimeout(() => resolve(canvas), 100)
    })
  }
}
)
    },
    {
      name: "contours",
      inputs: ["thresholded","src","_","contourFinder","width","d3"],
      value: (function(thresholded,src,_,contourFinder,width,d3)
{
  const canvas = thresholded(src),
        ctx = canvas.getContext('2d')
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return _(contourFinder(image))
    .filter(c => c.length > 100) // large enough ones to be cards
    .map(c => c.map(p => [p % width, Math.floor(p / width)])) // switch to x,y
    .sortBy(d3.polygonArea)
    .take(12)
    .value()
}
)
    },
    {
      name: "rectangle",
      inputs: ["d3"],
      value: (function(d3){return(
function rectangle(points) {
  let rect = d3.polygonHull(points)
  while (rect.length > 4) {
    const area = d3.polygonArea(rect)
    let min = Infinity,
        minRect = null
    for (let i = 0; i < rect.length; i++) {
      const smaller = rect.slice(0, i).concat(rect.slice(i+1)),
            difference = area - d3.polygonArea(smaller)
      if (difference < min) {
        min = difference
        minRect = smaller
      }
    }
    rect = minRect
  }
  
  // try to correct vertex order (counter-clockwise from top right corner (upside down is ok))
  const edges = [ d3.polygonLength([rect[1], rect[0]]), d3.polygonLength([rect[2], rect[1]]) ]
  if (edges[1] > edges[0]) // need to rotate starting vertex
    rect = rect.slice(1).concat(rect.slice(0, 1))
  
  return rect
}
)})
    },
    {
      name: "rectangles",
      inputs: ["_","contours","rectangle"],
      value: (function(_,contours,rectangle){return(
_.take(contours, 12).map(rectangle)
)})
    },
    {
      name: "cards",
      inputs: ["height","html","width","src","_","rectangles","perspectiveTransform","DOM"],
      value: (function(height,html,width,src,_,rectangles,perspectiveTransform,DOM)
{
  if (isNaN(height)) return null

  const canvas = html`<canvas width="${width}" height="${height}" />`,
        ctx = canvas.getContext('2d')
  ctx.drawImage(src, 0, 0, width, height)
  const image = ctx.getImageData(0, 0, width, height)

  const crop = 5,
        cw = 150, ch = cw / 3 * 2,
        target = _.flatten([[cw, 0], [0, 0], [0, ch], [cw, ch]])

  return rectangles.map(rectangle => {
    const tx = perspectiveTransform(_.flatten(rectangle), target)

    const canvas = DOM.canvas(cw-crop-crop, ch-crop-crop)
    const ctx = canvas.getContext('2d')
    const card = new ImageData(cw, ch)
    
    for (let i = 0; i < card.data.length; i += 4) {
      const x = i/4 % cw, y = Math.floor(i/4 / cw),
            [xs, ys] = tx.transformInverse(x, y).map(Math.floor),
            j = (ys * width + xs) * 4
      for (let d = 0; d < 4; d++)
        card.data[i + d] = image.data[j + d]
    }
    ctx.putImageData(card, -crop, -crop)

    return canvas
  })
}
)
    },
    {
      inputs: ["html","cards"],
      value: (function(html,cards){return(
html`${cards}`
)})
    },
    {
      name: "shapeContours",
      inputs: ["cards","threshold","luminosity","contourFinder"],
      value: (function(cards,threshold,luminosity,contourFinder){return(
cards.map(card => {
  const min = 100, max = 300
  const ctx = card.getContext('2d')

  const src = ctx.getImageData(0, 0, card.width, card.height)
  const image = ctx.createImageData(src)
  const { data } = image
  for (let i = 0; i < data.length; i += 4)
    data[i] = data[i+1] = data[i+2] = threshold(luminosity(src.data[i], src.data[i+1], src.data[i+2]))

  return contourFinder(image)
    .filter(c => min < c.length && c.length < max) // complicated enough to be shapes, smaller than the entire card
    .map(c => c.map(p => [p % card.width, Math.floor(p / card.width)])) // switch to x,y
    // filter on polygonArea?
})
)})
    },
    {
      name: "whiteBalanced",
      inputs: ["cards","DOM"],
      value: (function(cards,DOM){return(
cards.map(card => {
  const canvas = DOM.canvas(card.width, card.height),
        ctx = canvas.getContext('2d')
  ctx.putImageData(card.getContext('2d').getImageData(0, 0, card.width, card.height), 0, 0)
  
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image
  
  // average the border for what should be white
  const border = [0, 0, 0]
  for (let y of [0, canvas.height - 1]) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4
      for (let d = 0; d < 3; d++)
        border[d] += data[i + d]
    }
  }
  for (let d = 0; d < 3; d++)
    border[d] /= canvas.width * 2
  
  // adjust in RGB space
  const multiplier = border.map(x => 255/x)
  for (let i = 0; i < data.length; i += 4)
    for (let d = 0; d < 3; d++)
      data[i+d] *= multiplier[d]
  ctx.putImageData(image, 0, 0)
  
  return canvas
})
)})
    },
    {
      name: "hues",
      inputs: ["threshold","luminosity","d3"],
      value: (function(threshold,luminosity,d3){return(
function* hues(card) {
  const ctx = card.getContext('2d'),
        { data } = ctx.getImageData(0, 0, card.width, card.height)
  
  for (let i = 0; i < data.length; i += 4)
    if (threshold(luminosity(data[i], data[i+1], data[i+2])) === 0)
      yield d3.hsl(d3.rgb(data[i], data[i+1], data[i+2])).h
}
)})
    },
    {
      name: "color",
      inputs: ["d3","hues"],
      value: (function(d3,hues){return(
function color(card) {
  const hue = d3.scaleThreshold()
        .domain([70, 180, 340])
        .range(['red', 'green', 'purple', 'red'])
  
  const counts = { red: 0, green: 0, purple: 0 }

  for (const h of hues(card))
    counts[hue(h)]++
  const space = counts.red + counts.green + counts.purple

  // return counts
  if (counts.purple / space > 0.2)
    return 'purple'
  else if (counts.green / space > 0.5)
    return 'green'
  else
    return 'red'
}
)})
    },
    {
      name: "colors",
      inputs: ["whiteBalanced","color"],
      value: (function(whiteBalanced,color){return(
whiteBalanced.map(color)
)})
    },
    {
      name: "percentageWidth",
      value: (function(){return(
function percentageWidth(card, contours) {
  let min = card.width,
      max = 0
  
  for (const shape of contours) {
    for (const [x, y] of shape) {
      if (x < min)
        min = x
      if (x > max)
        max = x
    }
  }
  
  // mirror a min or max to the other side for incomplete shape finding
  if (card.width - min > max)
    max = card.width - min
  if (card.width - max < min)
    min = card.width - max
  
  return (max - min) / card.width
}
)})
    },
    {
      name: "number",
      inputs: ["d3","percentageWidth"],
      value: (function(d3,percentageWidth){return(
function number(card, contours) {
  if (!contours.length) return null
  return d3.scaleThreshold()
    .domain([0.45, 0.75])
    .range([1, 2, 3])
    (percentageWidth(card, contours))
}
)})
    },
    {
      name: "numbers",
      inputs: ["cards","number","shapeContours"],
      value: (function(cards,number,shapeContours){return(
cards.map((card, i) => number(card, shapeContours[i]))
)})
    },
    {
      name: "interiorLuminosity",
      inputs: ["d3","luminosity"],
      value: (function(d3,luminosity){return(
function interiorLuminosity(card, contours) {
  // single shape
  const shape = contours[0]
  
  // sample interior
  const x = d3.extent(shape, p => p[0]),
        y = d3.extent(shape, p => p[1]),
        w = x[1] - x[0], width = w/3, dw = (w - width) / 2,
        h = y[1] - y[0], height = h/2, dh = (h - height) / 2
  const image = card.getContext('2d').getImageData(x[0] + dw, y[0] + dh, width, height)
  const { data } = image
  let sum = 0
  for (let i = 0; i < data.length; i += 4)
    sum += data[i+3] ? luminosity(data[i], data[i+1], data[i+2]) : 255
  return sum / data.length * 4
}
)})
    },
    {
      name: "shade",
      inputs: ["d3","interiorLuminosity"],
      value: (function(d3,interiorLuminosity){return(
function shade(card, contours) {
  if (!contours.length) return null
  return d3.scaleThreshold()
    .domain([180,240])
    .range(['solid', 'striped', 'outlined'])
    (interiorLuminosity(card, contours))
}
)})
    },
    {
      name: "shades",
      inputs: ["whiteBalanced","shade","shapeContours"],
      value: (function(whiteBalanced,shade,shapeContours){return(
whiteBalanced.map((card, i) => shade(card, shapeContours[i]))
)})
    },
    {
      name: "shapeArea",
      inputs: ["d3"],
      value: (function(d3){return(
function shapeArea(card, contours) {
  return d3.polygonArea(contours[0]) / card.width / card.height
}
)})
    },
    {
      name: "shape",
      inputs: ["d3","shapeArea"],
      value: (function(d3,shapeArea){return(
function shape(card, contours) {
  if (!contours.length) return null
  return d3.scaleThreshold()
    .domain([0.13, 0.165])
    .range(['diamond', 'squiggle', 'oval'])
    (shapeArea(card, contours))
}
)})
    },
    {
      name: "shapes",
      inputs: ["cards","shape","shapeContours"],
      value: (function(cards,shape,shapeContours){return(
cards.map((card, i) => shape(card, shapeContours[i]))
)})
    },
    {
      name: "isSet",
      inputs: ["colors","numbers","shades","shapes","allSame","allDifferent"],
      value: (function(colors,numbers,shades,shapes,allSame,allDifferent){return(
function isSet(cards) {
  return [ colors, numbers, shades, shapes ].every(attribute => {
    attribute = cards.map(i => attribute[i])
    return allSame(attribute) || allDifferent(attribute)
  })
}
)})
    },
    {
      name: "allSame",
      value: (function(){return(
function allSame(attributes) {
  return attributes[0] === attributes[1] &&
         attributes[1] === attributes[2]
}
)})
    },
    {
      name: "allDifferent",
      value: (function(){return(
function allDifferent(attributes) {
  return attributes[0] !== attributes[1] &&
         attributes[0] !== attributes[2] &&
         attributes[1] !== attributes[2]
}
)})
    },
    {
      name: "sets",
      inputs: ["cards","combinations","_","isSet"],
      value: (function(cards,combinations,_,isSet){return(
cards.length ? [...combinations(_.range(0, cards.length), 3)].filter(isSet) : []
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`## Appendix`
)})
    },
    {
      name: "contourFinder",
      inputs: ["require"],
      value: (function(require){return(
require('contours')
)})
    },
    {
      name: "perspectiveTransform",
      inputs: ["require"],
      value: (function(require){return(
require('perspective-transform')
)})
    },
    {
      name: "combinations",
      inputs: ["require"],
      value: (function(require){return(
require('https://bundle.run/combinations-generator@1.0.1')
)})
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require('d3-scale', 'd3-scale-chromatic', 'd3-color', 'd3-polygon', 'd3-array')
)})
    },
    {
      name: "_",
      inputs: ["require"],
      value: (function(require){return(
require('lodash')
)})
    }
  ]
};

const notebook = {
  id: "df8ca6e8f8bb9861@3086",
  modules: [m0]
};

export default notebook;
