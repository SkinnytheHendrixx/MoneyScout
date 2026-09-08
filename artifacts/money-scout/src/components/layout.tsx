import { ReactNode } from "react"
import { Link, useLocation } from "wouter"
import { ShieldCheck, Target, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  const navItems = [
    { href: "/", label: "Opportunities", icon: Target },
  ]

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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
