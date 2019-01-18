import React, { Component } from 'react'
import styled from 'styled-components'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import cards, { thresholded } from './cards'
import sets from './sets'

const colors = schemeCategory10.map(c => {
  c = color(c)
  c.opacity = 0.9
  return c
})

class Cheat extends Component {
  state = {
    adjustThreshold: false,
    threshold: 212,
  }

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
      // console.time('cards')
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

      if (this.state.adjustThreshold)
        ctx.putImageData(thresholded(image, this.state.threshold), 0, 0)

      let i = 0
      for (const set of sets(cards(image, this.state.threshold))) {
        ctx.strokeStyle = colors[i++ % colors.length]
        console.log(set)
        for (const card of set) {
          ctx.lineWidth = card.width = card.width || 18
          card.width /= 2
          ctx.beginPath()
          for (const [x, y] of card.contour) ctx.lineTo(x, y)
          ctx.closePath()
          ctx.stroke()
        }
      }
      // console.timeEnd('cards')
    }

    requestAnimationFrame(this.loop)
  }

  toggleThreshold = event => {
    this.setState({
      adjustThreshold: (event.type === 'mousedown' || event.type === 'touchstart') && event.screenY,
    })
  }

  moveThreshold = event => {
    if (this.state.adjustThreshold)
      this.setState({
        threshold: this.state.threshold + event.screenY - this.state.adjustThreshold,
        adjustThreshold: event.screenY,
      })
  }

  render() {
    return (
      <div {...this.props}
          onMouseDown={this.toggleThreshold} onMouseUp={this.toggleThreshold} onMouseMove={this.moveThreshold}
          onTouchStart={this.toggleThreshold} onTouchEnd={this.toggleThreshold} onTouchMove={this.moveThreshold}>
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
