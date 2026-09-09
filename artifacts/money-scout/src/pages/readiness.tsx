import { useEffect, useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, CircleX, Database, RefreshCw, Server, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CheckStatus = "READY" | "ATTENTION" | "BLOCKED"
type ProviderReadiness = "READY" | "UNVERIFIED" | "UNAVAILABLE"

type ReadinessResponse = {
  state: CheckStatus
  infrastructure_safe: boolean
  ai_provider_ready: boolean
  provider_readiness: ProviderReadiness
  live_research_ready: boolean
  paid_research_safe: boolean
  checked_at: string
  blockers: string[]
  warnings: string[]
  checks: {
    api: { status: CheckStatus; started_at: string }
    database: { status: CheckStatus; reachable: boolean; latency_ms: number | null; error: string | null }
    anthropic: {
      status: CheckStatus
      source: "DIRECT" | "REPLIT_MANAGED" | "UNAVAILABLE"
      configured: boolean
      connectivity_verified: boolean
      billable_call_performed: boolean
      readiness: ProviderReadiness
    }
    runtime: {
      status: CheckStatus
      freshness: "MATCH" | "STALE" | "UNKNOWN"
      commit: string | null
      expected_commit: string | null
    }
  }
}

const statusIcon = (status: CheckStatus) => {
  if (status === "READY") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  if (status === "ATTENTION") return <AlertTriangle className="h-5 w-5 text-amber-600" />
  return <CircleX className="h-5 w-5 text-destructive" />
}

const statusClass = (status: CheckStatus) =>
  status === "READY"
    ? "border-emerald-200 bg-emerald-50"
    : status === "ATTENTION"
      ? "border-amber-200 bg-amber-50"
      : "border-destructive/30 bg-destructive/5"

const booleanStatus = (value: boolean): CheckStatus => value ? "READY" : "BLOCKED"
const shortSha = (sha: string | null) => sha ? sha.slice(0, 10) : "Unavailable"

export default function Readiness() {
  const [data, setData] = useState<ReadinessResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/health/readiness", { credentials: "include" })
      if (!response.ok) throw new Error(`Readiness check returned ${response.status}`)
      setData(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load readiness status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const checks = data ? [
    {
      key: "api",
      label: "API Server",
      icon: Server,
      status: data.checks.api.status,
      detail: `Started ${new Date(data.checks.api.started_at).toLocaleString()}`,
    },
    {
      key: "database",
      label: "Database",
      icon: Database,
      status: data.checks.database.status,
      detail: data.checks.database.reachable
        ? `Reachable${data.checks.database.latency_ms !== null ? ` in ${data.checks.database.latency_ms} ms` : ""}`
        : data.checks.database.error || "Database is not reachable",
    },
    {
      key: "anthropic",
      label: "Anthropic Provider",
      icon: Sparkles,
      status: data.checks.anthropic.status,
      detail: data.checks.anthropic.source === "DIRECT"
        ? "Direct Anthropic credentials configured; connectivity and balance unverified"
        : data.checks.anthropic.source === "REPLIT_MANAGED"
          ? "Replit-managed credentials present; provider approval not verified"
          : "No provider configured",
    },
    {
      key: "runtime",
      label: "Runtime Freshness",
      icon: Activity,
      status: data.checks.runtime.status,
      detail: data.checks.runtime.freshness === "MATCH"
        ? `Running ${shortSha(data.checks.runtime.commit)} matches expected build`
        : data.checks.runtime.freshness === "STALE"
          ? `Running ${shortSha(data.checks.runtime.commit)} does not match expected ${shortSha(data.checks.runtime.expected_commit)}`
          : `Running ${shortSha(data.checks.runtime.commit)}; freshness cannot be verified`,
    },
  ] : []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Readiness</h1>
          <p className="text-muted-foreground mt-1">Zero-cost preflight checks before Money Scout is allowed to spend on live research.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : loading && !data ? (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground animate-pulse">Running zero-cost readiness checks...</CardContent></Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={statusClass(booleanStatus(data.infrastructure_safe))}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Infrastructure Safe</div>
                    <div className="mt-1 text-lg font-semibold">{data.infrastructure_safe ? "Yes" : "No"}</div>
                    <p className="mt-1 text-xs text-muted-foreground">API, database, and runtime safety conditions.</p>
                  </div>
                  {statusIcon(booleanStatus(data.infrastructure_safe))}
                </div>
              </CardContent>
            </Card>

            <Card className={statusClass(data.provider_readiness === "READY" ? "READY" : data.provider_readiness === "UNVERIFIED" ? "ATTENTION" : "BLOCKED")}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Provider Ready</div>
                    <div className="mt-1 text-lg font-semibold">
                      {data.provider_readiness === "READY" ? "Yes" : data.provider_readiness === "UNVERIFIED" ? "Unverified" : "No"}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Credential path is configured for a live attempt.</p>
                  </div>
                  {statusIcon(data.provider_readiness === "READY" ? "READY" : data.provider_readiness === "UNVERIFIED" ? "ATTENTION" : "BLOCKED")}
                </div>
              </CardContent>
            </Card>

            <Card className={statusClass(booleanStatus(data.live_research_ready))}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Live Research Ready</div>
                    <div className="mt-1 text-lg font-semibold">{data.live_research_ready ? "Yes" : "No"}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Both infrastructure and provider preflight must pass.</p>
                  </div>
                  {statusIcon(booleanStatus(data.live_research_ready))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className={statusClass(data.state)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {statusIcon(data.state)}
                {data.live_research_ready ? "Live research preflight passed" : "Live research is not ready"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Overall status: <span className="font-semibold">{data.state}</span>. This screen performs no Anthropic request and does not spend API credits.
              </p>
              {data.blockers.map((blocker) => <p key={blocker} className="text-destructive">Blocker: {blocker}</p>)}
              {data.warnings.map((warning) => <p key={warning} className="text-amber-800">Warning: {warning}</p>)}
              <p className="text-xs text-muted-foreground">Checked {new Date(data.checked_at).toLocaleString()}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checks.map((check) => {
              const Icon = check.icon
              return (
                <Card key={check.key} className={statusClass(check.status)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-background/70 p-2 border">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{check.label}</div>
                          <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
                        </div>
                      </div>
                      {statusIcon(check.status)}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">What this does not verify</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>Anthropic connectivity and account balance are intentionally not tested here because doing so requires an external API request.</p>
              <p>A direct Anthropic credential can pass zero-cost provider preflight while connectivity remains unverified. The first intentional funded connectivity test is the final proof that provider billing and model access are live.</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
