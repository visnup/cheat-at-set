import { Component } from 'react'
import propTypes from 'prop-types'
import { getImageDataFromURL } from '../lib/image'
import cards from '../lib/cards'

class Cards extends Component {
  static propTypes = {
    children: propTypes.func,
    image: propTypes.string,
    threshold: propTypes.number,
    onCards: propTypes.func,
  }
  static defaultProps = { onCards: () => {} }

  state = { cards: null }

  render() {
    return this.props.children(this.state.cards)
  }

  async componentDidMount() {
    const { image, threshold } = this.props
    this.setState({ cards: cards(await getImageDataFromURL(image), threshold) })
  }

  componentDidUpdate(_prevProps, prevState) {
    if (this.state.cards !== prevState.cards)
      this.props.onCards(this.state.cards)
  }
}

export default Cards
