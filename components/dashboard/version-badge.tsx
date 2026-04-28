"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VersionBadgeProps {
  status: "up-to-date" | "update-available" | "unknown"
  isInternal?: boolean
  versionSource?: string
  className?: string
}

export function VersionBadge({ status, isInternal, versionSource, className }: VersionBadgeProps) {
  const variants = {
    "up-to-date": {
      label: "Up to Date",
      className: "bg-success/15 text-success border-success/30",
      tooltip: "This app is running the latest version",
    },
    "update-available": {
      label: "Update Available",
      className: "bg-warning/15 text-warning border-warning/30",
      tooltip: "A newer version is available",
    },
    unknown: {
      label: isInternal ? "Internal" : "Unknown",
      className: isInternal 
        ? "bg-info/15 text-info border-info/30"
        : "bg-muted text-muted-foreground border-border",
      tooltip: isInternal 
        ? "Internal/custom script - version tracking not applicable"
        : "Unable to determine latest version",
    },
  }

  const variant = variants[status]
  
  const sourceLabel = versionSource && versionSource !== "unknown" && versionSource !== "internal"
    ? ` (via ${versionSource})`
    : ""

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-help",
              variant.className,
              className
            )}
          >
            {variant.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{variant.tooltip}{sourceLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
