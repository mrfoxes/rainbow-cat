import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { CatProps } from '../types'

const isOn = atom({ plugin: 'rainbow-cat', key: 'isOn' } as const, true)

const WORDS = ['Rainbowing', 'Purring', 'Meowing', 'Sparkling', 'Prancing', 'Zooming']

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
      await update($, isOn, () => stored)
    }

    return next(e)
  })

  on('command.run', { command: 'rainbow' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const turnOn = arg === 'on' ? true : arg === 'off' ? false : !(await read($, isOn))
    await update($, isOn, () => turnOn)
    await $.store.set('isOn', turnOn)

    return { text: turnOn ? 'Rainbow cat mode on. Meow!' : 'Rainbow cat mode off.' }
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || !(await read($, isOn))) {
      return next(e)
    }

    const props = e.props.message === null ? { ...e.props, word: catWord(e.props.word) } : e.props
    const line = await next({ ...e, props })
    const columns = e.viewport?.columns ?? 80
    // A narrow terminal keeps the whole row for the engine's line
    if (columns < 40) {
      return line
    }

    const { Box, Client, Text } = $.ui.resolve(e)
    const cat: CatProps = { width: 13 }
    // The engine draws its line under a blank row, so the cat steps down one
    // row to run beside the line's text; the line never squeezes the cat
    return (
      <Box flexDirection="row">
        <Box marginTop={1} flexShrink={0}>
          <Client key="cat" module="./cat.tsx" props={cat} width={cat.width} />
          <Text> </Text>
        </Box>
        {line}
      </Box>
    )
  })

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) =>
    (await read($, isOn)) ? next({ ...e, props: { ...e.props, word: 'Rainbowed' } }) : next(e),
  )
}
