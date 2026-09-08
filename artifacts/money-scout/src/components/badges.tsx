import { Badge } from "@/components/ui/badge"

export function getPolicyBadge(status: string) {
  switch (status) {
    case "GREEN":
      return <Badge variant="success">Green</Badge>
    case "YELLOW":
      return <Badge variant="warning">Yellow</Badge>
    case "RED":
      return <Badge variant="destructive">Red</Badge>
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Unknown</Badge>
  }
}

export function getVerdictBadge(verdict: string) {
  switch (verdict) {
    case "NEW":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">New</Badge>
    case "RESEARCH":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">Research</Badge>
    case "WATCH":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Watch</Badge>
    case "TEST":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">Test</Badge>
    case "BUILD":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">Build</Badge>
    case "KILL":
      return <Badge variant="destructive">Kill</Badge>
    default:
      return <Badge variant="outline">{verdict}</Badge>
  }
}

export function getDemandBadge(conclusion: string) {
  switch (conclusion) {
    case "SUPPORTED":
      return <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/20">Supported</Badge>
    case "WEAK":
      return <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-900/20">Weak</Badge>
    case "UNSUPPORTED":
      return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/20">Unsupported</Badge>
    case "UNKNOWN":
    default:
      return <Badge variant="outline" className="text-muted-foreground border-border bg-muted/20">Unknown</Badge>
  }
}

export function getClassificationBadge(classification: string) {
  switch (classification) {
    case "FACT":
      return <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50/50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/10">Fact</Badge>
    case "CLAIM":
      return <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50/50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-900/10">Claim</Badge>
    case "INFERENCE":
      return <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50/50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-900/10">Inference</Badge>
    default:
      return <Badge variant="outline" className="text-muted-foreground border-border bg-muted/20">Unknown</Badge>
  }
}
