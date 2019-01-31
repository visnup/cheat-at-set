import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'next/router'
import { pick } from 'lodash'

import Page from '../components/page'
import Batch from '../components/debug/batch'
import Sample from '../components/debug/sample'
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
          <Sample sample={byId[query.id]} />
        ) : (
          <Container>
            {Object.entries(byBatch).map(([id, sampleIds]) => (
              <Batch
                key={id}
                batch={{ id, samples: sampleIds.map(id => byId[id]) }}
              />
            ))}
          </Container>
        )}
      </Page>
    )
  }
}
export default withRouter(
  connect(state => pick(state, ['isFetching', 'byId', 'byBatch']))(Debug)
)
