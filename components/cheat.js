import React, { Component } from 'react'
import styled from 'styled-components'

function luminosity(r, g, b) {
  return 0.2126 * r + 0.7125 * g + 0.0722 * b
}

function threshold(l, value=212) {
  return l > value ? 255 : 0
}

function thresholded(src, width, height) {
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

function cheat(src, canvas) {
  const ctx = canvas.getContext('2d')
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height)
}

class Cheat extends Component {
  async componentDidMount() {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    if (this.canvas) {
      const { width, height } = this.canvas.getBoundingClientRect()
      this.canvas.width = width
      this.canvas.height = height
    }

    this.loop()
  }

  loop = () => {
    const { video, canvas } = this
    if (!canvas) return

    cheat(video, canvas)
    setTimeout(this.loop, 2000)
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
    top: 50px;
    left: 50px;
    width: 1px;
    height: 1px;
  }

  canvas {
    width: 100vw;
    height: 100vh;
  }
`
