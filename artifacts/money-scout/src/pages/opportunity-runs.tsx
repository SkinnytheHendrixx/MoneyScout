import { Link, useParams } from "wouter"
import { ArrowLeft } from "lucide-react"
import { useGetOpportunity } from "@workspace/api-client-react"
import { RunTimeline } from "@/components/run-timeline"

export default function OpportunityRuns() {
  const params = useParams()
  const id = Number(params.id)
  const { data: opportunity, isLoading } = useGetOpportunity(id)

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading run history...</div>
  }

  if (!opportunity) {
    return <div className="p-8 text-center text-destructive">Opportunity not found.</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/opportunities/${id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Run Timeline</h1>
          <p className="text-muted-foreground mt-1">{opportunity.name}</p>
        </div>
      </div>
      <RunTimeline opportunityId={id} />
    </div>
  )
}
