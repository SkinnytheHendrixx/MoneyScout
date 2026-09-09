import { useState, useMemo } from "react"
import { Link } from "wouter"
import { Plus, ArrowUpDown, ExternalLink, Search, Activity } from "lucide-react"
import { useListOpportunities } from "@workspace/api-client-react"
import { getPolicyBadge, getVerdictBadge } from "@/components/badges"
import { formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortField =
  | "name"
  | "opportunity_type"
  | "source_platform"
  | "status"
  | "policy_status"
  | "verdict"
  | "overall_score"
  | "last_researched"
type SortOrder = "asc" | "desc"

export default function OpportunitiesList() {
  const { data: opportunities, isLoading, isError } = useListOpportunities()
  const [sortField, setSortField] = useState<SortField>("overall_score")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [search, setSearch] = useState("")

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const filteredAndSorted = useMemo(() => {
    if (!opportunities) return []
    
    let result = opportunities.filter(opp => 
      opp.name.toLowerCase().includes(search.toLowerCase()) || 
      opp.source_platform.toLowerCase().includes(search.toLowerCase())
    )

    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
    
    return result
  }, [opportunities, sortField, sortOrder, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Review and manage scouted opportunities.</p>
        </div>
        <Link href="/opportunities/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Opportunity
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or platform..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1">
                  Name <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("opportunity_type")}>
                <div className="flex items-center gap-1">
                  Type <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("source_platform")}>
                <div className="flex items-center gap-1">
                  Platform <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("status")}>
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("verdict")}>
                <div className="flex items-center gap-1">
                  Verdict <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("policy_status")}>
                <div className="flex items-center gap-1">
                  Policy <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("overall_score")}>
                <div className="flex items-center justify-end gap-1">
                  Score <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort("last_researched")}>
                <div className="flex items-center justify-end gap-1">
                  Last Researched <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Loading opportunities...</TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-destructive">Failed to load opportunities.</TableCell>
              </TableRow>
            ) : filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No opportunities found.</TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((opp) => (
                <TableRow key={opp.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/opportunities/${opp.id}`} className="hover:underline hover:text-primary transition-colors">
                        {opp.name}
                      </Link>
                      <Link href={`/opportunities/${opp.id}/runs`} title="Run timeline" className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity className="h-3.5 w-3.5" />
                      </Link>
                      {opp.source_url && (
                        <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{opp.opportunity_type}</TableCell>
                  <TableCell className="text-muted-foreground">{opp.source_platform}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{opp.status}</TableCell>
                  <TableCell>{getVerdictBadge(opp.verdict)}</TableCell>
                  <TableCell>{getPolicyBadge(opp.policy_status)}</TableCell>
                  <TableCell className="text-right font-mono">{opp.overall_score}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">{formatDate(opp.last_researched)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
