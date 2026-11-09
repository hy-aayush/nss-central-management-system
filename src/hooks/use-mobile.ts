import * as React from "react"

const MOBILE_BREAKPOINT = "(max-width: 767px)"

/**
 * Reads a media query as an external store.
 *
 * The previous version kept the answer in `useState` and filled it from an
 * effect, which meant every consumer rendered twice on mount and subscribed
 * with its own listener. `useSyncExternalStore` reads the current value
 * synchronously, shares one listener per query, and lets the server render the
 * desktop answer without a hydration mismatch.
 */
function mediaQueryStore(query: string) {
  let mql: MediaQueryList | null = null
  const listeners = new Set<() => void>()

  const subscribe = (listener: () => void) => {
    if (!mql) mql = window.matchMedia(query)
    listeners.add(listener)
    const notify = () => {
      for (const entry of listeners) entry()
    }
    mql.addEventListener("change", notify)

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) mql?.removeEventListener("change", notify)
    }
  }

  const getSnapshot = () => {
    if (!mql) mql = window.matchMedia(query)
    return mql.matches
  }

  return { subscribe, getSnapshot }
}

const mobileStore = mediaQueryStore(MOBILE_BREAKPOINT)

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    mobileStore.subscribe,
    mobileStore.getSnapshot,
    () => false,
  )
}
