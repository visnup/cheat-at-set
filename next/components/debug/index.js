import { connect } from 'react-redux'
import Link from 'next/link'
import { differenceBy, flatten, sortBy, pick } from 'lodash'
import { deleteSamples } from '../../store'

const attributes = ['number', 'color', 'shade', 'shape']
function cardDifference(a, b) {
  return differenceBy(a, b, cards => JSON.stringify(pick(cards, attributes)))
}

const Index = ({ batches, samples, dispatch }) => (
  <div>
    {Object.entries(batches).map(([id, sampleIds]) => {
      const ordered = sortBy(
        sampleIds.map(id => samples[id]),
        s => -s.cards.length
      )
      const correct = flatten(ordered.filter(s => s.correct).map(s => s.cards))

      return (
        <div key={id}>
          <h3>
            {id}{' '}
            <button onClick={() => dispatch(deleteSamples(+id))}>
              🗑
            </button>
          </h3>
          <div>{new Date(+id).toLocaleString()}</div>
          {ordered.map(sample => (
            <div className="image" key={sample._id}>
              <Link href={{ query: { id: sample._id } }}>
                <img src={sample.image} />
              </Link>
              <div>
                {sample.cards.length}
                {' '}
                {sample.correct ? '✅' : null}
                {cardDifference(correct, sample.cards).length}
              </div>
            </div>
          ))}
        </div>
      )
    })}
    <style jsx>{`
      .image {
        display: inline-block;
        text-align: center;
        margin: 5px 0;
      }

      .image img {
        height: 100px;
      }
    `}</style>
  </div>
)

export default connect()(Index)
