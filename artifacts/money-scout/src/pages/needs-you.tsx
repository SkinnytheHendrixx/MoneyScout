import { NeedsYouList } from "@/components/needs-you-list"

export default function NeedsYouPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Needs You</h1>
        <p className="mt-1 text-muted-foreground">
          Human-only bottlenecks. Resolve the smallest required action and Money Scout will queue the blocked workflow to continue automatically.
        </p>
      </div>
      <NeedsYouList showHeading={false} />
    </div>
  )
}
