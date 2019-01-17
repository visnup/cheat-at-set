import combinations from 'combinations-generator'

function isSet(cards) {
  return [ 'color', 'number', 'shade', 'shape' ].every(attribute => {
    attribute = cards.map(card => card[attribute])
    return allSame(attribute) || allDifferent(attribute)
  })
}

function allSame(attributes) {
  return attributes[0] === attributes[1] &&
         attributes[1] === attributes[2]
}

function allDifferent(attributes) {
  return attributes[0] !== attributes[1] &&
         attributes[0] !== attributes[2] &&
         attributes[1] !== attributes[2]
}

export default function sets(cards) {
  return cards.length
    ? [...combinations(cards, 3)].filter(isSet)
    : []
}
