import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'next/router'

import Page from '../components/page'
import Index from '../components/debug/index'
import Show from '../components/debug/show'
import { fetchSamples } from '../store'

class Debug extends Component {
  componentDidMount() {
    this.props.dispatch(fetchSamples())
  }

  render() {
    const { query } = this.props.router
    const { isFetching, byBatch, byId } = this.props

    return (
      <Page>
        {isFetching && <p>Loading…</p>}
        {query.id && byId[query.id] ? (
          <Show sample={byId[query.id]} />
        ) : (
          <Index batches={byBatch} samples={byId} />
        )}
      </Page>
    )
  }
}
export default withRouter(connect(state => state)(Debug))
