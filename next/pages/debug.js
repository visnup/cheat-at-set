import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'next/router'
import { pick } from 'lodash'

import Page from '../components/page'
import Index from '../components/debug/index'
import Show from '../components/debug/show'
import { fetchSamples } from '../store'
import Container from '../components/container'

class Debug extends Component {
  componentDidMount() {
    this.props.dispatch(fetchSamples())
  }

  render() {
    const { query } = this.props.router
    const { isFetching, byBatch, byId } = this.props

    return (
      <Page>
        {isFetching ? (
          <Container>Loading…</Container>
        ) : query.id ? (
          <Show sample={byId[query.id]} />
        ) : (
          <Index batches={byBatch} samples={byId} />
        )}
      </Page>
    )
  }
}
export default withRouter(
  connect(state => pick(state, ['isFetching', 'byId', 'byBatch']))(Debug)
)
