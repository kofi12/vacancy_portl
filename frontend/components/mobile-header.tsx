"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Building2,
  Menu,
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Search,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileHeaderProps {
  activeView: string
  onNavigate: (view: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileHeader({ activeView, onNavigate, open, onOpenChange }: MobileHeaderProps) {
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

  const navItems = user?.role === "owner" ? ownerNavItems : rpNavItems

  function handleNav(view: string) {
    onNavigate(view)
    onOpenChange(false)
  }

  return (
    <>
      <header className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-semibold text-foreground">Vacancy Portal</h1>
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => onOpenChange(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </header>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-base">Vacancy Portal</SheetTitle>
                <SheetDescription className="text-xs">RCF Coordination</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
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
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {user?.role === "owner" ? "Owner / Operator" : "Referring Professional"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onOpenChange(false) }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
