"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Box, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Apps",
      value: stats.totalApps,
      icon: Box,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Up to Date",
      value: stats.upToDateApps,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Updates Available",
      value: stats.outdatedApps,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Failed Installs",
      value: stats.failedInstalls,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-2xl font-semibold">{card.value.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
