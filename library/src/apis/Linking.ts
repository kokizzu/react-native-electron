import type { Listener } from '../types.js'

const remote = window.ReactNativeElectron

function noop() {}

const eventHandlers = new Map<Listener, Listener>()

export const addEventListener = (type: string, handler: Listener): (() => void) => {
  if (type === 'url' && typeof handler === 'function') {
    const wrapHandler: Listener = (_event, url) => {
      handler({ type, url })
    }
    eventHandlers.set(handler, wrapHandler)
    remote.appOpenURL.addListener(wrapHandler)

    return () => {
      remote.appOpenURL.removeListener(wrapHandler)
      eventHandlers.delete(handler)
    }
  }

  return noop
}

export const removeEventListener = (type: string, handler: Listener): void => {
  if (type === 'url' && typeof handler === 'function') {
    const wrapHandler = eventHandlers.get(handler)
    if (wrapHandler) {
      remote.appOpenURL.removeListener(wrapHandler)
    }
    eventHandlers.delete(handler)
  }
}

export const openURL = async (url: string): Promise<void> => {
  await remote.openURL(url)
}

// Apply same behavior as RNW
export const canOpenURL = (): Promise<boolean> => Promise.resolve(true)

export const getInitialURL = async (): Promise<string | null> => {
  return (await remote.getInitialURL()) || null
}
