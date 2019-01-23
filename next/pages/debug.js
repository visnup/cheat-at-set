import { Component } from 'react'
import Link from 'next/link'
import { withRouter } from 'next/router'
import fetch from 'isomorphic-unfetch'
import { groupBy, keyBy } from 'lodash'
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
    const batches = await res.json()
    this.setState({
      isLoading: false,
      byBatch: groupBy(batches, 'batch'),
      byId: keyBy(batches, '_id'),
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
    {Object.entries(batches).map(([batch, debug]) => {
      return (
        <div key={batch}>
          <h3>{batch}</h3>
          {debug.map((debug, i) => (
            <div className="image" key={i}>
              <Link href={{ query: { id: debug._id } }}>
                <img src={debug.image} />
              </Link>
              <div>
                {debug.cards.length} {debug.sets.length}
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
