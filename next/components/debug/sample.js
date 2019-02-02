import { Component } from 'react'
import { connect } from 'react-redux'
import { filter } from 'lodash'
import findCards, { Card, difference, thresholded } from '../../lib/cards'
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
    cards: [],
    runtime: [],
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

    const { cards, runtime } = this.state

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

            <h4>sample {cards.length}</h4>
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

            <h4>runtime {runtime.length}</h4>
            <table>
              <thead>
                <tr>
                  <th><h5>image</h5></th>
                  <th><h5>thresholded</h5></th>
                  <th><h5>shade</h5></th>
                  <th><h5>shape</h5></th>
                  <th><h5>number</h5></th>
                  <th><h5>color</h5></th>
                  <th><h5>contours</h5></th>
                  <th><h5>area</h5></th>
                </tr>
              </thead>
              <tbody>
                {runtime.map((card, i) => (
                  <tr key={i} className={card.valid ? 'card--valid' : 'card--invalid'}>
                    <td><img src={getURLFromImageData(card.image)} /></td>
                    <td><img src={getURLFromImageData(thresholded(card.image, sample.threshold))} /></td>
                    <td>{card.shade}</td>
                    <td>{card.shape}</td>
                    <td>{card.number}</td>
                    <td>{card.color}</td>
                    <td>{card.contours.length}</td>
                    <td>{card.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          h4, h5 {
            margin-bottom: .5em;
          }

          img {
            width: 40px;
          }

          table {
            margin: 0 auto;
          }

          .card--invalid {
            text-decoration: line-through;
            color: lightgray;
          }
        `}</style>
      </div>
    )
  }

  async componentDidMount() {
    const { sample } = this.props

    const image = await getImageDataFromURL(sample.image)

    console.time('runtime')
    const runtime = findCards(image, sample.threshold, null)
    console.timeEnd('runtime')

    const { canvas } = this
    if (!canvas) return
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    // ctx.putImageData(thresholded(image, sample.threshold), 0, 0)
    ctx.putImageData(image, 0, 0)

    ctx.strokeStyle = 'tomato'
    ctx.lineWidth = 4
    for (const card of sample.cards) {
      ctx.beginPath()
      for (const [x, y] of card.contour) ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }

    ctx.strokeStyle = 'seagreen'
    ctx.lineWidth = 2
    for (const card of runtime) {
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
        }),
        runtime,
        difference: difference(sample.cards, runtime),
      })
  }
}

export default connect()(Sample)
