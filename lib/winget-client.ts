import type { AppWithStatus } from "./types"
import { getAppMapping, isInternalApp, normalizeAppName, extractVersionFromName, APP_MAPPINGS } from "./app-mappings"

// Cache for version lookups
const versionCache = new Map<string, { version: string | null; source: string; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export function compareVersions(
  currentVersion: string | null,
  latestVersion: string | null
): "up-to-date" | "update-available" | "unknown" {
  if (!currentVersion || !latestVersion || latestVersion === "unknown") {
    return "unknown"
  }

  // Clean version strings
  const cleanVersion = (v: string) => v.replace(/^v/i, "").trim()

  const current = cleanVersion(currentVersion)
    .split(/[.-]/)
    .map((part) => {
      const num = parseInt(part, 10)
      return isNaN(num) ? part : num
    })

  const latest = cleanVersion(latestVersion)
    .split(/[.-]/)
    .map((part) => {
      const num = parseInt(part, 10)
      return isNaN(num) ? part : num
    })

  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const c = current[i] ?? 0
    const l = latest[i] ?? 0

    if (typeof c === "number" && typeof l === "number") {
      if (c < l) return "update-available"
      if (c > l) return "up-to-date"
    } else {
      const cStr = String(c)
      const lStr = String(l)
      if (cStr < lStr) return "update-available"
      if (cStr > lStr) return "up-to-date"
    }
  }

  return "up-to-date"
}

// Fetch latest version from GitHub Releases API
async function fetchGitHubVersion(repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Intune-Dashboard",
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      // Try tags if no releases
      const tagsResponse = await fetch(
        `https://api.github.com/repos/${repo}/tags?per_page=1`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Intune-Dashboard",
          },
          next: { revalidate: 3600 },
        }
      )

      if (tagsResponse.ok) {
        const tags = await tagsResponse.json()
        if (tags.length > 0) {
          return tags[0].name?.replace(/^v/i, "") || null
        }
      }
      return null
    }

    const data = await response.json()
    return data.tag_name?.replace(/^v/i, "") || null
  } catch (error) {
    console.error(`Error fetching GitHub version for ${repo}:`, error)
    return null
  }
}

// Fetch from Winget API
async function fetchWingetVersion(wingetId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.winget.run/v2/packages/${encodeURIComponent(wingetId)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.Latest?.Version || data.Versions?.[0] || null
  } catch (error) {
    console.error(`Error fetching Winget version for ${wingetId}:`, error)
    return null
  }
}

// Get version for an app using multiple sources
async function getLatestVersion(
  appName: string,
  publisher?: string | null
): Promise<{ version: string | null; source: string }> {
  const cacheKey = normalizeAppName(appName)
  
  // Check cache
  const cached = versionCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { version: cached.version, source: cached.source }
  }

  // Check if internal app
  if (isInternalApp(appName, publisher || undefined)) {
    const result = { version: null, source: "internal" }
    versionCache.set(cacheKey, { ...result, timestamp: Date.now() })
    return result
  }

  // Try mapped lookup first
  const mapping = getAppMapping(appName)

  if (mapping) {
    let version: string | null = null
    let source = "unknown"

    // Try GitHub first (more reliable for open source)
    if (mapping.githubRepo) {
      version = await fetchGitHubVersion(mapping.githubRepo)
      if (version) source = "github"
    }

    // Fallback to Winget
    if (!version && mapping.wingetId) {
      version = await fetchWingetVersion(mapping.wingetId)
      if (version) source = "winget"
    }

    if (version) {
      const result = { version, source }
      versionCache.set(cacheKey, { ...result, timestamp: Date.now() })
      return result
    }
  }

  // No mapping - return unknown (don't do fuzzy search which causes wrong matches)
  const result = { version: null, source: "unknown" }
  versionCache.set(cacheKey, { ...result, timestamp: Date.now() })
  return result
}

// Clean display name by removing version from it
function cleanDisplayName(name: string): string {
  // Remove version numbers from the end of the name
  return name
    .replace(/\s+v?\d+(\.\d+){1,4}$/i, "")
    .replace(/\s+\d+(\.\d+){1,4}$/i, "")
    .replace(/\s*\(.*?\)\s*$/, "")
    .trim()
}

// Get the actual deployed version - prefer displayVersion, extract from name if needed
function getDeployedVersion(app: AppWithStatus): string | null {
  if (app.displayVersion && app.displayVersion !== "unknown") {
    return app.displayVersion
  }
  
  // Try to extract version from name
  const extracted = extractVersionFromName(app.displayName)
  if (extracted) {
    return extracted
  }
  
  return null
}

// Deduplicate apps by normalized name, keeping the most recent one
function deduplicateApps(apps: AppWithStatus[]): AppWithStatus[] {
  const appMap = new Map<string, AppWithStatus>()

  for (const app of apps) {
    const normalizedKey = normalizeAppName(app.displayName)
    const existing = appMap.get(normalizedKey)

    if (!existing) {
      appMap.set(normalizedKey, app)
    } else {
      // Keep the one with more recent lastModifiedDateTime or better data
      const existingDate = new Date(existing.lastModifiedDateTime || 0).getTime()
      const newDate = new Date(app.lastModifiedDateTime || 0).getTime()

      if (newDate > existingDate) {
        appMap.set(normalizedKey, app)
      } else if (newDate === existingDate) {
        // Prefer the one with install summary data
        const existingHasData = (existing.installedCount || 0) + (existing.failedCount || 0) > 0
        const newHasData = (app.installedCount || 0) + (app.failedCount || 0) > 0
        
        if (newHasData && !existingHasData) {
          appMap.set(normalizedKey, app)
        }
      }
    }
  }

  return Array.from(appMap.values())
}

export async function enrichAppsWithVersions(
  apps: AppWithStatus[]
): Promise<AppWithStatus[]> {
  // First, deduplicate apps
  const uniqueApps = deduplicateApps(apps)

  // Process in batches
  const batchSize = 5
  const enrichedApps: AppWithStatus[] = []

  for (let i = 0; i < uniqueApps.length; i += batchSize) {
    const batch = uniqueApps.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (app) => {
        const { version: latestVersion, source } = await getLatestVersion(
          app.displayName,
          app.publisher
        )

        const deployedVersion = getDeployedVersion(app)
        const cleanName = cleanDisplayName(app.displayName)
        
        // Get mapped display name if available
        const mapping = getAppMapping(app.displayName)
        const displayName = mapping?.displayName || cleanName

        // Determine version status
        let versionStatus: "up-to-date" | "update-available" | "unknown" | "internal" = "unknown"
        
        if (source === "internal") {
          versionStatus = "internal" as "unknown" // Type workaround - internal apps show as unknown status
        } else if (latestVersion && deployedVersion) {
          versionStatus = compareVersions(deployedVersion, latestVersion)
        }

        return {
          ...app,
          displayName,
          displayVersion: deployedVersion || app.displayVersion,
          latestVersion: latestVersion || undefined,
          versionStatus,
          versionSource: source,
          isInternal: source === "internal",
        }
      })
    )
    enrichedApps.push(...results)
  }

  return enrichedApps
}

// Export for use in other modules
export { APP_MAPPINGS, normalizeAppName, isInternalApp }
