import { useQuery } from "@tanstack/react-query"
import { Activity, AlertTriangle, ExternalLink, Gauge, Radio, RefreshCw, WalletCards, Wrench } from "lucide-react"

type Asset = {
  id: number
  nameSnapshot: string
  productShape: string
  targetKind: string
  productionUrl: string
  status: string
  operatingMode: string
  healthStatus: string
  economicsStatus: string
  authorities: {
    publicReleaseAuthorized: boolean
    customerChargingAuthorized: boolean
    outboundAuthorized: boolean
    advertisingAuthorized: boolean
    customDomainAuthorized: boolean
    productionCredentialsAuthorized: boolean
    externalSpendCeilingCents: number
  }
  revenueInstrumentationStatus: string
  costInstrumentationStatus: string
  usageInstrumentationStatus: string
  supportInstrumentationStatus: string
  totalObservedRevenueCents: number
  totalObservedCostCents: number
  totalObservedTransactions: number
  externalSpendUsedCents: number
  consecutiveHealthFailures: number
  lastHealthCheckAt: string | null
  nextHealthCheckAt: string | null
  lastTelemetrySyncAt: string | null
  nextTelemetrySyncAt: string | null
  lastEconomicReviewAt: string | null
  lastRemediationAt: string | null
  activatedAt: string
}

type AssetsResponse = { assets: Asset[] }

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

function statusClass(value: string) {
  if (["HEALTHY", "ACTIVE", "MEASURED_POSITIVE", "MEASURED_BREAK_EVEN"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-800"
  if (["DEGRADED", "UNHEALTHY", "BLOCKED", "INCOMPLETE", "MEASURED_NEGATIVE"].includes(value)) return "border-amber-200 bg-amber-50 text-amber-900"
  if (value === "KILLED" || value === "ARCHIVED") return "border-red-200 bg-red-50 text-red-800"
  return "border-border bg-muted text-muted-foreground"
}

function Instrumentation({ label, value }: { label: string; value: string }) {
  const text = value === "INSTRUMENTED" ? "Instrumented" : value === "CONNECTED" ? "Connected" : value === "ERROR" ? "Error" : "Not instrumented"
  const className = value === "INSTRUMENTED" ? "text-emerald-700" : value === "CONNECTED" ? "text-blue-700" : "text-amber-700"
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${className}`}>{text}</span>
    </div>
  )
}

function time(value: string | null) {
  return value ? new Date(value).toLocaleString() : "pending"
}

export default function AssetsPage() {
  const query = useQuery<AssetsResponse>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await fetch("/api/assets", { credentials: "include" })
      if (!response.ok) throw new Error(`Assets returned ${response.status}`)
      return response.json()
    },
    refetchInterval: 15_000,
  })

  const assets = query.data?.assets ?? []
  const healthy = assets.filter((asset) => asset.healthStatus === "HEALTHY").length
  const degraded = assets.filter((asset) => asset.status === "DEGRADED" || asset.healthStatus === "UNHEALTHY").length
  const measured = assets.filter((asset) => asset.economicsStatus.startsWith("MEASURED_")).length
  const observedRevenue = assets.reduce((sum, asset) => sum + asset.totalObservedRevenueCents, 0)
  const observedCost = assets.reduce((sum, asset) => sum + asset.totalObservedCostCents, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portfolio operations</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Live businesses under autonomous health, telemetry, economic measurement, and bounded maintenance. Unknown economics stay unknown until provider coverage proves the window is complete.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">Auto-refreshes every 15 seconds</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Radio className="h-4 w-4" /> Operating assets</div>
          <div className="mt-2 text-2xl font-semibold">{assets.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="h-4 w-4" /> Healthy</div>
          <div className="mt-2 text-2xl font-semibold">{healthy}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><AlertTriangle className="h-4 w-4" /> Degraded</div>
          <div className="mt-2 text-2xl font-semibold">{degraded}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4" /> Measured economics</div>
          <div className="mt-2 text-2xl font-semibold">{measured}/{assets.length}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Complete revenue + cost window</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><WalletCards className="h-4 w-4" /> Observed revenue</div>
          <div className="mt-2 text-2xl font-semibold">{money(observedRevenue)}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Cumulative attributable FACTs</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><WalletCards className="h-4 w-4" /> Observed cash cost</div>
          <div className="mt-2 text-2xl font-semibold">{money(observedCost)}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Not labeled as margin</div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">Loading operating Assets…</div>
      ) : query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Unable to load Assets right now.</div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <h2 className="font-semibold">No operating Assets yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">An Asset is created automatically only after a release is explicitly authorized, publicly deployed, and independently verified healthy.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {assets.map((asset) => {
            const revenueKnown = asset.revenueInstrumentationStatus === "INSTRUMENTED"
            const restricted = !asset.authorities.customerChargingAuthorized && !asset.authorities.outboundAuthorized && !asset.authorities.advertisingAuthorized
            return (
              <section key={asset.id} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">{asset.nameSnapshot}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(asset.status)}`}>{asset.status}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(asset.healthStatus)}`}>{asset.healthStatus}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(asset.economicsStatus)}`}>{asset.economicsStatus.replaceAll("_", " ")}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{asset.productShape} · {asset.targetKind} · {asset.operatingMode}</p>
                  </div>
                  <a href={asset.productionUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium hover:bg-muted">Live <ExternalLink className="h-3 w-3" /></a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Revenue</div>
                    <div className="mt-1 text-lg font-semibold">{revenueKnown ? money(asset.totalObservedRevenueCents) : "Unknown"}</div>
                    <div className="text-[11px] text-muted-foreground">{revenueKnown ? "Observed FACT total" : "Not instrumented"}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Known cost</div>
                    <div className="mt-1 text-lg font-semibold">{money(asset.totalObservedCostCents)}</div>
                    <div className="text-[11px] text-muted-foreground">Attributed FACT total</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ops cash used</div>
                    <div className="mt-1 text-lg font-semibold">{money(asset.externalSpendUsedCents)}</div>
                    <div className="text-[11px] text-muted-foreground">Autonomous ops external cost</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Health failures</div>
                    <div className="mt-1 text-lg font-semibold">{asset.consecutiveHealthFailures}</div>
                    <div className="text-[11px] text-muted-foreground">Consecutive probes</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="text-xs font-semibold">Instrumentation</div>
                    <Instrumentation label="Revenue" value={asset.revenueInstrumentationStatus} />
                    <Instrumentation label="Cost" value={asset.costInstrumentationStatus} />
                    <Instrumentation label="Usage" value={asset.usageInstrumentationStatus} />
                    <Instrumentation label="Support" value={asset.supportInstrumentationStatus} />
                  </div>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold"><RefreshCw className="h-3.5 w-3.5" /> Measurement</div>
                    <div className="text-xs text-muted-foreground">Last telemetry: {time(asset.lastTelemetrySyncAt)}</div>
                    <div className="text-xs text-muted-foreground">Next telemetry: {time(asset.nextTelemetrySyncAt)}</div>
                    <div className="text-xs text-muted-foreground">Economic review: {time(asset.lastEconomicReviewAt)}</div>
                    <div className="text-[11px] text-muted-foreground">Measured status requires overlapping complete provider revenue and cost windows.</div>
                  </div>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold"><Wrench className="h-3.5 w-3.5" /> Maintenance</div>
                    <div className="text-xs text-muted-foreground">Last autonomous remediation: {asset.lastRemediationAt ? time(asset.lastRemediationAt) : "none"}</div>
                    <div className="text-xs text-muted-foreground">Inherited release authority: same public surface only</div>
                    <div className="text-xs text-muted-foreground">Generic metered repair: blocked without a hard per-call ceiling</div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                    <span>Commercial authority</span>
                    <span className={restricted ? "text-amber-700" : "text-emerald-700"}>{restricted ? "Restricted" : "Expanded"}</span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                    <div>Public release: {asset.authorities.publicReleaseAuthorized ? "authorized" : "off"}</div>
                    <div>Customer charging: {asset.authorities.customerChargingAuthorized ? "authorized" : "off"}</div>
                    <div>Outbound: {asset.authorities.outboundAuthorized ? "authorized" : "off"}</div>
                    <div>Advertising: {asset.authorities.advertisingAuthorized ? "authorized" : "off"}</div>
                    <div>Custom domain: {asset.authorities.customDomainAuthorized ? "authorized" : "off"}</div>
                    <div>Production credentials: {asset.authorities.productionCredentialsAuthorized ? "authorized" : "off"}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                  <span>Activated {time(asset.activatedAt)}</span>
                  <span>Last health {time(asset.lastHealthCheckAt)}</span>
                  <span>Observed transactions {asset.totalObservedTransactions}</span>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}