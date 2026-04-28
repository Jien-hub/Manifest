"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { VersionBadge } from "./version-badge"
import type { AppWithStatus } from "@/lib/types"

interface OutdatedAppsAlertProps {
  apps: AppWithStatus[]
}

export function OutdatedAppsAlert({ apps }: OutdatedAppsAlertProps) {
  const outdatedApps = apps
    .filter((app) => app.versionStatus === "update-available")
    .slice(0, 5)

  if (outdatedApps.length === 0) return null

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          Updates Available ({apps.filter((app) => app.versionStatus === "update-available").length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {outdatedApps.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-lg bg-card p-3"
            >
              <div>
                <p className="font-medium">{app.displayName}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{app.displayVersion}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono text-success">{app.latestVersion}</span>
                </div>
              </div>
              <VersionBadge status={app.versionStatus} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
