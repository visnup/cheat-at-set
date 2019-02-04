import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { mean } from 'd3-array'
import { flatten } from 'lodash'
import { difference } from '../../lib/cards'
import { deleteSamples } from '../../store'
import Cards from '../cards'

class Batch extends Component {
  static propTypes = {
    batch: PropTypes.object,
    dispatch: PropTypes.func,
  }

  state = {
    differenceById: null,
    absoluteErrors: [],
  }

  onCards = (sample, cards) => {
    const { batch: { samples } } = this.props
    const correctSamples = samples.filter(s => s.correct)

    if (!correctSamples.length) return

    const correctCards = flatten(correctSamples.map(s => s.cards))
    const diff = difference(correctCards, cards)
    this.setState(state => ({
      differenceById: {
        ...state.differenceById,
        [sample._id]: diff,
      },
      absoluteErrors: state.absoluteErrors.concat(diff.added.length + diff.removed.length),
    }))
  }

  render() {
    const { batch: { id, samples }, dispatch } = this.props
    const { differenceById, absoluteErrors } = this.state

    return (
      <div>
        <h5>
          {id} – {new Date(+id).toLocaleString()}
          {' '}
          <button onClick={() => dispatch(deleteSamples(+id))}>
            🗑
          </button>
        </h5>

        MAE: {mean(absoluteErrors)}

        <div className="carousel">
          {samples.map(sample => (
            <Cards key={sample._id} image={sample.image} threshold={sample.threshold} onCards={cards => this.onCards(sample, cards)}>
              {cards => {
                const diff = differenceById && differenceById[sample._id]
                return (
                  <div className={`sample ${sample.correct ? 'sample--correct' : null}`}>
                    <Link href={{ query: { id: sample._id } }}>
                      <a><img src={sample.image} /></a>
                    </Link>
                    {diff && (
                      <div diff={diff}>
                        -{diff.removed.length}
                        {' '}
                        +{diff.added.length}
                      </div>
                    )}
                    <div>
                      {sample.cards.length}→{cards && cards.length}
                    </div>
                  </div>
                )
              }}
            </Cards>
          ))}
        </div>

        <style jsx>{`
          h5 {
            margin-bottom: .5em
          }

          .carousel {
            white-space: nowrap;
            overflow-x: scroll;
            padding-bottom: 10px;
          }

          .sample {
            display: inline-block;
            text-align: center;
            font-size: small;
          }
          .sample--correct img {
            border: solid 2px mediumseagreen;
          }

          img {
            height: 100px;
          }
        `}</style>
      </div>
    )
  }
}
export default connect()(Batch)
