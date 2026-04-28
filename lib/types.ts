// Microsoft Graph Intune Types

export interface MobileApp {
  id: string
  displayName: string
  description: string | null
  publisher: string | null
  displayVersion: string | null
  createdDateTime: string
  lastModifiedDateTime: string
  "@odata.type": string
  isFeatured: boolean
  privacyInformationUrl: string | null
  informationUrl: string | null
  owner: string | null
  developer: string | null
  notes: string | null
  uploadState: number
  publishingState: string
  isAssigned: boolean
  roleScopeTagIds: string[]
  dependentAppCount: number
  supersedingAppCount: number
  supersededAppCount: number
}

export interface MobileAppInstallSummary {
  id: string
  installedDeviceCount: number
  failedDeviceCount: number
  notApplicableDeviceCount: number
  notInstalledDeviceCount: number
  pendingInstallDeviceCount: number
  installedUserCount: number
  failedUserCount: number
  notApplicableUserCount: number
  notInstalledUserCount: number
  pendingInstallUserCount: number
}

export interface MobileAppAssignment {
  id: string
  intent: "available" | "required" | "uninstall" | "availableWithoutEnrollment"
  source: string
  sourceId: string
  target: {
    "@odata.type": string
    deviceAndAppManagementAssignmentFilterId: string | null
    deviceAndAppManagementAssignmentFilterType: string
    groupId?: string
  }
}

export interface WingetPackageVersion {
  packageId: string
  packageName: string
  latestVersion: string
  versions: string[]
  publisher?: string
}

export interface AppWithStatus extends MobileApp {
  installSummary?: MobileAppInstallSummary
  latestVersion?: string
  versionStatus: "up-to-date" | "update-available" | "unknown"
  versionSource?: string
  isInternal?: boolean
  installPercentage: number
  failedPercentage: number
  pendingPercentage: number
  installedCount?: number
  failedCount?: number
  pendingCount?: number
  totalTargeted?: number
  assignments?: MobileAppAssignment[]
}

export interface DashboardStats {
  totalApps: number
  upToDateApps: number
  outdatedApps: number
  failedInstalls: number
  totalDevices: number
  totalInstalled: number
}

export interface GraphApiResponse<T> {
  "@odata.context"?: string
  "@odata.nextLink"?: string
  value: T[]
}
