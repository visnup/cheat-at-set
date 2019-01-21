import React, { Component } from 'react'
import styled from 'styled-components'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { threshold } from './luminosity'
import findCards, { thresholded } from './cards'
import sets from './sets'

const colors = schemeCategory10.map(c => {
  c = color(c)
  c.opacity = 0.9
  return c
})

function screenY(event) {
  return event.screenY || event.touches[0].screenY
}

class Cheat extends Component {
  state = { adjustThreshold: null }

  async componentDidMount() {
    const src = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    this.video.srcObject = src

    this.video.addEventListener('loadeddata', ({ target }) => {
      const track = target.srcObject.getVideoTracks()[0]
      const { width, height } = track.getSettings()
      this.canvas.width = width
      this.canvas.height = height

      this.loop()
    })
  }

  loop = () => {
    this.draw()
    requestAnimationFrame(this.loop)
    // setTimeout(this.loop, 100)
  }

  draw() {
    const { video, canvas } = this
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (this.state.adjustThreshold) ctx.putImageData(thresholded(image), 0, 0)

    const cards = findCards(image)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    for (const card of cards) {
      console.log(card.toString())
      ctx.beginPath()
      for (const [x, y] of card.contour) ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }

    let i = 0
    for (const set of sets(cards)) {
      console.log(set)
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

  toggleThreshold = event => {
    if (event.type === 'mousedown' || event.type === 'touchstart')
      this.setState({
        adjustThreshold: {
          value: threshold.value,
          screenY: screenY(event),
        },
      })
    else this.setState({ adjustThreshold: null })
  }

  moveThreshold = event => {
    const { adjustThreshold } = this.state
    if (adjustThreshold)
      threshold.value =
        adjustThreshold.value + screenY(event) - adjustThreshold.screenY
  }

  render() {
    return (
      <div
        {...this.props}
        onMouseDown={this.toggleThreshold}
        onMouseUp={this.toggleThreshold}
        onMouseMove={this.moveThreshold}
        onTouchStart={this.toggleThreshold}
        onTouchEnd={this.toggleThreshold}
        onTouchMove={this.moveThreshold}
      >
        <video ref={ref => (this.video = ref)} autoPlay muted playsInline />
        <canvas ref={ref => (this.canvas = ref)} />
      </div>
    )
  }
}

export default styled(Cheat)`
  user-select: none;

  video,
  img {
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
