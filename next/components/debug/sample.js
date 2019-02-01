import { Component } from 'react'
import { connect } from 'react-redux'
import { filter } from 'lodash'
import { Card } from '../../lib/cards'
import { getImageDataFromURL, getURLFromImageData } from '../../lib/image'
import { updateSample } from '../../store'
import Container from '../container'

const attributes = {
  number: [1, 2, 3],
  color: ['red', 'green', 'purple'],
  shade: ['solid', 'outlined', 'striped'],
  shape: ['oval', 'diamond', 'squiggle'],
}

class Sample extends Component {
  state = {
    cards: []
  }

  onCorrectChanged = event => {
    const { dispatch, sample } = this.props
    dispatch(updateSample(sample._id, { correct: event.target.checked }))
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
          <Container>
            <label>
              <input type="checkbox" checked={!!sample.correct} onChange={this.onCorrectChanged} />
              {' '}
              Correct
            </label>
            {' '}
            Threshold {sample.threshold}

            {Object.entries(attributes).map(([name, values]) => (
              <div key={name} className="row">
                {values.map(value => (
                  <div key={value} className="column">
                    <h5>{value}</h5>
                    {filter(cards, { [name]: value }).map((card, i) => (
                      <img key={i} src={card.src} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </Container>
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
            text-align: center;
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

  async componentDidMount() {
    const { sample } = this.props

    const image = await getImageDataFromURL(sample.image)

    const { canvas } = this
    if (!canvas) return
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    ctx.putImageData(image, 0, 0)

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
          const runtime = new Card(image, card.contour, sample.threshold)
          return { ...card, runtime, src: getURLFromImageData(runtime.whiteBalanced) }
        })
      })
  }
}

export default connect()(Sample)
