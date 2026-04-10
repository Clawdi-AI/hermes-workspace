import { loader } from '@monaco-editor/react'

let configurePromise: Promise<void> | null = null

export function configureMonaco(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  configurePromise ??= Promise.resolve().then(() => {
    loader.config({ paths: { vs: '/monaco/vs' } })
  })
  return configurePromise
}
