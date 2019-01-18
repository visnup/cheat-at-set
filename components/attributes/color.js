import { scaleThreshold } from 'd3-scale'
import { hsl, rgb } from 'd3-color'
import { luminosity, threshold } from '../luminosity'

const hue = scaleThreshold()
  .domain([70, 180, 340])
  .range(['red', 'green', 'purple', 'red'])

export default function color(image) {
  const counts = { red: 0, green: 0, purple: 0 }

  const { data } = image
  for (let i = 0; i < data.length; i += 4)
    if (threshold(luminosity(data[i], data[i + 1], data[i + 2])) === 0)
      counts[hue(hsl(rgb(data[i], data[i + 1], data[i + 2])).h)]++
  const space = counts.red + counts.green + counts.purple

  // return counts
  if (counts.purple / space > 0.2) return 'purple'
  else if (counts.green / space > 0.5) return 'green'
  else if (counts.red / space > 0.1) return 'red'
  else return null
}
