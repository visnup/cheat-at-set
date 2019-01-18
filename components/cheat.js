import React, { Component } from 'react'
import styled from 'styled-components'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import DOM from './DOM'
import cards from './cards'
import sets from './sets'

function cheat(src, canvas) {
  if (!canvas.width) return
  const ctx = canvas.getContext('2d')
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height)

  const colors = schemeCategory10.map(c => {
    c = color(c)
    c.opacity = 0.9
    return c
  })

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  sets(cards(image)).forEach((set, i) => {
    ctx.strokeStyle = colors[i % colors.length]
    for (const card of set) {
      ctx.lineWidth = (card.width = card.width || 18)
      card.width /= 2
      ctx.beginPath()
      for (const [x, y] of card.contour)
        ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }
  })
}

class Cheat extends Component {
  async componentDidMount() {
    const src = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    this.video.srcObject = src

    this.video.addEventListener('loadeddata', () => {
      if (this.canvas) {
        const { width, height } = DOM.size(this.video)
        this.canvas.width = width
        this.canvas.height = height
      }
    })

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
        <video ref={ref => this.video = ref} autoPlay muted playsInline src="https://gist.githubusercontent.com/visnup/71ab08f7e707ebf9953db5d402cc290e/raw/0b3a42416e4b4687de983d3644cc5be80e286e90/SetCards.jpg" />
        {/* <img ref={ref => this.video = ref} src="/static/SetCards.jpg" /> */}
        <canvas ref={ref => this.canvas = ref} />
      </div>
    )
  }
}

export default styled(Cheat)`
  video, img {
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
