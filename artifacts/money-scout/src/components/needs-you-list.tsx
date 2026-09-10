import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import { AlertCircle, CheckCircle2, Clock3, DollarSign, ExternalLink, KeyRound, RefreshCw, Rocket, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type HumanAction = {
  id: number
  opportunityId: number
  status: "OPEN" | "VERIFYING" | "RESOLVED" | "CANCELLED"
  urgency: "CRITICAL" | "HIGH" | "NORMAL" | "LOW"
  actionType: string
  title: string
  whyNeeded: string
  instructions: string
  blockedStage: string
  requiredCapabilityKey: string | null
  requiredCapabilityProvider: string | null
  verificationMode: "AUTOMATED_CHECK" | "HUMAN_ATTESTATION" | "EXTERNAL_CALLBACK"
  resumeAction: string
  createdAt: string
}

type HumanActionsResponse = { actions: HumanAction[] }

type ReleaseControlInput = {
  action: HumanAction
  ceilingCents?: number
}

const urgencyRank: Record<HumanAction["urgency"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
}

function urgencyClass(urgency: HumanAction["urgency"]) {
  if (urgency === "CRITICAL") return "border-red-300 bg-red-50 text-red-950"
  if (urgency === "HIGH") return "border-orange-300 bg-orange-50 text-orange-950"
  if (urgency === "NORMAL") return "border-blue-200 bg-blue-50 text-blue-950"
  return "border-border bg-muted/40 text-foreground"
}

function humanTime(action: HumanAction): string {
  const text = `${action.actionType} ${action.title}`.toLowerCase()
  if (text.includes("authorize_public_release") || text.includes("authorize_release_spend")) return "~1 min"
  if (text.includes("kyc") || text.includes("identity") || text.includes("verification")) return "~5–10 min"
  if (text.includes("account") || text.includes("connect") || text.includes("access")) return "~3–5 min"
  if (text.includes("domain") || text.includes("purchase")) return "~2–3 min"
  if (text.includes("review") || text.includes("decision")) return "~5–10 min"
  return "~2–5 min"
}

function releaseJobId(action: HumanAction): number | null {
  const match = action.blockedStage.match(/^CONTROLLED_RELEASE_(?:PUBLIC|SPEND):(\d+)/)
  const id = match ? Number(match[1]) : NaN
  return Number.isInteger(id) && id > 0 ? id : null
}

function afterResolutionCopy(action: HumanAction): string {
  if (action.actionType === "AUTHORIZE_PUBLIC_RELEASE") {
    return "Money Scout will resume the controlled release worker and deploy only this release publicly. Charging, domains, outbound, and ads remain unauthorized."
  }
  if (action.actionType === "AUTHORIZE_RELEASE_SPEND") {
    return "Money Scout will resume only the blocked release step within the budget ceiling you set. Other safety or authority blocks remain intact."
  }
  if (action.actionType === "RESTORE_RELEASE_PROVIDER_ACCESS") {
    return "Money Scout will detect the original provider automatically, resume polling the preserved run, and resolve this blocker without redispatching the release."
  }
  return `Money Scout will queue ${action.resumeAction.replaceAll("_", " ").toLowerCase()} and continue from the blocked workflow.`
}

export function NeedsYouList({
  opportunityId,
  limit,
  compact = false,
  showHeading = true,
}: {
  opportunityId?: number
  limit?: number
  compact?: boolean
  showHeading?: boolean
}) {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [releaseBudgetUsd, setReleaseBudgetUsd] = useState<Record<number, string>>({})
  const queryKey = opportunityId ? ["human-actions", opportunityId] : ["human-actions", "active"]
  const query = useQuery<HumanActionsResponse>({
    queryKey,
    queryFn: async () => {
      const path = opportunityId
        ? `/api/opportunities/${opportunityId}/human-actions`
        : "/api/human-actions?status=ACTIVE"
      const response = await fetch(path, { credentials: "include" })
      if (!response.ok) throw new Error(`Human actions returned ${response.status}`)
      const payload = await response.json() as HumanActionsResponse
      return opportunityId
        ? { actions: payload.actions.filter((item) => item.status === "OPEN" || item.status === "VERIFYING") }
        : payload
    },
    refetchInterval: 15_000,
  })

  const invalidateAfterAction = async (action: HumanAction) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["human-actions"] }),
      queryClient.invalidateQueries({ queryKey: ["opportunity-lifecycle", action.opportunityId] }),
    ])
  }

  const resolveMutation = useMutation({
    mutationFn: async (action: HumanAction) => {
      const body: Record<string, unknown> = {
        attested: true,
        resolution_data: {
          operator_note: notes[action.id]?.trim() || undefined,
          resolved_from: "MONEY_SCOUT_CONTROL_CENTER",
        },
      }
      if (action.requiredCapabilityKey) body.access_ready_for_money_scout = true
      const response = await fetch(`/api/human-actions/${action.id}/resolve`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>
      if (!response.ok) {
        const message = typeof payload.error === "string" ? payload.error : `Resolution returned ${response.status}`
        throw new Error(message)
      }
      return payload
    },
    onSuccess: async (_data, action) => {
      setNotes((current) => ({ ...current, [action.id]: "" }))
      await invalidateAfterAction(action)
    },
  })

  const releaseControlMutation = useMutation({
    mutationFn: async ({ action, ceilingCents }: ReleaseControlInput) => {
      const id = releaseJobId(action)
      if (!id) throw new Error("Money Scout could not identify the release job for this action.")
      const isPublicRelease = action.actionType === "AUTHORIZE_PUBLIC_RELEASE"
      const isSpend = action.actionType === "AUTHORIZE_RELEASE_SPEND"
      if (!isPublicRelease && !isSpend) throw new Error("Unsupported release authority action.")
      if (isSpend && (!Number.isInteger(ceilingCents) || (ceilingCents ?? 0) <= 0)) {
        throw new Error("Enter a release budget greater than $0.00.")
      }
      const response = await fetch(
        isPublicRelease
          ? `/api/release-jobs/${id}/authorize-public`
          : `/api/release-jobs/${id}/authorize-spend`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            attested: true,
            authorized_by: "MONEY_SCOUT_CONTROL_CENTER",
            ...(isSpend ? { ceiling_cents: ceilingCents } : {}),
          }),
        },
      )
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>
      if (!response.ok) {
        const message = typeof payload.error === "string" ? payload.error : `Release authorization returned ${response.status}`
        throw new Error(message)
      }
      return payload
    },
    onSuccess: async (_data, variables) => {
      setReleaseBudgetUsd((current) => ({ ...current, [variables.action.id]: "" }))
      await invalidateAfterAction(variables.action)
    },
  })

  const actions = useMemo(() => {
    const sorted = [...(query.data?.actions ?? [])].sort((a, b) => {
      const urgency = urgencyRank[a.urgency] - urgencyRank[b.urgency]
      if (urgency !== 0) return urgency
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted
  }, [limit, query.data?.actions])

  return (
    <div className="space-y-3">
      {showHeading && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <h2 className="text-lg font-semibold">Needs You</h2>
              {actions.length > 0 && (
                <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">{actions.length}</span>
              )}
            </div>
            {!compact && <p className="mt-1 text-sm text-muted-foreground">Only bottlenecks Money Scout cannot currently clear on its own.</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
          </Button>
        </div>
      )}

      {query.isLoading ? (
        <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground animate-pulse">Loading human bottlenecks...</div>
      ) : query.isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950">Unable to load Needs You.</div>
      ) : actions.length === 0 ? (
        <div className="flex items-center gap-3 rounded-md border bg-card p-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Nothing needs you right now. Money Scout can keep moving autonomously.
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => {
            const isPublicRelease = action.actionType === "AUTHORIZE_PUBLIC_RELEASE"
            const isReleaseSpend = action.actionType === "AUTHORIZE_RELEASE_SPEND"
            const isProviderContinuity = action.actionType === "RESTORE_RELEASE_PROVIDER_ACCESS"
            const isHumanAttestation = action.verificationMode === "HUMAN_ATTESTATION" && !isProviderContinuity
            const pending = resolveMutation.isPending && resolveMutation.variables?.id === action.id
            const releasePending = releaseControlMutation.isPending && releaseControlMutation.variables?.action.id === action.id
            const budgetValue = releaseBudgetUsd[action.id] ?? ""
            const budgetDollars = Number(budgetValue)
            const budgetCents = Number.isFinite(budgetDollars) ? Math.round(budgetDollars * 100) : 0
            return (
              <Card key={action.id} className={cn("overflow-hidden border", urgencyClass(action.urgency))}>
                <CardContent className={cn("p-4", !compact && "md:p-5")}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-current/10 px-2 py-0.5 text-[10px] font-bold tracking-wider">{action.urgency}</span>
                        <span className="text-[11px] opacity-70">{action.status === "VERIFYING" ? "Verification pending" : "Action required"}</span>
                        <span className="flex items-center gap-1 text-[11px] opacity-70">
                          <Clock3 className="h-3 w-3" /> Typical human time {humanTime(action)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        {action.requiredCapabilityKey ? <KeyRound className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                        <div>
                          <h3 className="font-semibold leading-snug">{action.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed opacity-80">{action.whyNeeded}</p>
                        </div>
                      </div>

                      {!compact && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-current/15 bg-white/50 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">What you need to do</div>
                            <p className="mt-1 text-xs leading-relaxed">{action.instructions}</p>
                          </div>
                          <div className="rounded-md border border-current/15 bg-white/50 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">After you resolve it</div>
                            <p className="mt-1 text-xs leading-relaxed">{afterResolutionCopy(action)}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-65">
                        <Link href={`/opportunities/${action.opportunityId}`} className="inline-flex items-center gap-1 font-medium hover:underline">
                          RevOpp #{action.opportunityId} <ExternalLink className="h-3 w-3" />
                        </Link>
                        <span>Blocked: {action.blockedStage.replaceAll("_", " ")}</span>
                        {action.requiredCapabilityProvider && <span>Provider: {action.requiredCapabilityProvider}</span>}
                      </div>

                      {!compact && isReleaseSpend && (
                        <label className="mt-4 block max-w-xs">
                          <span className="text-[11px] font-semibold uppercase tracking-wider opacity-65">Maximum release budget</span>
                          <div className="relative mt-1.5">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              inputMode="decimal"
                              value={budgetValue}
                              onChange={(event) => setReleaseBudgetUsd((current) => ({ ...current, [action.id]: event.target.value }))}
                              placeholder="0.00"
                              className="h-10 w-full rounded-md border border-current/20 bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <span className="mt-1 block text-[11px] opacity-65">This is a hard ceiling for this release job, not permission to spend it all.</span>
                        </label>
                      )}

                      {!compact && isHumanAttestation && !isPublicRelease && !isReleaseSpend && (
                        <label className="mt-4 block">
                          <span className="text-[11px] font-semibold uppercase tracking-wider opacity-65">Tell Money Scout anything it should know</span>
                          <textarea
                            value={notes[action.id] ?? ""}
                            onChange={(event) => setNotes((current) => ({ ...current, [action.id]: event.target.value }))}
                            placeholder="Optional note, account name, rejection detail, decision context, or anything relevant to resuming the workflow. Do not paste passwords or raw secrets."
                            className="mt-1.5 min-h-20 w-full resize-y rounded-md border border-current/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-52">
                      {isPublicRelease ? (
                        <Button
                          onClick={() => {
                            const message = "Authorize this specific QA-passed build to become publicly reachable? This does not authorize charging customers, buying a domain, outbound messaging, or advertising."
                            if (window.confirm(message)) releaseControlMutation.mutate({ action })
                          }}
                          disabled={releasePending}
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          {releasePending ? "Authorizing..." : "Authorize public release"}
                        </Button>
                      ) : isReleaseSpend ? (
                        <Button
                          onClick={() => {
                            if (budgetCents <= 0) return
                            const message = `Set a hard release-spend ceiling of $${(budgetCents / 100).toFixed(2)} for this release only? Money Scout will still prefer the cheapest viable path.`
                            if (window.confirm(message)) releaseControlMutation.mutate({ action, ceilingCents: budgetCents })
                          }}
                          disabled={releasePending || budgetCents <= 0}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          {releasePending ? "Authorizing..." : "Set release budget"}
                        </Button>
                      ) : isHumanAttestation ? (
                        <Button
                          onClick={() => {
                            const message = action.requiredCapabilityKey
                              ? "Confirm only if Money Scout now has usable authorized access, not merely that the account exists. Continue?"
                              : "Confirm that you completed this action? Money Scout will automatically queue the next workflow step."
                            if (window.confirm(message)) resolveMutation.mutate(action)
                          }}
                          disabled={pending}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          {pending
                            ? "Saving..."
                            : action.requiredCapabilityKey
                              ? "Connected & ready"
                              : "I completed this"}
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          <Clock3 className="mr-2 h-4 w-4" />
                          Awaiting verification
                        </Button>
                      )}
                      {resolveMutation.isError && resolveMutation.variables?.id === action.id && (
                        <p className="text-xs leading-relaxed text-red-700">{resolveMutation.error instanceof Error ? resolveMutation.error.message : "Unable to resolve action."}</p>
                      )}
                      {releaseControlMutation.isError && releaseControlMutation.variables?.action.id === action.id && (
                        <p className="text-xs leading-relaxed text-red-700">{releaseControlMutation.error instanceof Error ? releaseControlMutation.error.message : "Unable to authorize release action."}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
