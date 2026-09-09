import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, AlertTriangle, ArrowRight, Clock3, DollarSign, Eye, RefreshCw, Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LifecycleActivity = {
  key: string
  label: string
  status: string
  started_at: string | null
  expected_duration_seconds: number | null
  estimated_remaining_seconds: number | null
  estimated_completion_at: string | null
  stage_index: number | null
  stage_count: number | null
  next_action: string | null
  eta_basis: string | null
  updated_at: string
}

type LifecycleWatch = {
  reason?: string | null
  triggerDescriptions?: string[] | null
  nextCheckAt?: string | null
  status?: string | null
}

type LifecycleEvent = {
  id?: number
  eventType?: string
  summary?: string
  occurredAt?: string
}

type LifecycleResponse = {
  current_verdict: string
  current_activity: LifecycleActivity | null
  active_watch: LifecycleWatch | null
  lifecycle_events: LifecycleEvent[]
}

type EvidenceItem = {
  claim: string
  classification: string
  evaluation_dimension: string
}

type OpportunityLike = {
  verdict: string
  thesis: string
  kill_reason?: string | null
}

const ECONOMIC_DIMENSIONS = [
  "monetization_proof_price_tolerance",
  "buyer_budget_clarity",
  "unit_economics_pricing_power",
  "economic_headroom",
  "commercial_pricing",
  "commercial_buyer",
]

const RISK_DIMENSIONS = [
  "kill",
  "risk",
  "operating_maintenance_burden",
  "distribution_accessibility_acquisition_economics",
  "capital_at_risk_reversibility",
  "build_complexity_technical_uncertainty",
]

const nice = (value: string) => value.replaceAll("_", " ").toLowerCase()

function timeLabel(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1_000))
  if (seconds < 60) return `~${seconds}s remaining`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `~${minutes} min remaining`
  const hours = Math.ceil(minutes / 60)
  return `~${hours} hr remaining`
}

function statusTone(status: string | undefined) {
  if (status === "RUNNING") return "border-blue-200 bg-blue-50 text-blue-950"
  if (status === "BLOCKED") return "border-amber-300 bg-amber-50 text-amber-950"
  if (status === "COMPLETE") return "border-emerald-200 bg-emerald-50 text-emerald-950"
  return "border-border bg-muted/40 text-foreground"
}

export function RevOppGlance({
  opportunityId,
  opportunity,
  evidence,
}: {
  opportunityId: number
  opportunity: OpportunityLike
  evidence: EvidenceItem[] | undefined
}) {
  const [now, setNow] = useState(Date.now())
  const lifecycleQuery = useQuery<LifecycleResponse>({
    queryKey: ["opportunity-lifecycle", opportunityId],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities/${opportunityId}/lifecycle`, { credentials: "include" })
      if (!response.ok) throw new Error(`Lifecycle returned ${response.status}`)
      return response.json()
    },
    refetchInterval: 10_000,
  })

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const lifecycle = lifecycleQuery.data
  const activity = lifecycle?.current_activity ?? null
  const economicClaims = useMemo(() => {
    if (!evidence) return []
    return evidence
      .filter((item) => ECONOMIC_DIMENSIONS.some((needle) => item.evaluation_dimension.toLowerCase().includes(needle)))
      .filter((item) => item.classification !== "UNKNOWN")
      .map((item) => item.claim)
      .filter((claim, index, all) => all.indexOf(claim) === index)
      .slice(-2)
  }, [evidence])

  const risk = useMemo(() => {
    if (opportunity.kill_reason) return opportunity.kill_reason
    if (lifecycle?.active_watch?.reason) return lifecycle.active_watch.reason
    if (!evidence) return "No dominant risk has been isolated yet."
    const candidate = [...evidence]
      .reverse()
      .find((item) => RISK_DIMENSIONS.some((needle) => item.evaluation_dimension.toLowerCase().includes(needle)))
    return candidate?.claim ?? "No dominant risk has been isolated yet."
  }, [evidence, lifecycle?.active_watch?.reason, opportunity.kill_reason])

  const latestChange = lifecycle?.lifecycle_events?.[0]?.summary ?? "No lifecycle change has been recorded yet."
  const currentRead = activity?.label
    ?? (opportunity.verdict === "WATCH" ? lifecycle?.active_watch?.reason : null)
    ?? `Current verdict: ${opportunity.verdict}`

  const eta = useMemo(() => {
    if (!activity) return "No active timer"
    if (activity.status === "RUNNING" && activity.estimated_completion_at) {
      const remaining = new Date(activity.estimated_completion_at).getTime() - now
      return remaining > 0 ? timeLabel(remaining) : "Taking longer than estimate"
    }
    if (activity.status === "RUNNING" && activity.expected_duration_seconds) return "Working, ETA recalculating"
    if (opportunity.verdict === "WATCH" || activity.key === "WATCH_MONITORING") return "Event driven"
    if (activity.status === "BLOCKED") return "Waiting on a blocker"
    if (activity.status === "COMPLETE") return "Complete"
    return "No fixed ETA"
  }, [activity, now, opportunity.verdict])

  const progress = activity?.stage_index && activity?.stage_count
    ? Math.min(100, Math.max(0, Math.round((activity.stage_index / activity.stage_count) * 100)))
    : null

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current read</div>
                <p className="mt-2 text-lg font-semibold leading-snug">{currentRead}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{opportunity.thesis}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => void lifecycleQuery.refetch()}
                disabled={lifecycleQuery.isFetching}
                title="Refresh live status"
              >
                <RefreshCw className={cn("h-4 w-4", lifecycleQuery.isFetching && "animate-spin")} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border", statusTone(activity?.status))}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
              <Activity className="h-3.5 w-3.5" />
              Money Scout now
            </div>
            <div className="mt-2 text-base font-semibold">{activity?.label ?? "No active work"}</div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 opacity-70" />
              <span>{eta}</span>
            </div>
            {progress !== null && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-current transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 text-[11px] opacity-70">
                  Stage {activity?.stage_index} of {activity?.stage_count} · {progress}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              Key economics
            </div>
            {economicClaims.length ? (
              <div className="mt-2 space-y-1.5">
                {economicClaims.map((claim) => <p key={claim} className="text-xs leading-relaxed">{claim}</p>)}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Not established yet. Money Scout should not invent pricing or unit economics.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Biggest risk
            </div>
            <p className="mt-2 text-xs leading-relaxed">{risk}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              What changed
            </div>
            <p className="mt-2 text-xs leading-relaxed">{latestChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ArrowRight className="h-3.5 w-3.5" />
              What happens next
            </div>
            <p className="mt-2 text-xs leading-relaxed">{activity?.next_action ?? "Money Scout has not recorded a next action yet."}</p>
          </CardContent>
        </Card>
      </div>

      {lifecycleQuery.isError && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <Eye className="h-4 w-4" />
          Live lifecycle status could not be loaded. Detailed evidence remains available below.
        </div>
      )}
    </div>
  )
}
