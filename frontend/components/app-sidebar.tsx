"use client"

import React from "react"
import { useApp } from "@/lib/app-context"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  Settings,
  Search,
  ClipboardList,
  Home,
} from "lucide-react"

interface AppSidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  pendingCount?: number
}

export function AppSidebar({ activeView, onNavigate, pendingCount = 0 }: AppSidebarProps) {
  const { user } = useApp()

  type NavItem = { id: string; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; badge?: number }

  const ownerNavItems: NavItem[] = [
    { id: "dashboard",  label: "Dashboard",    icon: LayoutDashboard },
    { id: "my-facility",label: "My RCFs",      icon: Building2 },
    { id: "interests",  label: "Applications", icon: Users, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "profile",    label: "Profile",      icon: UserCircle },
    { id: "settings",   label: "Settings",     icon: Settings },
  ]

  const rpNavItems: NavItem[] = [
    { id: "rp-dashboard", label: "Dashboard",       icon: Home },
    { id: "facilities",   label: "RCFs",            icon: Search },
    { id: "applicants",   label: "Applicants",      icon: Users },
    { id: "my-interests", label: "My Applications", icon: ClipboardList },
    { id: "profile",      label: "Profile",         icon: UserCircle },
    { id: "settings",     label: "Settings",        icon: Settings },
  ]

  const navItems = user?.role === "OWNER" ? ownerNavItems : rpNavItems

  return (
    <aside className="fixed bottom-0 left-[8px] top-[68px] z-40 flex w-[212px] flex-col overflow-y-auto border-r border-[#f1f5f9] bg-white px-3 py-4">
      <div className="flex flex-col gap-0.5">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`relative flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[14px] transition-all ${
                isActive
                  ? "bg-[#eff6ff] font-bold text-[#2563eb]"
                  : "font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#374151]"
              }`}
            >
              {isActive && (
                <div className="absolute bottom-[20%] left-0 top-[20%] w-[3px] rounded-full bg-[#2563eb]" />
              )}
              <Icon
                className="h-[17px] w-[17px] shrink-0"
                style={{ color: isActive ? "#2563eb" : "#64748b" }}
              />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && (
                <span className="rounded-full bg-[#dc2626] px-[7px] py-px text-[11px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
