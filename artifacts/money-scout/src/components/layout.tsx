import { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation } from "wouter"
import { Activity, BellRing, Box, CircleDollarSign, ShieldCheck, Target, Radar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@workspace/replit-auth-web"
import { Button } from "@/components/ui/button"

type HumanActionsCountResponse = { actions?: Array<{ urgency?: string }> }

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
  const needsYouQuery = useQuery<HumanActionsCountResponse>({
    queryKey: ["human-actions", "active"],
    queryFn: async () => {
      const response = await fetch("/api/human-actions?status=ACTIVE", { credentials: "include" })
      if (!response.ok) throw new Error(`Human actions returned ${response.status}`)
      return response.json()
    },
    refetchInterval: 15_000,
  })
  const needsYouCount = needsYouQuery.data?.actions?.length ?? 0
  const criticalCount = needsYouQuery.data?.actions?.filter((item) => item.urgency === "CRITICAL").length ?? 0
  const highCount = needsYouQuery.data?.actions?.filter((item) => item.urgency === "HIGH").length ?? 0
  const urgentCount = criticalCount + highCount

  const navItems = [
    { href: "/", label: "Opportunities", icon: Target },
    { href: "/bets", label: "Bets & Capital", icon: CircleDollarSign },
    { href: "/assets", label: "Assets", icon: Box },
    { href: "/needs-you", label: "Needs You", icon: BellRing, count: needsYouCount, urgentCount },
    { href: "/discovery", label: "Discovery Scout", icon: Radar },
    { href: "/readiness", label: "System Readiness", icon: Activity },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/30">
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
                <span>{item.label}</span>
                {typeof item.count === "number" && item.count > 0 && (
                  <span
                    className={cn(
                      "ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : item.urgentCount && item.urgentCount > 0
                          ? "bg-red-600 text-white"
                          : "bg-foreground text-background",
                    )}
                    title={item.urgentCount && item.urgentCount > 0 ? `${item.urgentCount} high-urgency actions` : `${item.count} open actions`}
                  >
                    {item.count}
                  </span>
                )}
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

      <main className="flex-1 flex flex-col min-w-0">
        {criticalCount > 0 ? (
          <Link href="/needs-you" className="flex items-center justify-center gap-2 border-b border-red-300 bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
            <BellRing className="h-4 w-4" />
            {criticalCount} critical human action{criticalCount === 1 ? "" : "s"} require immediate attention
          </Link>
        ) : highCount > 0 ? (
          <Link href="/needs-you" className="flex items-center justify-center gap-2 border-b border-orange-300 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-950 hover:bg-orange-100">
            <BellRing className="h-4 w-4" />
            {highCount} high-priority human action{highCount === 1 ? "" : "s"} currently block workflow progress
          </Link>
        ) : null}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
