"use client"

import * as React from "react"

const MESSAGE = "You have unsaved changes. Leave this page?"

/**
 * Guards a filled-in form against an accidental navigation.
 *
 * Dirtiness is detected with one native `input` listener on the form rather
 * than by mirroring every field into React state: the first keystroke arms the
 * guard, the submit disarms it, and no component re-renders in between. That
 * keeps a long event form as cheap to type into as a short one.
 *
 * Two exits are covered, because they are genuinely different mechanisms:
 * `beforeunload` for a reload or an external link (the browser draws that
 * dialog), and a capture-phase click listener for in-app navigation, which
 * `beforeunload` never sees.
 */
export function useUnsavedChanges() {
  const formRef = React.useRef<HTMLFormElement | null>(null)

  React.useEffect(() => {
    const form = formRef.current
    if (!form) return

    let armed = false

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Chrome requires returnValue to be set; the text itself is ignored.
      event.returnValue = ""
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return
      if (anchor.getAttribute("target") === "_blank") return
      if (anchor.hasAttribute("download")) return

      event.preventDefault()
      if (window.confirm(MESSAGE)) {
        window.location.assign(href)
      }
    }

    const arm = () => {
      if (armed) return
      armed = true
      window.addEventListener("beforeunload", beforeUnload)
      document.addEventListener("click", onClick, true)
    }

    const disarm = () => {
      if (!armed) return
      armed = false
      window.removeEventListener("beforeunload", beforeUnload)
      document.removeEventListener("click", onClick, true)
    }

    form.addEventListener("input", arm, { once: true })
    form.addEventListener("change", arm, { once: true })
    form.addEventListener("submit", disarm)

    return () => {
      form.removeEventListener("input", arm)
      form.removeEventListener("change", arm)
      form.removeEventListener("submit", disarm)
      disarm()
    }
  }, [])

  return formRef
}
