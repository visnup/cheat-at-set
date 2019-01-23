import { Component } from 'react'
import styled from 'styled-components'
import fetch from 'isomorphic-unfetch'
import { groupBy } from 'lodash'
import Page from '../components/page'

class Debug extends Component {
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
                <img key={i} src={debug.image} />
              ))}
            </div>
          )
        })}
      </Page>
    )
  }
}

const Styled = styled(Debug)`
  img {
    height: 100px;
  }
`

export default () => <Styled />
