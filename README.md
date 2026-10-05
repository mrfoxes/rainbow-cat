# Rainbow Cat

![Rainbow Cat icon: a pixel-art grey cat under a rainbow](.claude-plugin/icon.png)

Rainbow cat mode for [Claude Code](https://claude.com/claude-code). While Claude works, a small pixel cat runs beside the spinner with a short rainbow rippling behind it.

```
▀▄▀▄▀▄~·:·^ω^ ✻ Prancing…
```

- The cat and its rainbow animate beside the spinner line.
- Spinner words become cat words: Rainbowing, Purring, Meowing, Sparkling, Prancing, Zooming.
- The turn summary says "Rainbowed".

## Install

From a terminal:

```sh
claude plugin marketplace add mrfoxes/rainbow-cat
claude plugin install rainbow-cat@mrfoxes
```

Or in one command inside Claude Code (v2.1.275 or later):

```
/plugin install rainbow-cat --marketplace mrfoxes/rainbow-cat
```

Or in two steps inside Claude Code:

```
/plugin marketplace add mrfoxes/rainbow-cat
/plugin install rainbow-cat@mrfoxes
```

Start a new session, or run `/reload-plugins` in the current one.

## Usage

| Command         | Effect                        |
| --------------- | ----------------------------- |
| `/rainbow`      | Toggle rainbow cat mode       |
| `/rainbow on`   | Turn rainbow cat mode on      |
| `/rainbow off`  | Turn rainbow cat mode off     |

Rainbow cat mode is on after install. Your choice persists across sessions.

Notes:

- The cat draws only in the Claude Code terminal. The desktop app, claude.ai and Cowork keep their own spinner.
- In a terminal narrower than 40 columns, the cat steps aside and only the cat words show.

## What the plugin does

This plugin is a Claude Code mod: a TypeScript hooks module, `hooks/register.ts`, that Claude Code loads from `hooks/hooks.json`, and a surface module, `hooks/cat.ts`, that draws the animated cat.

### Hooks

| Hook | What it does |
| ---- | ------------ |
| `session.start` | Registers the `/rainbow` command and loads your saved on/off choice from the plugin store. |
| `command.run` with `{command: "rainbow"}` | Turns rainbow cat mode on or off, saves the choice to the plugin store, and asks Claude Code to redraw the spinner. Replies with one line of text. |
| `ui.render` with `{component: "Spinner"}` | In the terminal, while the mode is on, swaps the spinner word for a cat word and draws the cat beside Claude Code's own spinner line. Elsewhere it changes nothing. |
| `ui.render` with `{component: "TurnDuration"}` | While the mode is on, changes the word in the line that closes a turn to "Rainbowed". |

### Mods API calls

| Call | What it does |
| ---- | ------------ |
| `$.command.register` | Adds the `/rainbow` slash command. |
| `$.store.get`, `$.store.set` | Reads and writes one key, `isOn` (true or false), in this plugin's own store on your machine. |
| `$.ui.resolve` | Gets the elements (`Box`, `Text`, `Client`) the terminal draws with. |
| `$.ui.invalidate` | Asks Claude Code to redraw the spinner after you toggle the mode. |

The surface module `hooks/cat.ts` gets no mods API. It runs a 120 ms timer that moves the animation one frame.

### What it does not do

- It sends no data anywhere and makes no network requests.
- It runs no shell commands and starts no processes. The only command involved is the `/rainbow` slash command it adds.
- It does not read your files, prompts, conversations or environment variables.
- It calls no other plugin. Every call above is part of Claude Code's own mods API.
- It has no dependencies and no build step: the source in `hooks/` is what runs.

## Requirements

This plugin uses the Claude Code function-hooks plugin API (`ui.render`, `$.command`, `$.store`). That API is early access and can change between releases. Version 0.2.2 was built and tested on Claude Code 2.1.289.

## Development

```
.claude-plugin/plugin.json        plugin manifest
.claude-plugin/marketplace.json   marketplace entry for this repository
.claude-plugin/icon.png           listing icon
hooks/hooks.json                  hooks module list
hooks/register.ts                 hooks: /rainbow command, Spinner and TurnDuration rendering
hooks/cat.ts                      surface module that draws the animated cat
types/index.d.ts                  props the hooks module hands the surface module
tests/rainbow-cat.test.ts         tests
```

Run the plugin from your working copy for one session:

```sh
claude --plugin-dir .
```

Validate and test:

```sh
claude plugin validate . --strict
claude plugin test .
```

Type-check: Claude Code writes the API types into `.claude-plugin/types/` the first time it loads the plugin from disk (for example with `--plugin-dir`). After that:

```sh
npx -p typescript tsc -p .
```

## Releasing

1. Bump `version` in `.claude-plugin/plugin.json` and in `.claude-plugin/marketplace.json`.
2. Add an entry to `CHANGELOG.md`.
3. Commit, then tag the release with `claude plugin tag . --push`. The command checks that both versions agree.
4. Push the commit.

Users get the new version with `claude plugin update rainbow-cat@mrfoxes`.

## License

[MIT](LICENSE)
