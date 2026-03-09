import * as React from "react"

import { cn } from "~/lib/utils"

function BentoGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-grid"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function BentoGridItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-grid-item"
      className={cn("min-w-0", className)}
      {...props}
    />
  )
}

export { BentoGrid, BentoGridItem }
