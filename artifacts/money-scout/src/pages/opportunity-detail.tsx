import { useState } from "react"
import { useLocation, useParams, Link } from "wouter"
import { ArrowLeft, Edit, ExternalLink, Plus, Trash2, ShieldAlert } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { 
  useGetOpportunity, 
  useDeleteOpportunity, 
  getListOpportunitiesQueryKey,
  useListEvidence,
  useDeleteEvidence,
  getListEvidenceQueryKey,
  useListPolicyChecks,
  useRunPolicyCheck,
  getListPolicyChecksQueryKey,
  getGetOpportunityQueryKey
} from "@workspace/api-client-react"

import { getPolicyBadge, getVerdictBadge, getClassificationBadge } from "@/components/badges"
import { formatDate, formatDateTime } from "@/lib/format"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EvidenceDialog } from "@/components/evidence-dialog"
import { DemandChecks } from "@/components/demand-checks"
import { Select } from "@/components/ui/select"

export default function OpportunityDetail() {
  const params = useParams()
  const id = Number(params.id)
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: opportunity, isLoading: oppLoading } = useGetOpportunity(id)
  const { data: evidenceList, isLoading: evLoading } = useListEvidence(id)
  const { data: policyChecks, isLoading: policyChecksLoading } = useListPolicyChecks(id)

  const [evidenceToEdit, setEvidenceToEdit] = useState<number | null>(null)
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all")

  const deleteOppMutation = useDeleteOpportunity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() })
        toast({ title: "Opportunity deleted" })
        setLocation("/")
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" })
    }
  })

  const deleteEvMutation = useDeleteEvidence({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEvidenceQueryKey(id) })
        toast({ title: "Evidence removed" })
      },
      onError: () => toast({ title: "Failed to remove evidence", variant: "destructive" })
    }
  })

  const runPolicyCheckMutation = useRunPolicyCheck({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPolicyChecksQueryKey(id) })
        queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) })
        queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() })
        queryClient.invalidateQueries({ queryKey: getListEvidenceQueryKey(id) })
        toast({ title: "Policy check completed" })
      },
      onError: (error: any) => {
        const isConflict = error?.status === 409 || error?.response?.status === 409 || String(error).includes("409")
        toast({ 
          title: "Policy check failed", 
          description: isConflict ? "A policy check is already in progress or cannot be run right now." : "An error occurred while running the check.",
          variant: "destructive" 
        })
      }
    }
  })

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this opportunity? This cannot be undone.")) {
      deleteOppMutation.mutate({ id })
    }
  }

  const handleDeleteEvidence = (evId: number) => {
    if (window.confirm("Remove this evidence?")) {
      deleteEvMutation.mutate({ id: evId })
    }
  }

  const handleRunPolicyCheck = () => {
    runPolicyCheckMutation.mutate({ opportunityId: id })
  }

  if (oppLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading opportunity...</div>
  }

  if (!opportunity) {
    return <div className="p-8 text-center text-destructive">Opportunity not found.</div>
  }

  const openNewEvidence = () => {
    setEvidenceToEdit(null)
    setEvidenceDialogOpen(true)
  }

  const openEditEvidence = (evId: number) => {
    setEvidenceToEdit(evId)
    setEvidenceDialogOpen(true)
  }

  const showEvidence = (evId: number) => {
    setEvidenceFilter("all")
    window.setTimeout(() => {
      const element = document.getElementById(`evidence-${evId}`)
      if (!element) return
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("ring-2", "ring-indigo-500", "ring-offset-2")
      window.setTimeout(
        () => element.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2"),
        2_000,
      )
    }, 0)
  }

  const filteredEvidence = evidenceList?.filter(ev => 
    evidenceFilter === "all" ? true : ev.evaluation_dimension === evidenceFilter
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{opportunity.name}</h1>
              {getVerdictBadge(opportunity.verdict)}
              {getPolicyBadge(opportunity.policy_status)}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <span>{opportunity.source_platform}</span>
              {opportunity.source_url && (
                <>
                  <span>•</span>
                  <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
                    Source <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/opportunities/${id}/edit`} className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={deleteOppMutation.isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Investment Thesis</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{opportunity.thesis}</p>
            </CardContent>
          </Card>

          <DemandChecks opportunityId={id} onShowEvidence={showEvidence} />

          {opportunity.verdict === 'KILL' && opportunity.kill_reason && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3 border-b border-destructive/20">
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Kill Reason
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-black">
                <p className="whitespace-pre-wrap text-sm">{opportunity.kill_reason}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight">Evidence</h3>
              <div className="flex items-center gap-3">
                <Select value={evidenceFilter} onChange={(e) => setEvidenceFilter(e.target.value)} className="w-[180px] h-9 text-xs">
                  <option value="all">All Dimensions</option>
                  <option value="external_demand">External Demand</option>
                  <option value="commercial_value">Commercial Value</option>
                  <option value="repeat_usage">Repeat Usage</option>
                  <option value="agent_api_usefulness">Agent/API Usefulness</option>
                  <option value="incumbent_weakness">Incumbent Weakness</option>
                </Select>
                <Button size="sm" onClick={openNewEvidence} className="h-9">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Evidence
                </Button>
              </div>
            </div>

            {evLoading ? (
              <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">Loading evidence...</div>
            ) : filteredEvidence && filteredEvidence.length > 0 ? (
              <div className="grid gap-3">
                {filteredEvidence.map((ev) => (
                  <Card key={ev.id} id={`evidence-${ev.id}`} className="overflow-hidden scroll-mt-24">
                    <div className="p-4 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          {getClassificationBadge(ev.classification)}
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                            {ev.evaluation_dimension}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-tight">{ev.claim}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {ev.source_title}
                            {ev.source_url && (
                              <a href={ev.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                          <span>•</span>
                          <span>{formatDate(ev.observed_date)}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-3">
                        <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-start" onClick={() => openEditEvidence(ev.id)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEvidence(ev.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground border rounded-md border-dashed bg-card/50">
                <p>No evidence collected yet.</p>
                <Button variant="link" onClick={openNewEvidence} className="mt-2">Start adding evidence</Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Score</div>
                <div className="font-mono text-xl">{opportunity.overall_score}<span className="text-muted-foreground text-sm">/100</span></div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Type</div>
                <div>{opportunity.opportunity_type}</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Engine</div>
                <div>{opportunity.engine_family}</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Status</div>
                <div>{opportunity.status}</div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">First Seen</div>
                <div>{formatDateTime(opportunity.first_seen)}</div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Last Researched</div>
                <div>{formatDateTime(opportunity.last_researched)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Policy Checks</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRunPolicyCheck}
                  disabled={runPolicyCheckMutation.isPending}
                >
                  {runPolicyCheckMutation.isPending ? "Running..." : "Run Check"}
                </Button>
              </div>
              <CardDescription className="text-xs">Checks are limited to policy and access rules.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {policyChecksLoading ? (
                <div className="text-sm text-muted-foreground animate-pulse text-center py-4">Loading checks...</div>
              ) : policyChecks && policyChecks.length > 0 ? (
                <div className="space-y-4">
                  {policyChecks.map((check) => (
                    <div key={check.id} className="text-sm border-b border-dashed last:border-0 pb-4 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        {getPolicyBadge(check.status)}
                        <span className="text-xs text-muted-foreground">{formatDateTime(check.checked_at)}</span>
                      </div>
                      {check.summary && <p className="text-xs leading-relaxed text-muted-foreground">{check.summary}</p>}
                      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded font-mono">{check.retrieval_method}</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded font-mono">Evidence: {check.evidence_created}</span>
                        {check.external_cost_usd !== null && (
                          <span className="bg-muted px-1.5 py-0.5 rounded font-mono">Cost: ${check.external_cost_usd.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No policy checks run yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EvidenceDialog 
        open={evidenceDialogOpen} 
        onOpenChange={setEvidenceDialogOpen}
        opportunityId={id}
        evidenceId={evidenceToEdit}
      />
    </div>
  )
}
