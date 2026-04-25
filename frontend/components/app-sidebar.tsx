"use client"

import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  LogOut,
  Search,
  ClipboardList,
} from "lucide-react"

interface AppSidebarProps {
  activeView: string
  onNavigate: (view: string) => void
}

export function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
  const { user, logout } = useApp()

  const ownerNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-facility", label: "My RCFs", icon: Building2 },
    { id: "interests", label: "Applications", icon: Users },
    { id: "profile", label: "Profile", icon: UserCircle },
  ]

  const rpNavItems = [
    { id: "facilities", label: "Find RCFs", icon: Search },
    { id: "my-interests", label: "My Applications", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: UserCircle },
  ]

  const navItems = user?.role === "OWNER" ? ownerNavItems : rpNavItems

  return (
    <aside className="flex h-full w-64 flex-col rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-8 flex items-center gap-3 px-3 pt-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">Vacancy Portal</h1>
          <p className="text-xs text-muted-foreground">RCF Coordination</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role === "OWNER" ? "Owner / Operator" : "Referring Professional"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
