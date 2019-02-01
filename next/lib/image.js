export function getImageFromURL(url) {
  const img = new Image()
  img.src = url
  return new Promise(resolve => {
    img.addEventListener('load', ({ target }) => resolve(target))
  })
}

export async function getImageDataFromURL(url) {
  const image = await getImageFromURL(url)
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export function getURLFromImageData(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const ctx = canvas.getContext('2d')
  ctx.putImageData(image, 0, 0)

  return canvas.toDataURL()
}
