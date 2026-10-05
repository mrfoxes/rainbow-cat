import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const SPINNER = {
  plugin: 'rainbow-cat',
  component: 'Spinner',
  props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' },
  viewport: { columns: 120, rows: 30 },
} as const

const RUN = {
  command: 'rainbow',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 60 },
} as const

// Stands for the engine: its spinner line, a blank row above it, drawn from the word it is handed
const engine = (on: On) => {
  mock.store(on)
  const clock = mock.clock(on)
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)

    return Box({ marginTop: 1, children: [Text({ children: [e.props.word, '…'] })] })
  })

  return clock
}

test('keeps a cat with a short rainbow before a cat spinner line on the terminal', async ($, on) => {
  const clock = engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect(await ui.find({ key: 'cat' })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /…$/ }))?.text).not.toBe('Sauteing…')

  // The cat steps down past the engine's blank row, onto the row of its text
  expect(await ui.drawn()).toMatchObject({
    type: 'Box',
    props: { flexDirection: 'row' },
    children: [
      { type: 'Box', props: { marginTop: 1, flexShrink: 0 }, children: [{ type: 'Box', props: { width: 13 } }, { type: 'Text' }] },
      { type: 'Box' },
    ],
  })

  const first = JSON.stringify(await ui.find({ key: 'cat' }))
  expect(first).toContain('^ω^')
  expect(first).toContain('#ff99ff')
  expect(first).toContain('#6633ff')

  expect(await ui.find({ key: 'cat' })).toMatchObject({ type: 'Box', props: { width: 13, flexShrink: 0 } })

  // One frame later the rainbow and the tail have moved
  await clock.advance(120)
  const later = JSON.stringify(await ui.find({ key: 'cat' }))
  expect(later).not.toBe(first)
  expect(later).toContain('#ff0000')
  await ui.unmount()
})

test('the animation stops once the spinner has gone and starts again with it', async ($, on) => {
  const clock = engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  await ui.unmount()
  // With no spinner drawn, the timer runs out after a few frames
  await clock.advance(1200)

  const again = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  const first = JSON.stringify(await again.find({ key: 'cat' }))
  await clock.advance(120)
  expect(JSON.stringify(await again.find({ key: 'cat' }))).not.toBe(first)
  await again.unmount()
})

test('a narrow terminal keeps only the cat words', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal', viewport: { columns: 30, rows: 30 } })
  expect(await ui.find({ key: 'cat' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).not.toBe('Sauteing…')
  await ui.unmount()
})

test('/rainbow off gives the engine its spinner back, /rainbow brings the cat', async ($, on) => {
  engine(on)
  expect((await $.command.run({ ...RUN, args: 'off' })).text).toBe('Rainbow cat mode off.')
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect(await ui.find({ key: 'cat' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Sauteing…')

  expect((await $.command.run({ ...RUN, args: '' })).text).toBe('Rainbow cat mode on. Meow!')
  expect(await ui.find({ key: 'cat' })).toBeDefined()
  await ui.unmount()
})

test('the desktop keeps its own spinner', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect(await ui.find({ key: 'cat' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Sauteing…')
  await ui.unmount()
})
