"use client";

/**
 * Toast entry point.
 *
 * `sonner` and its icon set used to be part of every route that could raise a
 * notification, even though a toast is only ever shown after a user action. The
 * library is now imported on the first call, and the surface that renders it is
 * mounted at the same moment (previously no surface was mounted at all, so
 * these messages were silently dropped).
 */
export const TOASTER_MOUNT_EVENT = "nss:toaster-mount";

type ToastKind = "success" | "error" | "info" | "warning" | "message";

type ToastOptions = {
  description?: string;
  id?: string;
};

let sonner: Promise<typeof import("sonner")> | null = null;

function loadSonner() {
  sonner ??= import("sonner");
  return sonner;
}

export function notify(
  kind: ToastKind,
  message: string,
  options?: ToastOptions,
) {
  if (typeof window === "undefined") return;

  // Mount the surface before the toast exists, so its first render already has
  // the toast in sonner's store.
  window.dispatchEvent(new Event(TOASTER_MOUNT_EVENT));

  void loadSonner().then((module) => {
    if (kind === "message") {
      module.toast(message, options);
    } else {
      module.toast[kind](message, options);
    }
  });
}
