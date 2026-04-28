"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VersionBadge } from "./version-badge"
import { InstallProgress } from "./install-progress"
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Box,
  Calendar,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import type { AppWithStatus } from "@/lib/types"

interface AppsTableProps {
  apps: AppWithStatus[]
  isLoading?: boolean
}

type SortField = "name" | "version" | "deployed" | "installed" | "status"
type SortDirection = "asc" | "desc"

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "up-to-date", label: "Up to Date" },
  { value: "update-available", label: "Update Available" },
  { value: "internal", label: "Internal" },
  { value: "unknown", label: "Unknown" },
] as const

export function AppsTable({ apps, isLoading }: AppsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredAndSortedApps = useMemo(() => {
    let result = [...apps]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (app) =>
          app.displayName.toLowerCase().includes(query) ||
          app.publisher?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "internal") {
        result = result.filter((app) => app.isInternal === true)
      } else {
        result = result.filter((app) => app.versionStatus === statusFilter && !app.isInternal)
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "name":
          comparison = a.displayName.localeCompare(b.displayName)
          break
        case "version":
          comparison = (a.displayVersion || "").localeCompare(b.displayVersion || "")
          break
        case "deployed":
          comparison =
            new Date(a.lastModifiedDateTime).getTime() -
            new Date(b.lastModifiedDateTime).getTime()
          break
        case "installed":
          comparison = a.installPercentage - b.installPercentage
          break
        case "status":
          const statusOrder = { "update-available": 0, "up-to-date": 1, unknown: 2 }
          comparison =
            statusOrder[a.versionStatus] - statusOrder[b.versionStatus]
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [apps, searchQuery, sortField, sortDirection, statusFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  const getAppTypeIcon = (odataType: string) => {
    if (odataType.includes("win32")) return "Win32"
    if (odataType.includes("winGetApp")) return "Winget"
    if (odataType.includes("windowsStore")) return "Store"
    if (odataType.includes("microsoft365")) return "M365"
    return "App"
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            Applications ({filteredAndSortedApps.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusFilters.map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.value}
                    checked={statusFilter === filter.value}
                    onCheckedChange={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center font-medium hover:text-foreground"
                  >
                    Application
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort("version")}
                    className="flex items-center font-medium hover:text-foreground"
                  >
                    Version
                    <SortIcon field="version" />
                  </button>
                </th>
                <th className="pb-3 pr-4">Latest</th>
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort("deployed")}
                    className="flex items-center font-medium hover:text-foreground"
                  >
                    Deployed
                    <SortIcon field="deployed" />
                  </button>
                </th>
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort("installed")}
                    className="flex items-center font-medium hover:text-foreground"
                  >
                    Install Status
                    <SortIcon field="installed" />
                  </button>
                </th>
                <th className="pb-3">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center font-medium hover:text-foreground"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedApps.map((app) => (
                <tr key={app.id} className="text-sm hover:bg-muted/50">
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium">{app.displayName}</p>
                      {app.publisher && (
                        <p className="text-xs text-muted-foreground">
                          {app.publisher}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
                      {getAppTypeIcon(app["@odata.type"])}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {app.displayVersion || "-"}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {app.latestVersion || "-"}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(app.lastModifiedDateTime), "MMM d, yyyy")}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <InstallProgress
                      installed={app.installPercentage}
                      failed={app.failedPercentage}
                      pending={app.pendingPercentage}
                    />
                  </td>
                  <td className="py-4">
                    <VersionBadge 
                      status={app.versionStatus} 
                      isInternal={app.isInternal}
                      versionSource={app.versionSource}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 lg:hidden">
          {filteredAndSortedApps.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-border bg-card/50 p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium">{app.displayName}</p>
                  {app.publisher && (
                    <p className="text-xs text-muted-foreground">{app.publisher}</p>
                  )}
                </div>
                <VersionBadge 
                  status={app.versionStatus} 
                  isInternal={app.isInternal}
                  versionSource={app.versionSource}
                />
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Current: </span>
                  <span className="font-mono">{app.displayVersion || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latest: </span>
                  <span className="font-mono">{app.latestVersion || "-"}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(app.lastModifiedDateTime), "MMM d, yyyy")}
                </div>
                <div>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                    {getAppTypeIcon(app["@odata.type"])}
                  </span>
                </div>
              </div>
              <InstallProgress
                installed={app.installPercentage}
                failed={app.failedPercentage}
                pending={app.pendingPercentage}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Box className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No apps match the current filter"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
