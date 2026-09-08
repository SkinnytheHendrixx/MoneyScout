import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDashed,
  Clock3,
  Database,
  EyeOff,
  Filter,
  Fingerprint,
  Layers3,
  LoaderCircle,
  Minus,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  X,
} from "lucide-react"
import {
  DiscoveryCandidateStatus,
  type DiscoveryCandidate,
  type DiscoveryRun,
  getGetDiscoveryRunStatusQueryKey,
  getListDiscoveryCandidatesQueryKey,
  getListDiscoveryRunsQueryKey,
  getListOpportunitiesQueryKey,
  useAcceptDiscoveryCandidate,
  useDismissDiscoveryCandidate,
  useGetDiscoveryRunStatus,
  useListDiscoveryCandidates,
  useListDiscoveryRuns,
  useListOpportunities,
  useMarkDiscoveryCandidateDuplicate,
  useStartDiscoveryRun,
  useSuppressDiscoveryCandidate,
} from "@workspace/api-client-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatDateTime } from "@/lib/format"

type QueueFilter = "ALL" | "NEW" | "ACCEPTED" | "DISMISSED" | "SUPPRESSED" | "DUPLICATE"
type ActionKind = "accept" | "dismiss" | "suppress" | "duplicate"

const queueFilters: Array<{ value: QueueFilter; label: string }> = [
  { value: "ALL", label: "All candidates" },
  { value: "NEW", label: "Needs review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "SUPPRESSED", label: "Suppressed" },
  { value: "DUPLICATE", label: "Duplicates" },
]

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function shortDate(value: string | null | undefined) {
  return formatDateTime(value).replace(/, \d{4} /, " · ")
}

function statusTone(status: string) {
  switch (status) {
    case "RUNNING":
      return "border-[#a7c9b1] bg-[#e4f0e6] text-[#26583b]"
    case "COMPLETE":
      return "border-[#8db5aa] bg-[#e1efeb] text-[#174e45]"
    case "INCOMPLETE":
      return "border-[#e1c18b] bg-[#fbf0d7] text-[#825518]"
    case "FAILED":
    case "INTERRUPTED":
      return "border-[#d7a9a2] bg-[#f7e7e3] text-[#8e3b31]"
    default:
      return "border-[#c9c5b9] bg-[#eeece5] text-[#68665d]"
  }
}

function candidateTone(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "border-[#8db5aa] bg-[#e1efeb] text-[#174e45]"
    case "DISMISSED":
      return "border-[#c9c5b9] bg-[#eeece5] text-[#68665d]"
    case "SUPPRESSED":
      return "border-[#d7a9a2] bg-[#f7e7e3] text-[#8e3b31]"
    case "DUPLICATE":
      return "border-[#b8b9c7] bg-[#ececf2] text-[#55566f]"
    default:
      return "border-[#d9b277] bg-[#fff1d6] text-[#85551a]"
  }
}

function scoreColor(score: number | null) {
  if (score === null) return "text-[#77766e]"
  if (score >= 0.75) return "text-[#a5542f]"
  if (score >= 0.5) return "text-[#8c671e]"
  return "text-[#5c7666]"
}

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "Not recorded"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return value.toLocaleString()
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.slice(0, 3).map(String).join(", ")
  return JSON.stringify(value)
}

function observationRows(candidate: DiscoveryCandidate) {
  const observations = candidate.structure_observations
  if (!observations || typeof observations !== "object") return []
  return Object.entries(observations).slice(0, 3)
}

function RunStatus({ status }: { status: string }) {
  const isRunning = status === "RUNNING"
  return (
    <Badge
      data-testid="status-run-status"
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusTone(status)}`}
    >
      {isRunning ? <Activity className="h-3 w-3 animate-pulse" /> : status === "COMPLETE" ? <Check className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
      {titleCase(status)}
    </Badge>
  )
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string
  value: string
  note?: string
  icon: React.ReactNode
}) {
  return (
    <div className="min-w-0 border-l border-[#d7d5ca] pl-4 first:border-l-0 first:pl-0">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#77766e]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-mono text-[1.3rem] font-bold tracking-[-0.04em] text-[#183532]" data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}>
        {value}
      </div>
      {note && <div className="mt-1 text-xs text-[#77766e]">{note}</div>}
    </div>
  )
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#e3e0d6] ${className}`} aria-hidden="true" />
}

function CandidateCard({
  candidate,
  opportunityOptions,
  activeAction,
  onAction,
  duplicateOpportunityId,
  onDuplicateOpportunityChange,
}: {
  candidate: DiscoveryCandidate
  opportunityOptions: Array<{ id: number; name: string }>
  activeAction: { id: number; kind: ActionKind } | null
  onAction: (candidate: DiscoveryCandidate, kind: ActionKind) => void
  duplicateOpportunityId: string
  onDuplicateOpportunityChange: (candidateId: number, value: string) => void
}) {
  const rows = observationRows(candidate)
  const isBusy = activeAction?.id === candidate.id
  const score = candidate.latest_priority_score

  return (
    <Card data-testid={`card-candidate-${candidate.id}`} className="group overflow-hidden rounded-[1.15rem] border-[#d7d5ca] bg-[#fbfaf5] shadow-[0_10px_30px_rgba(40,54,40,0.04)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#b8bca8]">
      <CardHeader className="gap-4 border-b border-[#e3e0d6] p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#a5542f]">Candidate {candidate.id}</span>
              <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${candidateTone(candidate.status)}`}>
                {titleCase(candidate.status)}
              </Badge>
            </div>
            <h3 className="truncate text-base font-bold tracking-[-0.02em] text-[#183532]" title={candidate.category}>
              {candidate.category || "Uncategorized signal"}
            </h3>
            <p className="mt-1 truncate font-mono text-[11px] text-[#77766e]" title={candidate.discovery_key}>
              {candidate.discovery_key}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className={`font-mono text-2xl font-bold tracking-[-0.07em] ${scoreColor(score)}`} data-testid={`text-score-${candidate.id}`}>
              {score === null ? "—" : score.toFixed(2)}
            </div>
            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8d8b81]">priority heuristic</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#e9e8df] px-2 py-1 text-[10px] font-semibold text-[#5c665c]">{candidate.source_platform}</span>
          {candidate.anomaly_tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#f5e7d8] px-2 py-1 text-[10px] font-semibold text-[#8b5837]">
              {titleCase(tag)}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-3 border-b border-[#e3e0d6] pb-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8d8b81]">Observed</div>
            <div className="mt-1 font-mono text-sm font-bold text-[#394d44]">{candidate.occurrence_count}×</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8d8b81]">Last seen</div>
            <div className="mt-1 truncate text-xs font-semibold text-[#394d44]">{shortDate(candidate.last_seen_at)}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8d8b81]">Snapshots</div>
            <div className="mt-1 font-mono text-sm font-bold text-[#394d44]">{candidate.source_snapshot_ids.length}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#deddd3] bg-[#f3f1e9] p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#6e756c]">
            <ShieldAlert className="h-3.5 w-3.5 text-[#a5542f]" />
            Structure, not demand
          </div>
          {rows.length > 0 ? (
            <div className="space-y-1.5">
              {rows.map(([key, value]) => (
                <div className="flex items-baseline justify-between gap-3 text-xs" key={key}>
                  <span className="truncate text-[#77766e]">{titleCase(key)}</span>
                  <span className="truncate text-right font-semibold text-[#394d44]">{displayValue(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-[#77766e]">No structural observation was recorded for this candidate.</p>
          )}
        </div>

        {candidate.status === "NEW" ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              data-testid={`button-accept-candidate-${candidate.id}`}
              size="sm"
              className="h-8 rounded-lg bg-[#1e594c] px-3 text-xs text-[#f4f1e7] hover:bg-[#17493f]"
              disabled={isBusy}
              onClick={() => onAction(candidate, "accept")}
            >
              {isBusy && activeAction?.kind === "accept" ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Target className="mr-1.5 h-3.5 w-3.5" />}
              Accept for research
            </Button>
            <Button
              data-testid={`button-dismiss-candidate-${candidate.id}`}
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg px-2.5 text-xs text-[#77766e] hover:bg-[#eeeae0] hover:text-[#5e5c53]"
              disabled={isBusy}
              onClick={() => onAction(candidate, "dismiss")}
            >
              {isBusy && activeAction?.kind === "dismiss" ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1.5 h-3.5 w-3.5" />}
              Dismiss
            </Button>
            <Button
              data-testid={`button-suppress-candidate-${candidate.id}`}
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg px-2.5 text-xs text-[#8e3b31] hover:bg-[#f7e7e3]"
              disabled={isBusy}
              onClick={() => onAction(candidate, "suppress")}
            >
              {isBusy && activeAction?.kind === "suppress" ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
              Suppress
            </Button>
          </div>
        ) : candidate.status === "ACCEPTED" && candidate.created_opportunity_id ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#e6f0e9] px-3 py-2 text-xs font-semibold text-[#285b43]">
            <Check className="h-3.5 w-3.5" />
            Linked to opportunity {candidate.created_opportunity_id}
          </div>
        ) : null}

        {(candidate.status === "NEW" || candidate.status === "DUPLICATE") && opportunityOptions.length > 0 && (
          <div className="flex items-center gap-2 border-t border-[#e3e0d6] pt-3">
            <Select
              data-testid={`select-duplicate-opportunity-${candidate.id}`}
              value={duplicateOpportunityId}
              onChange={(event) => onDuplicateOpportunityChange(candidate.id, event.target.value)}
              className="h-8 min-w-0 flex-1 rounded-lg bg-[#f3f1e9] text-xs"
              aria-label={`Opportunity to mark candidate ${candidate.id} as duplicate of`}
            >
              <option value="">Mark as duplicate of…</option>
              {opportunityOptions.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </option>
              ))}
            </Select>
            <Button
              data-testid={`button-duplicate-candidate-${candidate.id}`}
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border-[#c9c5b9] bg-transparent px-2.5 text-xs text-[#5c5b53] hover:bg-[#ebe8df]"
              disabled={!duplicateOpportunityId || isBusy}
              onClick={() => onAction(candidate, "duplicate")}
            >
              {isBusy && activeAction?.kind === "duplicate" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              <span className="sr-only">Mark duplicate</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Discovery() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("NEW")
  const [search, setSearch] = useState("")
  const [activeAction, setActiveAction] = useState<{ id: number; kind: ActionKind } | null>(null)
  const [duplicateOpportunityIds, setDuplicateOpportunityIds] = useState<Record<number, string>>({})

  const runsQuery = useListDiscoveryRuns()
  const runs = runsQuery.data ?? []
  const sortedRuns = useMemo(() => [...runs].sort((a, b) => b.id - a.id), [runs])

  useEffect(() => {
    if (selectedRunId === null && sortedRuns[0]) setSelectedRunId(sortedRuns[0].id)
  }, [selectedRunId, sortedRuns])

  const selectedRunFromList = sortedRuns.find((run) => run.id === selectedRunId)
  const statusQuery = useGetDiscoveryRunStatus(selectedRunId ?? 0, {
    query: {
      enabled: selectedRunId !== null,
      queryKey: getGetDiscoveryRunStatusQueryKey(selectedRunId ?? 0),
      refetchInterval: selectedRunFromList?.status === "RUNNING" ? 2500 : false,
    },
  })
  const activeRun = statusQuery.data ?? selectedRunFromList

  useEffect(() => {
    if (statusQuery.data && statusQuery.data.status !== "RUNNING") {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: getListDiscoveryRunsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListDiscoveryCandidatesQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() }),
      ])
    }
  }, [queryClient, statusQuery.data?.status])

  const candidateParams = useMemo(
    () => (queueFilter === "ALL" ? undefined : { status: queueFilter as typeof DiscoveryCandidateStatus[keyof typeof DiscoveryCandidateStatus] }),
    [queueFilter],
  )
  const candidatesQuery = useListDiscoveryCandidates(candidateParams)
  const opportunitiesQuery = useListOpportunities()
  const candidates = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return (candidatesQuery.data ?? []).filter((candidate) => {
      if (!normalized) return true
      return [candidate.category, candidate.discovery_key, candidate.cluster_key, candidate.source_platform]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    })
  }, [candidatesQuery.data, search])

  const startRun = useStartDiscoveryRun()
  const acceptCandidate = useAcceptDiscoveryCandidate()
  const dismissCandidate = useDismissDiscoveryCandidate()
  const suppressCandidate = useSuppressDiscoveryCandidate()
  const duplicateCandidate = useMarkDiscoveryCandidateDuplicate()

  const invalidateDiscovery = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListDiscoveryRunsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListDiscoveryCandidatesQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() }),
      selectedRunId ? queryClient.invalidateQueries({ queryKey: getGetDiscoveryRunStatusQueryKey(selectedRunId) }) : Promise.resolve(),
    ])
  }

  const handleStartRun = () => {
    startRun.mutate(undefined, {
      onSuccess: (run) => {
        setSelectedRunId(run.id)
        void invalidateDiscovery()
        toast({ title: "Discovery scan started", description: "The catalog is being scanned twice for exact membership convergence." })
      },
      onError: () => toast({ title: "Could not start discovery", description: "The run did not start. Check the API server and retry.", variant: "destructive" }),
    })
  }

  const handleCandidateAction = (candidate: DiscoveryCandidate, kind: ActionKind) => {
    setActiveAction({ id: candidate.id, kind })
    const onSuccess = () => {
      setActiveAction(null)
      void invalidateDiscovery()
      const labels: Record<ActionKind, string> = {
        accept: "Candidate accepted for research",
        dismiss: "Candidate dismissed",
        suppress: "Candidate suppressed",
        duplicate: "Candidate marked as a duplicate",
      }
      toast({ title: labels[kind], description: "The review queue has been updated." })
    }
    const onError = () => {
      setActiveAction(null)
      toast({ title: "Action could not be completed", description: "No review state was changed. Try again.", variant: "destructive" })
    }

    if (kind === "accept") acceptCandidate.mutate({ candidateId: candidate.id }, { onSuccess, onError })
    if (kind === "dismiss") dismissCandidate.mutate({ candidateId: candidate.id }, { onSuccess, onError })
    if (kind === "suppress") suppressCandidate.mutate({ candidateId: candidate.id }, { onSuccess, onError })
    if (kind === "duplicate") {
      const opportunityId = Number(duplicateOpportunityIds[candidate.id])
      if (!opportunityId) {
        setActiveAction(null)
        return
      }
      duplicateCandidate.mutate({ candidateId: candidate.id, data: { opportunity_id: opportunityId } }, { onSuccess, onError })
    }
  }

  const coveragePercent = activeRun?.expected_pages
    ? Math.min(100, Math.round((activeRun.pages_fetched / activeRun.expected_pages) * 100))
    : activeRun?.coverage_status === "COMPLETE"
      ? 100
      : 0
  const opportunityOptions = (opportunitiesQuery.data ?? []).map((opportunity) => ({ id: opportunity.id, name: opportunity.name }))

  return (
    <main className="min-h-[100dvh] bg-[#f3f1e9] text-[#183532]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(#a6a99a 0.7px, transparent 0.7px)", backgroundSize: "17px 17px" }} />
      <div className="relative mx-auto max-w-[1540px] px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        <header className="mb-7 flex flex-col justify-between gap-5 border-b border-[#d7d5ca] pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a5542f]">
              <span className="h-2 w-2 rounded-full bg-[#a5542f]" />
              Money Scout / Research desk
            </div>
            <h1 className="max-w-3xl text-[2.35rem] font-bold leading-[0.98] tracking-[-0.065em] text-[#183532] sm:text-[3.7rem]">
              Find the seams before
              <span className="block text-[#a5542f]">the story.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#68736a] sm:text-[15px]">
              Review catalog-derived anomalies as signals about structure and supply. Usage telemetry can rank a lead; it cannot stand in for revenue, willingness to pay, or validated demand.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-[#d7d5ca] bg-[#e9e8df] px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#70746b]">
                <Database className="h-3.5 w-3.5 text-[#5f796b]" />
                Source boundary
              </div>
              <div className="mt-1 text-xs font-semibold text-[#3e564b]">Catalog telemetry only</div>
            </div>
            <Button
              data-testid="button-run-discovery"
              className="h-12 rounded-xl bg-[#1e594c] px-5 text-sm font-bold text-[#f5f0e7] shadow-[0_8px_20px_rgba(30,89,76,0.14)] hover:bg-[#17493f]"
              onClick={handleStartRun}
              disabled={startRun.isPending}
            >
              {startRun.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              {startRun.isPending ? "Starting run" : "Run discovery"}
            </Button>
          </div>
        </header>

        <section className="mb-7 grid grid-cols-2 gap-4 rounded-[1.2rem] border border-[#d7d5ca] bg-[#fbfaf5] p-4 shadow-[0_12px_35px_rgba(40,54,40,0.035)] sm:grid-cols-4 sm:p-5">
          <Metric icon={<ShieldAlert className="h-3.5 w-3.5 text-[#a5542f]" />} label="Verification" value={activeRun ? `${coveragePercent}%` : "—"} note={activeRun ? `${titleCase(activeRun.verification_status)} · pass ${activeRun.current_pass ?? "—"} / 2` : "Awaiting scan"} />
          <Metric icon={<Fingerprint className="h-3.5 w-3.5 text-[#5f796b]" />} label="Canonical actors" value={activeRun ? activeRun.unique_actor_count.toLocaleString() : "—"} note={activeRun ? `${activeRun.duplicate_actor_count} duplicate records` : "No scan yet"} />
          <Metric icon={<Layers3 className="h-3.5 w-3.5 text-[#8c671e]" />} label="Clusters" value={activeRun ? activeRun.cluster_count.toLocaleString() : "—"} note={activeRun ? `${activeRun.candidate_count} candidate leads` : "No sample yet"} />
          <Metric icon={<Target className="h-3.5 w-3.5 text-[#a5542f]" />} label="Queue" value={candidatesQuery.isLoading ? "…" : candidates.length.toLocaleString()} note={queueFilter === "NEW" ? "Needs review" : titleCase(queueFilter)} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Card className="overflow-hidden rounded-[1.15rem] border-[#d7d5ca] bg-[#fbfaf5] shadow-none">
              <CardHeader className="border-b border-[#e3e0d6] p-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a5542f]">Run ledger</div>
                    <h2 className="mt-1 text-lg font-bold tracking-[-0.035em] text-[#183532]">Catalog scan history</h2>
                  </div>
                  <RefreshCw className={`h-4 w-4 text-[#a8a79d] ${runsQuery.isFetching ? "animate-spin" : ""}`} />
                </div>
              </CardHeader>
              <CardContent className="p-2">
                {runsQuery.isLoading ? (
                  <div className="space-y-2 p-3">
                    <SkeletonBlock className="h-16" />
                    <SkeletonBlock className="h-16" />
                    <SkeletonBlock className="h-16" />
                  </div>
                ) : runsQuery.isError ? (
                  <div className="p-4 text-sm text-[#8e3b31]">
                    <AlertCircle className="mb-2 h-4 w-4" />
                    Could not load run history.
                  </div>
                ) : sortedRuns.length === 0 ? (
                  <div className="p-5 text-sm leading-relaxed text-[#77766e]">
                    No discovery runs yet. Start a bounded catalog scan to create the first review queue.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sortedRuns.map((run) => (
                      <button
                        type="button"
                        key={run.id}
                        data-testid={`button-select-run-${run.id}`}
                        onClick={() => setSelectedRunId(run.id)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${selectedRunId === run.id ? "bg-[#e7eee8]" : "hover:bg-[#f1efe7]"}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#3e564b]">RUN-{String(run.id).padStart(4, "0")}</span>
                          <ChevronRight className={`h-3.5 w-3.5 ${selectedRunId === run.id ? "text-[#a5542f]" : "text-[#b4b2a8]"}`} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-[#77766e]">{shortDate(run.started_at)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${statusTone(run.status)}`}>{run.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {activeRun && (
              <Card data-testid={`card-run-detail-${activeRun.id}`} className="rounded-[1.15rem] border-[#c9c5b9] bg-[#183532] text-[#f3f1e9] shadow-[0_14px_40px_rgba(24,53,50,0.12)]">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#aab9a9]">Selected run</div>
                      <div className="mt-1 font-mono text-xl font-bold tracking-[-0.05em]">RUN-{String(activeRun.id).padStart(4, "0")}</div>
                    </div>
                    <RunStatus status={activeRun.status} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.13em] text-[#aab9a9]">
                      <span>Pass verification</span>
                      <span className="font-mono text-[#f1d4a7]">{coveragePercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#365750]">
                      <div className="h-full rounded-full bg-[#c77b4c] transition-[width] duration-500" style={{ width: `${coveragePercent}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 border-t border-[#365750] pt-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.13em] text-[#8fa49a]">Pass pages</div>
                      <div className="mt-1 font-mono text-sm font-bold">{activeRun.pages_fetched} / {activeRun.expected_pages ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.13em] text-[#8fa49a]">Pass</div>
                      <div className="mt-1 font-mono text-sm font-bold">{activeRun.current_pass ?? "—"} / 2</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.13em] text-[#8fa49a]">Network attempts</div>
                      <div className="mt-1 font-mono text-sm font-bold">{activeRun.network_attempt_count}</div>
                      <div className="mt-1 text-[10px] text-[#c7d2c5]">{activeRun.request_count} page requests</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.13em] text-[#8fa49a]">Pacing</div>
                      <div className="mt-1 font-mono text-sm font-bold">{activeRun.pacing_ms}ms</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.13em] text-[#8fa49a]">Formula</div>
                      <div className="mt-1 truncate font-mono text-sm font-bold" title={activeRun.formula_version}>{activeRun.formula_version}</div>
                    </div>
                  </div>
                  {activeRun.status === "RUNNING" && (
                    <div className="flex items-center gap-2 text-xs text-[#c7d2c5]">
                      <Clock3 className="h-3.5 w-3.5 text-[#f1d4a7]" />
                      Heartbeat {shortDate(activeRun.last_heartbeat_at)}
                    </div>
                  )}
                  {activeRun.error && (
                    <div className="rounded-lg border border-[#86534b] bg-[#4a302e] p-3 text-xs leading-relaxed text-[#f0c7bf]">
                      {activeRun.error}
                    </div>
                  )}
                  {(activeRun.pass1_only_count > 0 || activeRun.pass2_only_count > 0) && (
                    <div className="rounded-lg border border-[#86534b] bg-[#4a302e] p-3 text-xs leading-relaxed text-[#f0c7bf]">
                      Membership changed between passes: {activeRun.pass1_only_count} removed, {activeRun.pass2_only_count} added. No scored results were published.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a5542f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Candidate review queue
                </div>
                <h2 className="text-2xl font-bold tracking-[-0.05em] text-[#183532]">Structural leads worth a closer look</h2>
                <p className="mt-1 text-sm text-[#77766e]">Ranked by usage heuristics. Nothing here is a demand verdict.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#99988e]" />
                  <Input
                    data-testid="input-search-candidates"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Find a cluster…"
                    className="h-9 rounded-lg border-[#d2d0c5] bg-[#fbfaf5] pl-9 text-xs"
                  />
                </div>
                <div className="relative w-40">
                  <Filter className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#99988e]" />
                  <Select
                    data-testid="select-candidate-filter"
                    value={queueFilter}
                    onChange={(event) => setQueueFilter(event.target.value as QueueFilter)}
                    className="h-9 rounded-lg border-[#d2d0c5] bg-[#fbfaf5] pl-9 text-xs"
                    aria-label="Filter candidate queue"
                  >
                    {queueFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                  </Select>
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[#deddd3] bg-[#e9e8df] px-4 py-3 text-xs text-[#68736a]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#a5542f]" />
              <span><strong className="font-bold text-[#3e564b]">Evidence boundary:</strong> high usage means repeated access or concentration in the catalog, not paid demand.</span>
            </div>

            {candidatesQuery.isLoading ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <SkeletonBlock className="h-[390px] rounded-[1.15rem]" />
                <SkeletonBlock className="h-[390px] rounded-[1.15rem]" />
              </div>
            ) : candidatesQuery.isError ? (
              <Card className="rounded-[1.15rem] border-[#d7a9a2] bg-[#f7e7e3] shadow-none">
                <CardContent className="flex flex-col items-start p-7">
                  <AlertCircle className="mb-3 h-5 w-5 text-[#8e3b31]" />
                  <h3 className="font-bold text-[#6f3029]">Candidate queue unavailable</h3>
                  <p className="mt-1 max-w-md text-sm text-[#8e3b31]">The catalog signals could not be loaded. Retry the page when the discovery service is available.</p>
                  <Button
                    data-testid="button-retry-candidates"
                    variant="outline"
                    className="mt-5 border-[#c98f83] bg-transparent text-[#6f3029] hover:bg-[#f1d8d3]"
                    onClick={() => void candidatesQuery.refetch()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Retry queue
                  </Button>
                </CardContent>
              </Card>
            ) : candidates.length === 0 ? (
              <Card className="rounded-[1.15rem] border-dashed border-[#c9c5b9] bg-[#fbfaf5] shadow-none">
                <CardContent className="flex min-h-[330px] flex-col items-center justify-center p-8 text-center">
                  {search ? <Search className="mb-4 h-8 w-8 text-[#9a9a8f]" /> : queueFilter === "NEW" ? <Pause className="mb-4 h-8 w-8 text-[#9a9a8f]" /> : <Minus className="mb-4 h-8 w-8 text-[#9a9a8f]" />}
                  <h3 className="font-bold tracking-[-0.02em] text-[#394d44]">{search ? "No matching candidates" : queueFilter === "NEW" ? "The review desk is clear" : "Nothing in this view yet"}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#77766e]">
                    {search ? "Try a different category, platform, or discovery key." : queueFilter === "NEW" ? "Run discovery to bring fresh structural signals into the queue." : "Change the filter to inspect another candidate state."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    opportunityOptions={opportunityOptions}
                    activeAction={activeAction}
                    onAction={handleCandidateAction}
                    duplicateOpportunityId={duplicateOpportunityIds[candidate.id] ?? ""}
                    onDuplicateOpportunityChange={(candidateId, value) => setDuplicateOpportunityIds((current) => ({ ...current, [candidateId]: value }))}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}