"use client"

import React from "react"
import { Loader2 } from "lucide-react"

// ── Btn ─────────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline"
type BtnSize = "sm" | "md" | "lg"

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary:   "bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-transparent",
  secondary: "bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#374151] border border-[#e2e8f0]",
  ghost:     "bg-transparent hover:bg-[#f1f5f9] text-[#374151] border-transparent",
  danger:    "bg-[#dc2626] hover:bg-[#b91c1c] text-white border-transparent",
  success:   "bg-[#16a34a] hover:bg-[#15803d] text-white border-transparent",
  outline:   "bg-transparent hover:text-[#2563eb] text-[#374151] border border-[#e2e8f0]",
}

const BTN_SIZE: Record<BtnSize, string> = {
  sm: "px-3 py-[5px] text-[13px]",
  md: "px-4 py-2 text-[14px]",
  lg: "px-[22px] py-[11px] text-[15px]",
}

export function Btn({
  children, variant = "primary", size = "md", onClick, disabled, loading, icon, type = "button", style,
}: {
  children?: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  type?: "button" | "submit"
  style?: React.CSSProperties
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[9px] font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] ${BTN_VARIANT[variant]} ${BTN_SIZE[size]}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {!loading && icon && <span className="flex shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

// ── StatusChip ───────────────────────────────────────────────────────────────
const CHIP_MAP: Record<string, { bg: string; color: string; border: string; label: string }> = {
  SUBMITTED: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "Submitted" },
  PENDING:   { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff", label: "Pending" },
  IN_REVIEW: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff", label: "In Review" },
  ACCEPTED:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Accepted" },
  DECLINED:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Declined" },
  open:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Open" },
  full:      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Full" },
  active:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Active" },
  inactive:  { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", label: "Inactive" },
}

export function StatusChip({ status, label: overrideLabel }: { status: string; label?: string }) {
  const s = CHIP_MAP[status] ?? { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", label: status }
  const label = overrideLabel ?? s.label
  return (
    <span
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      className="inline-flex items-center gap-[5px] rounded-[20px] px-[10px] py-[3px] text-[12px] font-bold whitespace-nowrap"
    >
      <span style={{ background: s.color }} className="h-1.5 w-1.5 shrink-0 rounded-full" />
      {label}
    </span>
  )
}

// ── SimpleModal ──────────────────────────────────────────────────────────────
export function SimpleModal({
  open, onClose, title, children, width = 500,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full flex-col bg-white"
        style={{ maxWidth: width, maxHeight: "90vh", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#f1f5f9] px-6 py-5">
          <h3 className="m-0 text-[17px] font-bold text-[#0f172a]">{title}</h3>
          <button onClick={onClose} className="cursor-pointer bg-transparent border-none px-1 text-xl leading-none text-[#94a3b8] hover:text-[#0f172a] transition-colors">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

// ── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-[#0f172a]">{title}</h2>
        {subtitle && <p className="mt-1 text-[14px] text-[#64748b]">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── FieldGroup ───────────────────────────────────────────────────────────────
export function FieldGroup({ label, required, children }: {
  label?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-semibold text-[#374151]">
          {label}{required && <span className="text-[#dc2626]"> *</span>}
        </label>
      )}
      {children}
    </div>
  )
}

// ── Shared class strings ─────────────────────────────────────────────────────
export const cardCls = "bg-white rounded-[16px] border border-[#f1f5f9] shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
export const inputCls = "w-full rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-[9px] text-[14px] text-[#0f172a] outline-none transition-colors focus:border-[#2563eb] font-[inherit]"
