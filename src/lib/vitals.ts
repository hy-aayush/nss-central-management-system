/**
 * Field measurements, without a dependency.
 *
 * "It feels smooth" is not a number, and the only honest way to know whether a
 * change helped is to record what a real visit experienced. This reads the four
 * Core-Web-Vitals-shaped signals straight from `PerformanceObserver` — no
 * `web-vitals` package, no extra bundle beyond this file, and it runs once on
 * `pagehide` so it never competes with rendering.
 *
 * Deliberate naming: the event timing value is the *longest event*, not INP,
 * because INP needs the full interaction set that only the browser's own
 * attribution provides. Reporting it as INP would be a lie in a dashboard.
 */
interface VitalsPayload {
  path: string
  lcp: number
  cls: number
  longestEvent: number
  ttfb: number
  viewport: string
  connection?: string
  env: string
}

let started = false

export function startVitalsReporting(): void {
  if (started || typeof window === "undefined") return
  started = true

  let lcp = 0
  let cls = 0
  let longestEvent = 0

  const observe = (type: string, handler: (entries: PerformanceEntry[]) => void) => {
    try {
      const observer = new PerformanceObserver((list) => handler(list.getEntries()))
      observer.observe({ type, buffered: true } as PerformanceObserverInit)
      return observer
    } catch {
      // Unsupported entry type (older engines): the metric simply stays at 0.
      return null
    }
  }

  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1]
    if (last) lcp = last.startTime
  })

  observe("layout-shift", (entries) => {
    for (const entry of entries) {
      const shift = entry as PerformanceEntry & {
        value?: number
        hadRecentInput?: boolean
      }
      if (!shift.hadRecentInput && typeof shift.value === "number") {
        cls += shift.value
      }
    }
  })

  observe("event", (entries) => {
    for (const entry of entries) {
      if (entry.duration > longestEvent) longestEvent = entry.duration
    }
  })

  const send = () => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined

    // The observer can start after the paint it is looking for (this runs on
    // idle), so fall back to the browser's own buffer at send time.
    const bufferedLcp = performance.getEntriesByType("largest-contentful-paint").at(-1)

    const payload: VitalsPayload = {
      path: window.location.pathname,
      lcp: Math.round(lcp || bufferedLcp?.startTime || 0),
      cls: Math.round(cls * 1000) / 1000,
      longestEvent: Math.round(longestEvent),
      ttfb: Math.round(navigation?.responseStart ?? 0),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: (
        navigator as Navigator & { connection?: { effectiveType?: string } }
      ).connection?.effectiveType,
      env: process.env.NODE_ENV,
    }

    const body = JSON.stringify(payload)
    try {
      // sendBeacon survives the unload that is already in progress.
      navigator.sendBeacon("/api/vitals", new Blob([body], { type: "application/json" }))
    } catch {
      // Telemetry must never surface to the person using the page.
    }
  }

  window.addEventListener("pagehide", send, { once: true })
}
