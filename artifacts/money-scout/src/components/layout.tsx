import { ReactNode } from "react"
import { Link, useLocation } from "wouter"
import { Activity, ShieldCheck, Target, Radar } from "lucide-react"
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

  const navItems = [
    { href: "/", label: "Opportunities", icon: Target },
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

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
