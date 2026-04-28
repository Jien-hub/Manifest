"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardHeader } from "./header"
import { StatsCards } from "./stats-cards"
import { AppsTable } from "./apps-table"
import { OutdatedAppsAlert } from "./outdated-apps-alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import type { AppWithStatus, DashboardStats } from "@/lib/types"

interface DashboardData {
  apps: AppWithStatus[]
  stats: DashboardStats
  lastUpdated: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch data")
  }
  return res.json()
}

export function Dashboard() {
  const { data: session, status } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data,
    error,
    mutate,
    isLoading,
  } = useSWR<DashboardData>(
    status === "authenticated" ? "/api/intune/apps" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  )

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await mutate()
    setIsRefreshing(false)
  }, [mutate])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription className="mt-2">
              {error.message}
              {error.message.includes("Token expired") && (
                <span className="block mt-2">
                  Please sign out and sign in again.
                </span>
              )}
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Alert>
        </main>
      </div>
    )
  }

  const defaultStats: DashboardStats = {
    totalApps: 0,
    upToDateApps: 0,
    outdatedApps: 0,
    failedInstalls: 0,
    totalDevices: 0,
    totalInstalled: 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        lastUpdated={data?.lastUpdated}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <StatsCards
            stats={data?.stats || defaultStats}
            isLoading={isLoading}
          />

          {data?.apps && <OutdatedAppsAlert apps={data.apps} />}

          <AppsTable apps={data?.apps || []} isLoading={isLoading} />
        </div>
      </main>
    </div>
  )
}
