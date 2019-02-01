import { connect } from 'react-redux'
import Link from 'next/link'
import { differenceBy, flatten, pick } from 'lodash'
import { deleteSamples } from '../../store'
import Cards from '../cards'

const attributes = ['number', 'color', 'shade', 'shape']
const comparator = cards => JSON.stringify(pick(cards, attributes))
function cardDifference(a, b) {
  return {
    removed: differenceBy(a, b, comparator),
    added: differenceBy(b, a, comparator),
  }
}

const Batch = ({ batch, dispatch }) => {
  const { id, samples } = batch
  const correctSamples = samples.filter(s => s.correct),
    correctCards = flatten(correctSamples.map(s => s.cards))

  return (
    <div>
      <h5>
        {id} – {new Date(+id).toLocaleString()}
        {' '}
        <button onClick={() => dispatch(deleteSamples(+id))}>
          🗑
        </button>
      </h5>

      <div className="carousel">
        {samples.map(sample => (
          <Cards key={sample._id} image={sample.image} threshold={sample.threshold}>
            {cards => {
              const difference = correctSamples.length && cards ? cardDifference(correctCards, cards) : null
              return (
                <div className={`sample ${sample.correct ? 'sample--correct' : null}`}>
                  <Link href={{ query: { id: sample._id } }}>
                    <a><img src={sample.image} /></a>
                  </Link>
                  <div>
                    {sample.cards.length} → {cards ? cards.length : '…'}
                    {difference && (
                      <div>
                        +{difference.added.length}
                        -{difference.removed.length}
                      </div>
                    )}
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
        }

        .sample {
          display: inline-block;
          text-align: center;
          font-size: small;
        }
        .sample--correct img {
          border: solid 1px mediumseagreen;
        }

        img {
          height: 100px;
        }
      `}</style>
    </div>
  )
}
export default connect()(Batch)
