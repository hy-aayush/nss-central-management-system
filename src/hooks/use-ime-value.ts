"use client";

import * as React from "react";

/**
 * Search input handling that waits for an input method editor to finish.
 *
 * Typing Devanagari, Japanese or Chinese produces a stream of `input` events
 * carrying half-formed candidates before the composition commits. Filtering on
 * those means the table empties itself mid-word, and a debounced URL write can
 * persist a value the person never chose. Every keystroke is still shown
 * immediately — the input is controlled by the caller — but the filter pass
 * runs on the composed value instead.
 *
 * Latin typing is unaffected: `isComposing` is false for it, so `settled` calls
 * straight through.
 */
export function useImeValue(commit: (value: string) => void) {
  const composing = React.useRef(false);

  const compositionProps = {
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      commit(event.currentTarget.value);
    },
  };

  /**
   * Call after updating the input's visible value. Applies the value unless a
   * composition is in flight, in which case `onCompositionEnd` will.
   */
  const settled = (value: string) => {
    if (!composing.current) commit(value);
  };

  return { compositionProps, settled };
}
