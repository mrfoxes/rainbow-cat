import type { Register } from 'claude-code'

const WORDS = ['Rainbowing', 'Purring', 'Meowing', 'Sparkling', 'Prancing', 'Zooming']

const FRAME_MS = 120
// After this many frames with no spinner drawn, the animation timer stops
const IDLE_FRAMES = 3
const RAINBOW = ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff']
const BODY = '#ff99ff'
const SPRINKLE = '#ff3399'
const FUR = '#999999'
// The whole cat with its rainbow, and the tail, body and face alone, in columns
const WIDTH = 13
const CAT_WIDTH = 7

// Whether rainbow cat mode is on; session.start loads the saved choice
let isOn = true
// The animation: its frame, its timer, and the frames since the spinner was last drawn
let frame = 0
let timer: { cancel: () => void } | undefined
let idleFrames = 0

// The engine samples one word per turn, so the same word maps to the same cat word
const catWord = (word: string) => {
  let hash = 0
  for (const char of word) hash = (hash * 31 + char.charCodeAt(0)) >>> 0

  return WORDS[hash % WORDS.length] ?? 'Rainbowing'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'rainbow',
      description: 'Toggle rainbow cat mode (/rainbow, /rainbow on, /rainbow off)',
    })
    const stored = await $.store.get('isOn')
    if (typeof stored === 'boolean') {
      isOn = stored
    }

    return next(e)
  })

  on('command.run', { command: 'rainbow' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    isOn = arg === 'on' ? true : arg === 'off' ? false : !isOn
    await $.store.set('isOn', isOn)
    // The spinner and the turn summary draw from isOn, so draw them again
    $.ui.invalidate('ui.render')

    return { text: isOn ? 'Rainbow cat mode on. Meow!' : 'Rainbow cat mode off.' }
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || !isOn) {
      return next(e)
    }

    const props = e.props.message === null ? { ...e.props, word: catWord(e.props.word) } : e.props
    const line = await next({ ...e, props })
    const columns = e.viewport?.columns ?? 80
    // A narrow terminal keeps the whole row for the engine's line
    if (columns < 40) {
      return line
    }

    // Each frame moves the rainbow and the tail, and draws the spinner again;
    // the timer stops once the spinner has gone
    idleFrames = 0
    if (timer === undefined) {
      timer = $.clock.every(FRAME_MS, () => {
        idleFrames += 1
        if (idleFrames > IDLE_FRAMES) {
          timer?.cancel()
          timer = undefined
          return
        }
        frame += 1
        $.ui.invalidate('ui.render')
      })
    }

    const { Box, Text } = $.ui.resolve(e)
    const trail = WIDTH - CAT_WIDTH
    // The engine draws its line under a blank row, so the cat steps down one
    // row to run beside the line's text; the line never squeezes the cat
    return Box({
      flexDirection: 'row',
      children: [
        Box({
          marginTop: 1,
          flexShrink: 0,
          children: [
            Box({
              key: 'cat',
              flexDirection: 'row',
              width: WIDTH,
              flexShrink: 0,
              children: [
                ...Array.from({ length: trail }, (_, i) =>
                  Text({
                    color: RAINBOW[(trail - 1 - i) % RAINBOW.length],
                    children: [(i + frame) % 2 === 0 ? '▀' : '▄'],
                  }),
                ),
                Text({ color: FUR, children: [frame % 2 === 0 ? '~' : '-'] }),
                Text({ color: SPRINKLE, backgroundColor: BODY, children: ['·:·'] }),
                Text({ color: '#000000', backgroundColor: FUR, children: ['^ω^'] }),
              ],
            }),
            Text({ children: [' '] }),
          ],
        }),
        line,
      ],
    })
  })

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) =>
    isOn ? next({ ...e, props: { ...e.props, word: 'Rainbowed' } }) : next(e),
  )
}
