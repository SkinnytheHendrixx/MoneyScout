import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "wouter"
import { Plus, ArrowUpDown, ExternalLink, Search, Activity, Eye, ListTodo, PauseCircle, RefreshCw, ShieldAlert, Wrench } from "lucide-react"
import { useListOpportunities } from "@workspace/api-client-react"
import { getPolicyBadge, getVerdictBadge } from "@/components/badges"
import { formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { NeedsYouList } from "@/components/needs-you-list"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortField =
  | "name"
  | "opportunity_type"
  | "source_platform"
  | "status"
  | "policy_status"
  | "verdict"
  | "overall_score"
  | "last_researched"
type SortOrder = "asc" | "desc"

type ControlCenterResponse = {
  counts: {
    RUNNING: number
    QUEUED: number
    WATCHING: number
    HUMAN_BLOCKED: number
    RECOVERING: number
    COMPLETE: number
    IDLE: number
  }
}

export default function OpportunitiesList() {
  const { data: opportunities, isLoading, isError } = useListOpportunities()
  const controlCenter = useQuery<ControlCenterResponse>({
    queryKey: ["portfolio-control-center"],
    queryFn: async () => {
      const response = await fetch("/api/portfolio/control-center", { credentials: "include" })
      if (!response.ok) throw new Error(`Control center returned ${response.status}`)
      return response.json()
    },
    refetchInterval: 10_000,
  })
  const [sortField, setSortField] = useState<SortField>("overall_score")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [search, setSearch] = useState("")

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const filteredAndSorted = useMemo(() => {
    if (!opportunities) return []
    const result = opportunities.filter((opp) =>
      opp.name.toLowerCase().includes(search.toLowerCase()) ||
      opp.source_platform.toLowerCase().includes(search.toLowerCase())
    )

    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    return result
  }, [opportunities, sortField, sortOrder, search])

  const counts = controlCenter.data?.counts
  const stateCards = [
    { key: "RUNNING", label: "Running now", value: counts?.RUNNING ?? 0, note: "Actively executing", icon: Activity },
    { key: "QUEUED", label: "Queued", value: counts?.QUEUED ?? 0, note: "Next action already known", icon: ListTodo },
    { key: "WATCHING", label: "Watching", value: counts?.WATCHING ?? 0, note: "Monitoring defined signals", icon: PauseCircle },
    { key: "HUMAN_BLOCKED", label: "Needs you", value: counts?.HUMAN_BLOCKED ?? 0, note: "True human bottlenecks", icon: ShieldAlert },
    { key: "RECOVERING", label: "Recovering", value: counts?.RECOVERING ?? 0, note: "Repairing interrupted work", icon: Wrench },
    { key: "COMPLETE", label: "Complete", value: counts?.COMPLETE ?? 0, note: "Terminal or finished state", icon: Eye },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Control Center</h1>
          </div>
          <p className="text-muted-foreground mt-1">See what Money Scout is doing, what is waiting, and what actually needs you.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void controlCenter.refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
            title="Refresh portfolio state"
          >
            <RefreshCw className={`h-4 w-4 ${controlCenter.isFetching ? "animate-spin" : ""}`} />
          </button>
          <Link href="/opportunities/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stateCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4" /> {item.label}</div>
                <div className="mt-2 text-2xl font-bold">{controlCenter.isLoading ? "…" : item.value}</div>
                <div className="text-xs text-muted-foreground">{item.note}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {counts && counts.IDLE > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
          {counts.IDLE} RevOpp{counts.IDLE === 1 ? " is" : "s are"} currently idle without one of the allowed operator states. Treat persistent idle records as an autonomy/reconciliation issue, not normal workflow.
        </div>
      )}

      <NeedsYouList limit={3} compact />
      <div className="flex justify-end -mt-2">
        <Link href="/needs-you" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">Open full Needs You queue</Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">RevOpps</h2>
          <p className="text-xs text-muted-foreground">Click any opportunity for the 5-second operating view and full drill-down.</p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or platform..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("opportunity_type")}>
                <div className="flex items-center gap-1">Type <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("source_platform")}>
                <div className="flex items-center gap-1">Platform <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("verdict")}>
                <div className="flex items-center gap-1">Verdict <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("policy_status")}>
                <div className="flex items-center gap-1">Policy <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("overall_score")}>
                <div className="flex items-center justify-end gap-1">Score <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("last_researched")}>
                <div className="flex items-center justify-end gap-1">Last researched <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading opportunities...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-destructive">Failed to load opportunities.</TableCell></TableRow>
            ) : filteredAndSorted.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No opportunities found.</TableCell></TableRow>
            ) : (
              filteredAndSorted.map((opp) => (
                <TableRow key={opp.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/opportunities/${opp.id}`} className="hover:underline hover:text-primary transition-colors">{opp.name}</Link>
                      <Link href={`/opportunities/${opp.id}/runs`} title="Run timeline" className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><Activity className="h-3.5 w-3.5" /></Link>
                      {opp.source_url && <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="h-3 w-3" /></a>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{opp.opportunity_type}</TableCell>
                  <TableCell className="text-muted-foreground">{opp.source_platform}</TableCell>
                  <TableCell>{getVerdictBadge(opp.verdict)}</TableCell>
                  <TableCell>{getPolicyBadge(opp.policy_status)}</TableCell>
                  <TableCell className="text-right font-mono">{opp.overall_score}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">{formatDate(opp.last_researched)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
