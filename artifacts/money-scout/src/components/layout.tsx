import { ReactNode, useState } from "react"
import { Link, useLocation } from "wouter"
import { Loader2, PlayCircle, ShieldCheck, Target, Radar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@workspace/replit-auth-web"
import { Button } from "@/components/ui/button"

export function Layout({
  children,
  user,
  onLogout,
}: {
  children: ReactNode
  user: AuthUser
  onLogout: () => void
}) {
  const [location] = useLocation()
  const [autonomousRunPending, setAutonomousRunPending] = useState(false)

  const navItems = [
    { href: "/", label: "Opportunities", icon: Target },
    { href: "/discovery", label: "Discovery Scout", icon: Radar },
  ]

  const opportunityMatch = location.match(/^\/opportunities\/(\d+)$/)
  const opportunityId = opportunityMatch ? Number(opportunityMatch[1]) : null

  const runAutonomousResearch = async () => {
    if (!opportunityId || autonomousRunPending) return
    const confirmed = window.confirm(
      "Run Money Scout's bounded autonomous pipeline for this opportunity? Research is capped at $1.50 in recorded external-service cost. If Research clears the opportunity, the built-in Validation handoff may use up to another $0.50. Failed paid stages are not automatically retried.",
    )
    if (!confirmed) return

    setAutonomousRunPending(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/research/advance`, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      })
      const body = await response.json().catch(() => null) as Record<string, unknown> | null
      if (!response.ok) {
        const message = typeof body?.error === "string" ? body.error : `HTTP ${response.status}`
        throw new Error(message)
      }

      const verdict = typeof body?.current_verdict === "string" ? body.current_verdict : "updated"
      const phase = typeof body?.phase === "string" ? body.phase : "unknown"
      window.alert(
        `Autonomous Research finished. Current verdict: ${verdict}. Research phase: ${phase}. Any built-in Validation handoff continues under its own spend and retry limits.`,
      )
      window.location.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown autonomous research failure"
      window.alert(`Autonomous Research stopped: ${message}`)
    } finally {
      setAutonomousRunPending(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-card flex-shrink-0 sticky top-0 md:h-[100dvh] z-20">
        <div className="p-4 flex items-center gap-2 font-bold text-lg border-b">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Money Scout</span>
        </div>
        <nav className="p-2 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto hidden border-t p-3 md:block">
          <p className="truncate text-xs text-muted-foreground">
            {user.email ?? user.firstName ?? "Signed in"}
          </p>
          <Button className="mt-2 w-full" variant="outline" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {opportunityId !== null && (
        <div className="fixed bottom-4 right-4 z-30">
          <Button
            onClick={runAutonomousResearch}
            disabled={autonomousRunPending}
            className="shadow-lg"
            title="Run bounded autonomous Research and allow the built-in Validation handoff"
          >
            {autonomousRunPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {autonomousRunPending ? "Running pipeline..." : "Run autonomous pipeline"}
          </Button>
        </div>
      )}
    </div>
  )
}
