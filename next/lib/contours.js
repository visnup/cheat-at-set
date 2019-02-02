const traceContour = (imageData, i) => {

  const start = i
  const contour = [start]

  let direction = 3
  let p = start

  while(true) {

    const n = neighbours(imageData, p, 0)

    // find the first neighbour starting from
    // the direction we came from
    let offset = direction - 3 + 8
    /*
    directions:
      0   1   2
      7       3
      6   5   4

    start indexes:
      5  6   7
      4      0
      3  2   1
    */

    direction = -1
    for (let idx, i = 0; i < 8; i++) {
      idx = (i + offset) % 8

      if(imageData.data[n[idx] * 4] > 0) {
        direction = idx
        break
      }
    }

    p = n[direction]

    if(p === start || !p) {
      break
    } else {
      contour.push(p)
    }

  }

  return contour
}


// list of neighbours to visit
const neighbours = (image, i, start) => {
  const w = image.width

  const mask = []

  if((i % w) === 0) {
    mask[0] = mask[6] = mask[7] = -1
  }

  if(((i+1) % w) === 0) {
    mask[2] = mask[3] = mask[4] = -1
  }

  // hack - vertical edging matters less because
  // it will get ignored by matching it to the source

  return offset([
    mask[0] || i - w - 1,
    mask[1] || i - w,
    mask[2] || i - w + 1,
    mask[3] || i + 1,
    mask[4] || i + w + 1,
    mask[5] || i + w,
    mask[6] || i + w - 1,
    mask[7] || i - 1
  ], start)
}

const offset = (array, by) =>
  array.map( (_v, i) =>
    array[(i + by) % array.length]
  )


function contourFinder (imageData) {

  const contours = []
  const seen = []
  let skipping = false

  for (var i = 0; i < imageData.data.length; i++) {

    if(imageData.data[i * 4] > 128) {
      if(seen[i] || skipping) {
        skipping = true

      } else {
        var contour = traceContour(imageData, i)

        contours.push(contour)

        // this could be a _lot_ more efficient
        contour.forEach(c => {
          seen[c] = true
        })

      }

    } else {
      skipping = false
    }
  }

  return contours

}


// export for testing
contourFinder._ = {traceContour, neighbours, offset}

export default contourFinder
