import React, { Component } from 'react'
import styled from 'styled-components'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import cards from './cards'
import sets from './sets'

class Cheat extends Component {
  async componentDidMount() {
    const src = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    this.video.srcObject = src

    this.video.addEventListener('loadeddata', ({ target }) => {
      const track = target.srcObject.getVideoTracks()[0]
      const { width, height } = track.getSettings()
      this.canvas.width = width
      this.canvas.height = height
    })

    this.loop()
  }

  loop = () => {
    const { video, canvas } = this
    if (!video || !canvas) return

    if (canvas.width) {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const colors = schemeCategory10.map(c => {
        c = color(c)
        c.opacity = 0.9
        return c
      })

      let i = 0
      for (const set of sets(cards(image, 200))) {
        ctx.strokeStyle = colors[i++ % colors.length]
        for (const card of set) {
          ctx.lineWidth = card.width = card.width || 18
          card.width /= 2
          ctx.beginPath()
          for (const [x, y] of card.contour) ctx.lineTo(x, y)
          ctx.closePath()
          ctx.stroke()
        }
      }
    }

    requestAnimationFrame(this.loop)
  }

  render() {
    return (
      <div {...this.props}>
        <video ref={ref => (this.video = ref)} autoPlay muted playsInline />
        <canvas ref={ref => (this.canvas = ref)} />
      </div>
    )
  }
}

export default styled(Cheat)`
  video,
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    opacity: 0;
  }

  canvas {
    width: 100vw;
    height: auto;
  }
`
