# Rainbow Cat

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

This plugin is a Claude Code mod: a TypeScript hooks module that Claude Code loads from `hooks/hooks.json`. It does only these things:

- It registers the `/rainbow` slash command.
- It changes how Claude Code draws the spinner and the turn summary in the terminal.
- It saves one value, whether rainbow cat mode is on or off, in Claude Code's own plugin store on your machine.

The plugin does not read your files, prompts or conversations. It does not run commands, start processes, use the network or send data anywhere. It has no dependencies and no build step: the source in `hooks/` is what runs.

## Requirements

This plugin uses the Claude Code function-hooks plugin API (`ui.render`, `$.command`, `$.store`). That API is early access and can change between releases. Version 0.2.1 was built and tested on Claude Code 2.1.289.

## Development

```
.claude-plugin/plugin.json        plugin manifest
.claude-plugin/marketplace.json   marketplace entry for this repository
hooks/hooks.json                  hooks module list
hooks/register.tsx                hooks: /rainbow command, Spinner and TurnDuration rendering
hooks/cat.tsx                     surface module that draws the animated cat
types/index.d.ts                  plugin state contract
tests/rainbow-cat.test.tsx        tests
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
