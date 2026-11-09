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
 *
 * With `draftKey`, the same listeners also keep a session draft: a reload after
 * a mis-click on the address bar comes back with what was typed. It is
 * `sessionStorage`, not a server draft, because a half-written record is not
 * something to sync between devices; it is something to survive one tab's
 * accident. Only empty fields are restored, so a server-provided default is
 * never overwritten by an older draft, and submitting clears the entry.
 */
export function useUnsavedChanges(options?: { draftKey?: string }) {
  const formRef = React.useRef<HTMLFormElement | null>(null)
  const draftKey = options?.draftKey

  React.useEffect(() => {
    const form = formRef.current
    if (!form) return

    let armed = false

    const storageKey = draftKey ? `nss:draft:${draftKey}` : null
    let saveTimer: ReturnType<typeof setTimeout> | undefined

    const writeDraft = () => {
      if (!storageKey) return
      const draft: Record<string, string> = {}

      new FormData(form).forEach((value, name) => {
        // Files cannot be serialised, and a hidden field is the server's own
        // state rather than something the person typed.
        if (typeof value !== "string" || name.startsWith("$")) return
        draft[name] = value
      })

      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(draft))
      } catch {
        // A full or disabled storage must not break the form.
      }
    }

    const clearDraft = () => {
      if (!storageKey) return
      try {
        window.sessionStorage.removeItem(storageKey)
      } catch {
        // Ignored, as above.
      }
    }

    if (storageKey) {
      try {
        const raw = window.sessionStorage.getItem(storageKey)
        if (raw) {
          const draft = JSON.parse(raw) as Record<string, string>
          for (const [name, value] of Object.entries(draft)) {
            const field = form.elements.namedItem(name)
            if (!(field instanceof HTMLElement)) continue
            if (
              field instanceof HTMLInputElement &&
              (field.type === "hidden" || field.type === "file")
            ) {
              continue
            }
            if (
              field instanceof HTMLInputElement ||
              field instanceof HTMLTextAreaElement ||
              field instanceof HTMLSelectElement
            ) {
              if (!field.value) field.value = value
            }
          }
        }
      } catch {
        // A corrupt draft is dropped, not surfaced.
      }
    }

    const queueDraft = () => {
      if (!storageKey) return
      clearTimeout(saveTimer)
      saveTimer = setTimeout(writeDraft, 500)
    }

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
    form.addEventListener("input", queueDraft)
    form.addEventListener("change", queueDraft)
    form.addEventListener("submit", disarm)
    form.addEventListener("submit", clearDraft)

    return () => {
      form.removeEventListener("input", arm)
      form.removeEventListener("change", arm)
      form.removeEventListener("input", queueDraft)
      form.removeEventListener("change", queueDraft)
      form.removeEventListener("submit", disarm)
      form.removeEventListener("submit", clearDraft)
      clearTimeout(saveTimer)
      disarm()
    }
  }, [draftKey])

  return formRef
}
