"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { TOASTER_MOUNT_EVENT } from "@/lib/notify";

/**
 * The toast surface is not part of the first paint: it is fetched and mounted
 * the first time something actually raises a notification. Sonner keeps its
 * queue in module state, so a toast raised in the same tick still appears once
 * the surface mounts.
 */
const ToasterSurface = dynamic(
  () => import("./sonner").then((module) => module.Toaster),
  { ssr: false },
);

export function LazyToaster() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (mounted) return;
    const mount = () => setMounted(true);
    window.addEventListener(TOASTER_MOUNT_EVENT, mount);
    return () => window.removeEventListener(TOASTER_MOUNT_EVENT, mount);
  }, [mounted]);

  return mounted ? <ToasterSurface /> : null;
}
