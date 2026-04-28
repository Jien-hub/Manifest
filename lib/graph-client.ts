import type {
  MobileApp,
  MobileAppInstallSummary,
  MobileAppAssignment,
  GraphApiResponse,
  AppWithStatus,
} from "./types"

const GRAPH_API_BASE = "https://graph.microsoft.com/beta"

export class GraphClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GRAPH_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Graph API Error: ${response.status} - ${error.error?.message || response.statusText}`
      )
    }

    return response.json()
  }

  async getMobileApps(): Promise<MobileApp[]> {
    const apps: MobileApp[] = []
    let nextLink: string | undefined = "/deviceAppManagement/mobileApps?$top=50"

    while (nextLink) {
      const endpoint = nextLink.startsWith("http")
        ? nextLink.replace(GRAPH_API_BASE, "")
        : nextLink

      const response = await this.fetch<GraphApiResponse<MobileApp>>(endpoint)
      apps.push(...response.value)
      nextLink = response["@odata.nextLink"]
    }

    // Filter out built-in apps and focus on deployed apps
    return apps.filter(
      (app) =>
        app.publishingState === "published" ||
        app["@odata.type"]?.includes("win32") ||
        app["@odata.type"]?.includes("windowsStore") ||
        app["@odata.type"]?.includes("winGetApp")
    )
  }

  async getAppInstallSummary(appId: string): Promise<MobileAppInstallSummary | null> {
    try {
      return await this.fetch<MobileAppInstallSummary>(
        `/deviceAppManagement/mobileApps/${appId}/installSummary`
      )
    } catch {
      return null
    }
  }

  async getAppAssignments(appId: string): Promise<MobileAppAssignment[]> {
    try {
      const response = await this.fetch<GraphApiResponse<MobileAppAssignment>>(
        `/deviceAppManagement/mobileApps/${appId}/assignments`
      )
      return response.value
    } catch {
      return []
    }
  }

  async getAppsWithStatus(): Promise<AppWithStatus[]> {
    const apps = await this.getMobileApps()

    // Fetch install summaries in parallel (with batching to avoid rate limits)
    const batchSize = 10
    const appsWithStatus: AppWithStatus[] = []

    for (let i = 0; i < apps.length; i += batchSize) {
      const batch = apps.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map(async (app) => {
          const [installSummary, assignments] = await Promise.all([
            this.getAppInstallSummary(app.id),
            this.getAppAssignments(app.id),
          ])

          // Calculate total targeted devices (including not installed)
          const installedCount = installSummary?.installedDeviceCount || 0
          const failedCount = installSummary?.failedDeviceCount || 0
          const pendingCount = installSummary?.pendingInstallDeviceCount || 0
          const notInstalledCount = installSummary?.notInstalledDeviceCount || 0
          
          // Total targeted = all devices that should have the app
          const totalTargeted = installedCount + failedCount + pendingCount + notInstalledCount

          // Calculate percentages based on targeted devices
          const installPercentage =
            totalTargeted > 0
              ? Math.round((installedCount / totalTargeted) * 100)
              : 0

          const failedPercentage =
            totalTargeted > 0
              ? Math.round((failedCount / totalTargeted) * 100)
              : 0

          const pendingPercentage =
            totalTargeted > 0
              ? Math.round(((pendingCount + notInstalledCount) / totalTargeted) * 100)
              : 0

          return {
            ...app,
            installSummary: installSummary || undefined,
            versionStatus: "unknown" as const,
            installPercentage,
            failedPercentage,
            pendingPercentage,
            installedCount,
            failedCount,
            pendingCount: pendingCount + notInstalledCount,
            totalTargeted,
            assignments,
          }
        })
      )
      appsWithStatus.push(...results)
    }

    return appsWithStatus
  }
}
