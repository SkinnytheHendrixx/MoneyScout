import { useQueryClient } from "@tanstack/react-query"
import { Play } from "lucide-react"
import { 
  useListDemandChecks, 
  useRunDemandCheck, 
  getListDemandChecksQueryKey,
  getListEvidenceQueryKey
} from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getDemandBadge } from "@/components/badges"
import { formatDateTime } from "@/lib/format"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import type { DemandCheckResult } from "@workspace/api-client-react"

type DemandCheckMutationError = {
  status?: number
  response?: { status?: number }
  data?: { error?: string; message?: string }
  message?: string
}

export const isDemandCheckIntegrationUnavailable = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false
  const candidate = error as DemandCheckMutationError
  return (
    candidate.data?.error === "AI_INTEGRATION_UNAVAILABLE" ||
    candidate.message?.includes("AI_INTEGRATION_UNAVAILABLE") === true
  )
}

export const getDemandCheckErrorToast = (error: unknown) => {
  const candidate = error as DemandCheckMutationError | null
  if (isDemandCheckIntegrationUnavailable(error)) {
    return {
      title: "Demand check unavailable",
      description: candidate?.data?.message ??
        "The AI research integration is unavailable. No Demand Check was saved.",
    }
  }

  const isConflict =
    candidate?.status === 409 ||
    candidate?.response?.status === 409 ||
    String(error).includes("409")
  return {
    title: "Demand check failed",
    description: isConflict
      ? "A check is already in progress."
      : "An error occurred while running the demand check.",
  }
}

export const invalidateDemandCheckQueries = (
  queryClient: {
    invalidateQueries: (filters: { queryKey: readonly unknown[] }) => unknown
  },
  opportunityId: number,
) => {
  queryClient.invalidateQueries({ queryKey: getListDemandChecksQueryKey(opportunityId) })
  queryClient.invalidateQueries({ queryKey: getListEvidenceQueryKey(opportunityId) })
}

export function DemandChecks({
  opportunityId,
  onShowEvidence,
}: {
  opportunityId: number
  onShowEvidence: (id: number) => void
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: checks, isLoading } = useListDemandChecks(opportunityId)
  
  const runMutation = useRunDemandCheck({
    mutation: {
      onSuccess: () => {
        invalidateDemandCheckQueries(queryClient, opportunityId)
        toast({ title: "Demand check completed" })
      },
      onError: (error: any) => {
        const errorToast = getDemandCheckErrorToast(error)
        toast({ 
          title: errorToast.title,
          description: errorToast.description,
          variant: "destructive" 
        })
      }
    }
  })

  return (
    <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
      <CardHeader className="pb-3 border-b border-indigo-50 dark:border-indigo-900/30 flex flex-row items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
        <div>
          <CardTitle className="text-base text-indigo-950 dark:text-indigo-200">Demand Checks</CardTitle>
          <CardDescription className="text-xs mt-1">Phase 3: Deep analysis of buyer intent and commercial viability.</CardDescription>
        </div>
        <Button 
          size="sm" 
          onClick={() => runMutation.mutate({ opportunityId })}
          disabled={runMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
        >
          {runMutation.isPending ? "Running..." : <><Play className="w-3 h-3 mr-2 fill-current" /> Run Check</>}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-sm text-center text-muted-foreground animate-pulse">Loading demand checks...</div>
        ) : !checks || checks.length === 0 ? (
          <div className="p-6 text-sm text-center text-muted-foreground bg-muted/10">No demand checks run yet.</div>
        ) : (
          <Accordion type="single" collapsible className="w-full" defaultValue={`check-${checks[0]?.id}`}>
            {checks.map((check) => (
              <AccordionItem key={check.id} value={`check-${check.id}`} className="border-b border-indigo-50 dark:border-indigo-900/30 last:border-b-0 px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    <DemandCheckRunSummary check={check} />
                    <span className="text-xs text-muted-foreground font-normal font-mono">
                      {formatDateTime(check.started_at)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <DemandCheckDetails check={check} onShowEvidence={onShowEvidence} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

export function DemandCheckRunSummary({ check }: { check: DemandCheckResult }) {
  return (
    <div className="flex items-center gap-3">
      {getDemandBadge(check.demand_conclusion)}
      <span className="text-sm font-medium text-indigo-950 dark:text-indigo-200">
        Run #{check.run_id}
      </span>
    </div>
  )
}

export function DemandCheckDetails({
  check,
  onShowEvidence,
}: {
  check: DemandCheckResult
  onShowEvidence: (id: number) => void
}) {
  const scrollToEvidence = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    onShowEvidence(id)
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-5">
          <Section title="Buyer Identification" status={check.buyer_identified}>
            {check.buyer_description || "No description provided."}
          </Section>
          <Section title="Workflow Identification" status={check.workflow_identified}>
            {check.workflow_description || "No description provided."}
          </Section>
        </div>

        <div className="space-y-5">
          <div>
            <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Access vs Consumption</div>
            <div className="capitalize text-indigo-950 dark:text-indigo-200 font-medium">{check.access_vs_consumption.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
              Recurring Usage
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800">{check.recurring_usage_signal}</Badge>
            </div>
            {check.recurring_usage_basis && <p className="text-muted-foreground text-sm leading-relaxed">{check.recurring_usage_basis}</p>}
          </div>
          <div>
            <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
              Existing Paid Analogs
              <Badge variant={check.existing_paid_analog_found ? "default" : "secondary"} className="text-[10px] h-4 px-1.5">
                {check.existing_paid_analog_found ? "Found" : "Not Found"}
              </Badge>
            </div>
            {check.paid_analog_names && check.paid_analog_names.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {check.paid_analog_names.map((name: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-muted/60 hover:bg-muted/80 text-xs font-normal">{name}</Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground italic text-xs">None identified</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
        <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Confidence Basis</div>
        <p className="leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">{check.confidence_basis}</p>
      </div>

      {check.open_questions && check.open_questions.length > 0 && (
        <div className="border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
          <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Open Questions</div>
          <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground marker:text-indigo-300">
            {check.open_questions.map((q: string, i: number) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {check.contradicting_evidence_ids && check.contradicting_evidence_ids.length > 0 && (
        <div className="border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
          <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Contradicting Evidence</div>
          <div className="flex flex-wrap gap-2">
            {check.contradicting_evidence_ids.map((evId: number) => (
              <a 
                key={evId} 
                href={`#evidence-${evId}`}
                onClick={(e) => scrollToEvidence(e, evId)}
                className="text-xs inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/40 font-medium"
              >
                Evidence #{evId}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-indigo-100 dark:border-indigo-900/30 pt-4 flex flex-wrap gap-2 text-[10px] text-muted-foreground font-mono">
        <span className="bg-muted/50 border border-border/50 px-2 py-1 rounded">Searches: {check.search_count}</span>
        <span className="bg-muted/50 border border-border/50 px-2 py-1 rounded">Claude Calls: {check.claude_call_count}</span>
        <span className="bg-muted/50 border border-border/50 px-2 py-1 rounded">Cost: ${check.external_cost_usd.toFixed(4)}</span>
        <span className="bg-muted/50 border border-border/50 px-2 py-1 rounded">Tokens: {check.ai_input_tokens} In / {check.ai_output_tokens} Out</span>
        {check.finished_at && <span className="bg-muted/50 border border-border/50 px-2 py-1 rounded">Duration: {Math.round((new Date(check.finished_at).getTime() - new Date(check.started_at).getTime()) / 1000)}s</span>}
      </div>
    </div>
  )
}

function Section({ title, status, children }: { title: string, status: string, children: React.ReactNode }) {
  const isPositive = status === 'true' || status === 'yes'
  const isNegative = status === 'false' || status === 'no'
  
  return (
    <div>
      <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
        {title}
        <Badge 
          variant={isPositive ? "default" : isNegative ? "secondary" : "outline"} 
          className={`text-[10px] h-4 px-1.5 capitalize ${isPositive ? 'bg-indigo-600 text-white hover:bg-indigo-600' : isNegative ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'}`}
        >
          {status}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>
    </div>
  )
}
