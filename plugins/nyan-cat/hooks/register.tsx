import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { NyanProps } from '../types'

const isOn = atom({ plugin: 'nyan-cat', key: 'isOn' } as const, true)

const WORDS = ['Nyaning', 'Pop-tarting', 'Rainbowing', 'Purring', 'Meowing', 'Nyan-nyaning']

// The engine samples one word per turn, so the same word maps to the same nyan word
const nyanWord = (word: string) => {
  let hash = 0
  for (const char of word) hash = (hash * 31 + char.charCodeAt(0)) >>> 0

  return WORDS[hash % WORDS.length] ?? 'Nyaning'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'nyan',
      description: 'Toggle nyan cat mode (/nyan, /nyan on, /nyan off)',
    })
    const stored = await $.store.get('isOn')
    if (typeof stored === 'boolean') {
      await update($, isOn, () => stored)
    }

    return next(e)
  })

  on('command.run', { command: 'nyan' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const turnOn = arg === 'on' ? true : arg === 'off' ? false : !(await read($, isOn))
    await update($, isOn, () => turnOn)
    await $.store.set('isOn', turnOn)

    return { text: turnOn ? 'Nyan cat mode on. Nyan nyan nyan!' : 'Nyan cat mode off.' }
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || !(await read($, isOn))) {
      return next(e)
    }

    const props = e.props.message === null ? { ...e.props, word: nyanWord(e.props.word) } : e.props
    const line = await next({ ...e, props })
    const columns = e.viewport?.columns ?? 80
    // A narrow terminal keeps the whole row for the engine's line
    if (columns < 40) {
      return line
    }

    const { Box, Client, Text } = $.ui.resolve(e)
    const nyan: NyanProps = { width: 13 }
    // The engine draws its line under a blank row, so the cat steps down one
    // row to run beside the line's text; the line never squeezes the cat
    return (
      <Box flexDirection="row">
        <Box marginTop={1} flexShrink={0}>
          <Client key="nyan" module="./nyan.tsx" props={nyan} width={nyan.width} />
          <Text> </Text>
        </Box>
        {line}
      </Box>
    )
  })

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) =>
    (await read($, isOn)) ? next({ ...e, props: { ...e.props, word: 'Nyaned' } }) : next(e),
  )
}
