import { Component } from 'react'
import styled from 'styled-components'
import fetch from 'isomorphic-unfetch'
import { groupBy } from 'lodash'
import Page from '../components/page'

class Debug extends Component {
  state = {
    batches: [],
  }

  async componentDidMount() {
    const res = await fetch('/api/debug')
    this.setState({ batches: groupBy(await res.json(), 'batch') })
  }

  render() {
    const { batches } = this.state

    return (
      <Page {...this.props}>
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
