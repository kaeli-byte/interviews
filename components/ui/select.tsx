"use client"

import * as React from "react"
import { Select as SelectBase } from "@base-ui/react/select"
import { cn } from "@/lib/utils"

const Select = SelectBase.Root

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectBase.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectBase.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectBase.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectBase.Icon className="size-4 opacity-50" />
  </SelectBase.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = SelectBase.Value

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <SelectBase.Portal>
    <SelectBase.Positioner className="z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
      <SelectBase.Popup
        ref={ref}
        className={cn(
          "max-h-[--available-height] overflow-y-auto p-1",
          className
        )}
        {...props}
      >
        {children}
      </SelectBase.Popup>
    </SelectBase.Positioner>
  </SelectBase.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectBase.Item>,
  React.ComponentPropsWithoutRef<typeof SelectBase.Item>
>(({ className, children, ...props }, ref) => (
  <SelectBase.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectBase.ItemIndicator className="size-2 rounded-full bg-current data-[selected]:opacity-100" />
    </span>
    <SelectBase.ItemText className="text-sm">{children}</SelectBase.ItemText>
  </SelectBase.Item>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
