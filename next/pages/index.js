import { Component } from 'react'
import { color } from 'd3-color'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { throttle } from 'lodash'
import Page from '../components/page'
import findCards, { thresholded } from '../lib/cards'
import findSets from '../lib/sets'

const colors = schemeCategory10.map(c => {
  c = color(c)
  c.opacity = 0.9
  return c
})

function screenY(event) {
  return event.screenY || event.touches[0].screenY
}

export default class Cheat extends Component {
  state = {
    threshold: 212,
    adjustThreshold: null,
    debug: false,
  }

  async componentDidMount() {
    const src = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        height: 720,
      },
    })
    this.video.srcObject = src

    this.video.addEventListener('loadeddata', ({ target }) => {
      const track = target.srcObject.getVideoTracks()[0]
      const { width, height } = track.getSettings()
      this.canvas.width = width / 2
      this.canvas.height = height / 2

      this.loop()
    })
  }

  loop = () => {
    const result = this.draw()
    if (this.state.debug) this.debug(result)
    requestAnimationFrame(this.loop)
    // setTimeout(this.loop, 100)
  }

  draw() {
    const { video, canvas } = this
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (this.state.adjustThreshold)
      ctx.putImageData(thresholded(image, this.state.threshold), 0, 0)

    const cards = findCards(image, this.state.threshold)
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
    const sets = findSets(cards)
    for (const set of sets) {
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

    return { image, cards }
  }

  async _debug({ image, cards }) {
    if (!this.state.debug) return

    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.putImageData(image, 0, 0)
    await fetch('/api/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: canvas.toDataURL(),
        batch: this.state.debug.batch,
        threshold: this.state.threshold,
        cards: cards.map(card => card.toJSON()),
      }),
    })
    this.setState(state => {
      if (state.debug)
        return { debug: { ...state.debug, saved: state.debug.saved + 1 } }
    })
  }
  debug = throttle(this._debug, 1000)

  toggleThreshold = event => {
    if (event.type === 'mousedown' || event.type === 'touchstart')
      this.setState({
        adjustThreshold: {
          initialValue: this.state.threshold,
          screenY: screenY(event),
        },
      })
    else this.setState({ adjustThreshold: null })
  }

  moveThreshold = event => {
    const { adjustThreshold } = this.state
    if (adjustThreshold)
      this.setState({
        threshold:
          adjustThreshold.initialValue +
          screenY(event) -
          adjustThreshold.screenY,
      })
  }

  onChangeDebug = event => {
    this.setState({
      debug: event.target.checked && { batch: Date.now(), saved: 0 },
    })
  }

  render() {
    return (
      <Page
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
        <label>
          <input
            type="checkbox"
            checked={!!this.state.debug}
            onChange={this.onChangeDebug}
          />{' '}
          {this.state.debug
            ? `${this.state.debug.batch} (${this.state.debug.saved})`
            : 'Debug'}
        </label>
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
        <style jsx>{`
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

          label {
            display: inline-block;
            position: fixed;
            bottom: 10px;
            right: 10px;
            color: gray;
          }
        `}</style>
      </Page>
    )
  }
}
