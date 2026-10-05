import type { Register } from 'claude-code'

import type { CatProps } from '../types'

const WORDS = ['Rainbowing', 'Purring', 'Meowing', 'Sparkling', 'Prancing', 'Zooming']

// Whether rainbow cat mode is on; session.start loads the saved choice
let isOn = true

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

    const { Box, Client, Text } = $.ui.resolve(e)
    const cat: CatProps = { width: 13 }
    // The engine draws its line under a blank row, so the cat steps down one
    // row to run beside the line's text; the line never squeezes the cat
    return Box({
      flexDirection: 'row',
      children: [
        Box({
          marginTop: 1,
          flexShrink: 0,
          children: [
            Client({ key: 'cat', module: './cat.ts', props: cat, width: cat.width }),
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
