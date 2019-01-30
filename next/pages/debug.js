import { Component } from 'react'
import Link from 'next/link'
import { withRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import { groupBy, keyBy, omit, omitBy, sortBy } from 'lodash'

import Page from '../components/page'
import Show from '../components/debug/show'

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

  onDelete = event => {
    const batch = +event.target.name
    fetch(`/api/debug?batch=${batch}`, { method: 'DELETE' })
    this.setState(state => ({
      byBatch: omit(state.byBatch, batch),
      byId: omitBy(state.byId, sample => sample.batch === batch),
    }))
  }

  onCorrect = event => {
    const id = event.target.name
    fetch(`/api/debug?id=${id}`, { method: 'PATCH' })
  }

  render() {
    const { query } = this.props.router
    const { isLoading, byBatch, byId } = this.state

    return (
      <Page {...this.props}>
        {isLoading && <p>Loading…</p>}
        {query.id ? (
          <Show sample={byId[query.id]} onCorrect={this.onCorrect} />
        ) : (
          <Index batches={byBatch} onDelete={this.onDelete} />
        )}
      </Page>
    )
  }
}
export default withRouter(Debug)

const Index = ({ batches, onDelete }) => (
  <div>
    {Object.entries(batches).map(([id, samples]) => {
      samples = sortBy(samples, s => -s.cards.length * 100 - s.sets.length)
      return (
        <div key={id}>
          <h3>
            {id}{' '}
            <button name={id} onClick={onDelete}>
              🗑
            </button>
          </h3>
          <div>{new Date(+id).toString()}</div>
          {samples.map((sample, i) => (
            <div className="image" key={i}>
              <Link href={{ query: { id: sample._id } }}>
                <img src={`/api/debug?id=${sample._id}`} />
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
