import type { ClientModule } from 'claude-code'

import type { CatProps } from '../types'

type Tick = { t: number }

const FRAME_MS = 120
const RAINBOW = ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff']
const BODY = '#ff99ff'
const SPRINKLE = '#ff3399'
const FUR = '#999999'
// Tail, body and face, in columns
const CAT_WIDTH = 7

// One row: the cat stays put, a short rainbow ripples behind it and its tail wags
const Cat: ClientModule<CatProps, Tick> = (props, surface) => {
  if (surface.state === undefined) {
    let t = 0
    surface.every(FRAME_MS, () => {
      t += 1
      surface.setState({ t })
    })
    surface.setState({ t })
  }

  const { Box, Text } = surface.elements
  const t = surface.state?.t ?? 0
  const trail = Math.max(0, props.width - CAT_WIDTH)

  return Box({
    flexDirection: 'row',
    width: props.width,
    flexShrink: 0,
    children: [
      ...Array.from({ length: trail }, (_, i) =>
        Text({ color: RAINBOW[(trail - 1 - i) % RAINBOW.length], children: [(i + t) % 2 === 0 ? '▀' : '▄'] }),
      ),
      Text({ color: FUR, children: [t % 2 === 0 ? '~' : '-'] }),
      Text({ color: SPRINKLE, backgroundColor: BODY, children: ['·:·'] }),
      Text({ color: '#000000', backgroundColor: FUR, children: ['^ω^'] }),
    ],
  })
}

export default Cat
