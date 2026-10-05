// What the hooks module hands the cat's surface module
export type NyanProps = { width: number }

declare module 'claude-code' {
  interface PluginState {
    'nyan-cat': { isOn: boolean }
  }
}
