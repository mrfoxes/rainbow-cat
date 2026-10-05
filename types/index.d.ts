// What the hooks module hands the cat's surface module
export type CatProps = { width: number }

declare module 'claude-code' {
  interface PluginState {
    'rainbow-cat': { isOn: boolean }
  }
}
