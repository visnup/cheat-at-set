import { Component } from 'react'
import { Card } from '../../lib/cards'
import { threshold } from '../../lib/luminosity'

class Show extends Component {
  state = {
    cards: []
  }

  render() {
    const { sample, onCorrect } = this.props
    if (!sample) return null

    const { cards } = this.state

    return (
      <div>
        <canvas ref={ref => (this.canvas = ref)} />
        <button name={sample._id} onClick={onCorrect}>✅</button>
        {cards.map((card, i) => (
          <div key={i}>
            <img src={card.canvas.toDataURL()} />
            {card.shade},
            {card.shape},
            {card.number},
            {card.color}
          </div>
        ))}
        <style jsx>{`
          canvas {
            width: 100vw;
            height: auto;
          }
        `}</style>
      </div>
    )
  }

  componentDidMount() {
    const { canvas } = this
    if (!canvas) return

    const { sample } = this.props
    threshold.value = sample.threshold

    const img = new Image()
    img.src = sample.image
    img.addEventListener('load', () => {
      this.canvas.width = img.width
      this.canvas.height = img.height
      this.draw(img)
    })
  }
  componentDidUpdate = this.componentDidMount

  draw(src) {
    const { canvas } = this

    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const { sample } = this.props
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    for (const card of sample.cards) {
      ctx.beginPath()
      for (const [x, y] of card.contour) ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }

    if (!this.state.cards.length)
      this.setState({
        cards: sample.cards.map(card => {
          const runtime = new Card(image, card.contour)
          runtime.canvas = document.createElement('canvas')
          runtime.canvas.width = runtime.image.width
          runtime.canvas.height = runtime.image.height
          const ctx = runtime.canvas.getContext('2d')
          ctx.putImageData(runtime.whiteBalanced, 0, 0)

          ctx.strokeStyle = 'red'
          ctx.lineWidth = 2
          for (const contour of runtime.contours) {
            ctx.beginPath()
            for (const [x, y] of contour) ctx.lineTo(x, y)
            ctx.closePath()
            ctx.stroke()
          }
          return runtime
        })
      })
  }
}

export default Show
