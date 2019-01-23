import { Component } from 'react'
import fetch from 'isomorphic-unfetch'
import { groupBy } from 'lodash'
import Page from '../components/page'

export default class Debug extends Component {
  state = {
    isLoading: false,
    batches: [],
  }

  async componentDidMount() {
    this.setState({ isLoading: true })
    const res = await fetch('/api/debug')
    this.setState({
      isLoading: false,
      batches: groupBy(await res.json(), 'batch'),
    })
  }

  render() {
    const { isLoading, batches } = this.state

    return (
      <Page {...this.props}>
        {isLoading && <p>Loading…</p>}
        {Object.entries(batches).map(([batch, debug]) => {
          return (
            <div key={batch}>
              <h3>{batch}</h3>
              {debug.map((debug, i) => (
                <div className="image" key={i}>
                  <img src={debug.image} />
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
      </Page>
    )
  }
}
