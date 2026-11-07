import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-sheen animate-pulse rounded-md bg-surface-container-high/70",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
