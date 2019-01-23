import { Component } from 'react'
import { Card } from '../../lib/cards'
import { threshold } from '../../lib/luminosity'

class Show extends Component {
  render() {
    const { sample } = this.props
    if (!sample) return null

    return (
      <div>
        <canvas ref={ref => (this.canvas = ref)} />
        {sample.cards.length}
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

      const runtime = new Card(image, card.contour)
      console.log(runtime)
    }
  }
}

export default Show
