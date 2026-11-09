"use client"

import * as React from "react"

/**
 * Loads the field-metrics collector once the browser is idle.
 *
 * The collector is deliberately not part of the first payload: measuring the
 * page must never be one of the things the page waits for. When
 * `requestIdleCallback` is unavailable it falls back to a timer, and either way
 * the import is cancelled if the component unmounts first.
 */
export function VitalsReporter() {
  React.useEffect(() => {
    const start = () => {
      void import("@/lib/vitals").then((module) => module.startVitalsReporting())
    }

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(start, { timeout: 4000 })
      return () => window.cancelIdleCallback(handle)
    }

    const timer = window.setTimeout(start, 2500)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}
