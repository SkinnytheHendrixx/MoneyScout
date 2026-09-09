import { useEffect, useMemo, useState } from "react"
import { Activity, CircleDollarSign, RefreshCw, FlaskConical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TimelineItem = {
  id: string
  stage: string
  status: string
  summary: string
  occurred_at: string | null
  external_cost_usd: number
}

type TimelineResponse = {
  current_verdict: string
  policy_status: string
  total_external_cost_usd: number
  record_mode: "LIVE" | "PILOT" | "SIMULATION" | "TEST"
  portfolio_eligible: boolean
  record_warning: string | null
  items: TimelineItem[]
}

type ResearchPlan = {
  phase: string
  nextAction: string
  stopReason: string | null
  remainingExternalBudgetUsd?: number
}

const nice = (value: string) => value.replaceAll("_", " ")
const money = (value: number) => `$${value.toFixed(4)}`

export function RunTimeline({ opportunityId }: { opportunityId: number }) {
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null)
  const [plan, setPlan] = useState<ResearchPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [timelineResponse, planResponse] = await Promise.all([
        fetch(`/api/opportunities/${opportunityId}/run-timeline`, { credentials: "include" }),
        fetch(`/api/opportunities/${opportunityId}/research-plan`, { credentials: "include" }),
      ])
      if (!timelineResponse.ok) throw new Error(`Timeline returned ${timelineResponse.status}`)
      if (!planResponse.ok) throw new Error(`Research plan returned ${planResponse.status}`)
      setTimeline(await timelineResponse.json())
      setPlan(await planResponse.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load run status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [opportunityId])

  const nextAction = useMemo(() => {
    if (!plan) return "Unknown"
    return nice(plan.nextAction || plan.phase)
  }, [plan])

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Money Scout Run Timeline
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : loading && !timeline ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading run history...</p>
        ) : timeline ? (
          <>
            {!timeline.portfolio_eligible && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex gap-2">
                <FlaskConical className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{timeline.record_mode} record</div>
                  <div className="mt-1">{timeline.record_warning}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Verdict</div>
                <div className="font-semibold mt-1">{timeline.current_verdict}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Policy</div>
                <div className="font-semibold mt-1">{timeline.policy_status}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recorded spend</div>
                <div className="font-semibold mt-1 flex items-center gap-1">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  {money(timeline.total_external_cost_usd)}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next action</div>
                <div className="font-semibold mt-1">{nextAction}</div>
              </div>
            </div>

            {plan?.stopReason && (
              <div className="rounded-md bg-muted p-3 text-xs leading-relaxed">
                <span className="font-semibold">Why it stopped: </span>{plan.stopReason}
              </div>
            )}

            <div className="space-y-3">
              {timeline.items.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-sm text-center text-muted-foreground">
                  No research or validation activity yet.
                </div>
              ) : timeline.items.map((item) => (
                <div key={item.id} className="relative pl-5 border-l-2 border-muted pb-3 last:pb-0">
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-foreground" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{nice(item.stage)}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.occurred_at ? new Date(item.occurred_at).toLocaleString() : "Planned"}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                    <span className="bg-muted rounded px-1.5 py-0.5">{nice(item.status)}</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Cost {money(item.external_cost_usd)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
