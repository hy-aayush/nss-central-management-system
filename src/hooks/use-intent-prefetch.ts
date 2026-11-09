"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

/**
 * Prefetch on intent instead of on sight.
 *
 * The office tables deliberately do not prefetch their row links on viewport
 * entry: a directory of 950 volunteers would otherwise fire a hundred server
 * renders (and a hundred access-gate queries) just because someone scrolled
 * past them. Prefetching on pointer/focus/touch gives the same instant feel for
 * the row a person actually aims at, and costs one request per href because the
 * router deduplicates.
 *
 * The cap matters as much as the trigger. Sweeping a pointer down a table is a
 * sequence of pointerenter events, and without a budget that sweep would start
 * one private render per row it crossed — the exact cost the deferral avoided.
 * A small token bucket lets the first couple of rows warm immediately and drops
 * the rest of the sweep; whatever the pointer finally settles on is fetched by
 * the click itself.
 */
const BUCKET_SIZE = 2
const REFILL_MS = 600

export function useIntentPrefetch() {
  const router = useRouter()
  const requested = React.useRef(new Set<string>())
  const tokens = React.useRef(BUCKET_SIZE)
  const lastRefill = React.useRef(0)

  return React.useCallback(
    (href: string) => {
      const prefetch = () => {
        if (requested.current.has(href)) return

        const now = Date.now()
        const elapsed = now - lastRefill.current
        if (elapsed > 0) {
          tokens.current = Math.min(
            BUCKET_SIZE,
            tokens.current + elapsed / REFILL_MS,
          )
          lastRefill.current = now
        }
        if (tokens.current < 1) return

        tokens.current -= 1
        requested.current.add(href)
        try {
          router.prefetch(href)
        } catch {
          // A prefetch is an optimisation; never let it break a navigation.
        }
      }

      return {
        onPointerEnter: prefetch,
        onFocus: prefetch,
        onTouchStart: prefetch,
      }
    },
    [router],
  )
}
