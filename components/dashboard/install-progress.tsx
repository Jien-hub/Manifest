"use client"

import { cn } from "@/lib/utils"

interface InstallProgressProps {
  installed: number
  failed: number
  pending: number
  className?: string
}

export function InstallProgress({
  installed,
  failed,
  pending,
  className,
}: InstallProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {installed > 0 && (
          <div
            className="bg-success transition-all"
            style={{ width: `${installed}%` }}
          />
        )}
        {pending > 0 && (
          <div
            className="bg-info transition-all"
            style={{ width: `${pending}%` }}
          />
        )}
        {failed > 0 && (
          <div
            className="bg-destructive transition-all"
            style={{ width: `${failed}%` }}
          />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" />
          {installed}% Installed
        </span>
        {pending > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-info" />
            {pending}% Pending
          </span>
        )}
        {failed > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {failed}% Failed
          </span>
        )}
      </div>
    </div>
  )
}
