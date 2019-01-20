import React, { Component } from 'react'
import styled from 'styled-components'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { threshold } from './luminosity'
import cards, { thresholded } from './cards'
import sets from './sets'

const colors = schemeCategory10.map(c => {
  c = color(c)
  c.opacity = 0.9
  return c
})

class Cheat extends Component {
  state = { adjustThreshold: null }

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

      this.loop()
    })
  }

  loop = () => {
    const { video, canvas } = this
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    console.time('cards')
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (this.state.adjustThreshold)
      ctx.putImageData(thresholded(image), 0, 0)

    let i = 0
    for (const set of sets(cards(image))) {
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
    console.timeEnd('cards')

    // requestAnimationFrame(this.loop)
    setTimeout(this.loop, 100)
  }

  toggleThreshold = event => {
    if (event.type === 'mousedown' || event.type === 'touchstart')
      this.setState({
        adjustThreshold: {
          value: threshold.value,
          screenY: event.screenY || event.touches[0].screenY,
        }
      })
    else
      this.setState({ adjustThreshold: null })
  }

  moveThreshold = event => {
    if (this.state.adjustThreshold) {
      const { value, screenY } = this.state.adjustThreshold
      threshold.value = value + (event.screenY || event.touches[0].screenY) - screenY
    }
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
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  canvas {
    width: 100vw;
    height: auto;
  }
`
