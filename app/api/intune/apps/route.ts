import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GraphClient } from "@/lib/graph-client"
import { enrichAppsWithVersions } from "@/lib/winget-client"
import type { DashboardStats } from "@/lib/types"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        { error: "Token expired. Please sign in again." },
        { status: 401 }
      )
    }

    const graphClient = new GraphClient(session.accessToken)

    // Fetch apps with install status
    let apps = await graphClient.getAppsWithStatus()

    // Enrich with Winget version data
    apps = await enrichAppsWithVersions(apps)

    // Calculate dashboard stats
    const stats: DashboardStats = {
      totalApps: apps.length,
      upToDateApps: apps.filter((app) => app.versionStatus === "up-to-date").length,
      outdatedApps: apps.filter((app) => app.versionStatus === "update-available").length,
      failedInstalls: apps.reduce(
        (sum, app) => sum + (app.installSummary?.failedDeviceCount || 0),
        0
      ),
      totalDevices: apps.reduce((sum, app) => {
        const summary = app.installSummary
        if (!summary) return sum
        return (
          sum +
          summary.installedDeviceCount +
          summary.failedDeviceCount +
          summary.pendingInstallDeviceCount +
          summary.notInstalledDeviceCount
        )
      }, 0),
      totalInstalled: apps.reduce(
        (sum, app) => sum + (app.installSummary?.installedDeviceCount || 0),
        0
      ),
    }

    return NextResponse.json({
      apps,
      stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching Intune apps:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch apps" },
      { status: 500 }
    )
  }
}
