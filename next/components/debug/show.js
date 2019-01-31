import { Component } from 'react'
import { connect } from 'react-redux'
import { filter } from 'lodash'
import { Card } from '../../lib/cards'
import { threshold } from '../../lib/luminosity'
import { correctSample } from '../../store'

const attributes = {
  number: [1, 2, 3],
  color: ['red', 'green', 'purple'],
  shade: ['solid', 'outlined', 'striped'],
  shape: ['oval', 'diamond', 'squiggle'],
}

class Show extends Component {
  state = {
    cards: []
  }

  onCorrectClick = () => {
    const { dispatch, sample } = this.props
    dispatch(correctSample(sample._id))
  }

  render() {
    const { sample } = this.props
    if (!sample) return null

    let aspectRatio = 360 / 640
    if (this.canvas)
      aspectRatio = this.canvas.width / this.canvas.height

    const { cards } = this.state

    return (
      <div className="row">
        <canvas ref={ref => (this.canvas = ref)} />
        <div className="cards">
          <button onClick={this.onCorrectClick}>✅</button>

          {Object.entries(attributes).map(([name, values]) => (
            <div key={name} className="row">
              {values.map(value => (
                <div key={value} className="column">
                  <h5>{value}</h5>
                  {filter(cards, { [name]: value }).map((card, i) => (
                    <img key={i} src={card.canvas.toDataURL()} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
          .row {
            display: flex;
            justify-content: center;
          }
          .column {
            flex-basis: 33.33333%;
            margin: 0 20px;
          }

          canvas {
            width: 40vw;
            height: ${40 / aspectRatio}vw;
          }

          .cards {
            width: 60vw;
          }

          h5 {
            margin-bottom: .5em;
          }

          img {
            width: 40px;
          }
        `}</style>
      </div>
    )
  }

  componentDidMount() {
    const { sample } = this.props
    threshold.value = sample.threshold

    const img = new Image()
    img.src = sample.image
    img.addEventListener('load', event => {
      if (!this.canvas) return
      const { target } = event
      this.canvas.width = target.width
      this.canvas.height = target.height
      this.draw(target)
    })
  }

  draw(src) {
    const { canvas } = this

    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const { sample } = this.props
    ctx.strokeStyle = 'tomato'
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

          // ctx.lineWidth = 2
          // for (const contour of runtime.contours) {
          //   ctx.beginPath()
          //   for (const [x, y] of contour) ctx.lineTo(x, y)
          //   ctx.closePath()
          //   ctx.stroke()
          // }
          return runtime
        })
      })
  }
}

export default connect()(Show)
