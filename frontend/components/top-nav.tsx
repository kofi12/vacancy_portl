"use client"

import { useState, useRef, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Building2, ChevronDown } from "lucide-react"

function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

export function TopNav() {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const roleLabel = user?.role === "OWNER" ? "Owner / Operator" : "Referring Professional"

  return (
    <header className="fixed left-[8px] right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#f1f5f9] bg-white px-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-600 to-indigo-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
          Vacancy<span className="text-[#2563eb]">Portal</span>
        </span>
        <span className="ml-1 rounded-[6px] border border-[#bfdbfe] bg-[#eff6ff] px-[7px] py-0.5 text-[11px] font-bold text-[#2563eb]">
          {user?.role}
        </span>
      </div>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-[#e2e8f0] bg-white py-[5px] pl-[6px] pr-3 transition-shadow hover:shadow-sm"
        >
          <Avatar name={user?.fullName ?? ""} />
          <div className="text-left">
            <div className="text-[13px] font-bold text-[#0f172a]">{user?.fullName}</div>
            <div className="text-[11px] text-[#94a3b8]">{roleLabel}</div>
          </div>
          <ChevronDown className="ml-1 h-[11px] w-[11px] text-[#94a3b8]" />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[500] min-w-[200px] overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="border-b border-[#f1f5f9] px-4 py-2.5">
              <div className="text-[11px] font-semibold text-[#94a3b8]">Signed in as</div>
              <div className="mt-0.5 text-[13px] font-bold text-[#0f172a]">{user?.email}</div>
            </div>
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="flex w-full items-center px-4 py-2.5 text-[14px] font-medium text-[#dc2626] hover:bg-[#fef2f2]"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
