import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
