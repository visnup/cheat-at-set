import { Component } from 'react'
import { getImageDataFromURL } from '../lib/image'
import cards from '../lib/cards'

class Cards extends Component {
  state = { cards: null }

  render() {
    return this.props.children(this.state.cards)
  }

  async componentDidMount() {
    const { image, threshold } = this.props
    this.setState({ cards: cards(await getImageDataFromURL(image), threshold) })
  }
}

export default Cards
