import { Component } from 'react'
import Link from 'next/link'
import { withRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import { groupBy, keyBy, sortBy } from 'lodash'
import Page from '../components/page'

class Debug extends Component {
  state = {
    isLoading: false,
    byBatch: [],
    byId: {},
  }

  async componentDidMount() {
    this.setState({ isLoading: true })
    const res = await fetch('/api/debug')
    const samples = await res.json()
    this.setState({
      isLoading: false,
      byBatch: groupBy(samples, 'batch'),
      byId: keyBy(samples, '_id'),
    })
  }

  render() {
    const { query } = this.props.router
    const { isLoading, byBatch, byId } = this.state

    return (
      <Page {...this.props}>
        {isLoading && <p>Loading…</p>}
        {query.id ? (
          <Show debug={byId[query.id]} />
        ) : (
          <Index batches={byBatch} />
        )}
      </Page>
    )
  }
}
export default withRouter(Debug)

const Index = ({ batches }) => (
  <div>
    {Object.entries(batches).map(([id, samples]) => {
      samples = sortBy(samples, s => -s.cards.length * 100 - s.sets.length)
      return (
        <div key={id}>
          <h3>{id}</h3>
          <div>{new Date(+id).toString()}</div>
          {samples.map((sample, i) => (
            <div className="image" key={i}>
              <Link href={{ query: { id: sample._id } }}>
                <img src={sample.image} />
              </Link>
              <div>
                {sample.cards.length} {sample.sets.length}
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

const Show = ({ debug }) => {
  if (!debug) return null

  return (
    <div>
      <img src={debug.image} />
      {debug.cards.length}
    </div>
  )
}
