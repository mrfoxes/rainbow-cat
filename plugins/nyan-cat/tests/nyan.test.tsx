import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const SPINNER = {
  plugin: 'nyan-cat',
  component: 'Spinner',
  props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' },
  viewport: { columns: 120, rows: 30 },
} as const

const RUN = {
  command: 'nyan',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 60 },
} as const

// Stands for the engine: its spinner line, a blank row above it, drawn from the word it is handed
const engine = (on: On) => {
  mock.store(on)
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box marginTop={1}>
        <Text>{e.props.word}…</Text>
      </Box>
    )
  })
}

test('keeps a cat with a short rainbow before a nyan spinner line on the terminal', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect(await ui.find({ type: 'Client', key: 'nyan' })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /…$/ }))?.text).not.toBe('Sauteing…')

  // The cat steps down past the engine's blank row, onto the row of its text
  expect(await ui.drawn()).toMatchObject({
    type: 'Box',
    props: { flexDirection: 'row' },
    children: [
      { type: 'Box', props: { marginTop: 1, flexShrink: 0 }, children: [{ type: 'Client', props: { width: 13 } }, { type: 'Text' }] },
      { type: 'Box' },
    ],
  })

  const first = JSON.stringify(await ui.drawn({ in: 'nyan' }))
  expect(first).toContain('^ω^')
  expect(first).toContain('#ff99ff')
  expect(first).toContain('#6633ff')

  expect(await ui.drawn({ in: 'nyan' })).toMatchObject({ props: { width: 13, flexShrink: 0 } })

  await ui.advance(120)
  const later = JSON.stringify(await ui.drawn({ in: 'nyan' }))
  expect(later).not.toBe(first)
  expect(later).toContain('#ff0000')
  await ui.unmount()
})

test('a narrow terminal keeps only the nyan words', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal', viewport: { columns: 30, rows: 30 } })
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).not.toBe('Sauteing…')
  await ui.unmount()
})

test('/nyan off gives the engine its spinner back, /nyan brings the cat', async ($, on) => {
  engine(on)
  expect((await $.command.run({ ...RUN, args: 'off' })).text).toBe('Nyan cat mode off.')
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Sauteing…')

  expect((await $.command.run({ ...RUN, args: '' })).text).toBe('Nyan cat mode on. Nyan nyan nyan!')
  expect(await ui.find({ type: 'Client', key: 'nyan' })).toBeDefined()
  await ui.unmount()
})

test('the desktop keeps its own spinner', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop' })
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Sauteing…')
  await ui.unmount()
})
