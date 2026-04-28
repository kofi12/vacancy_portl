"use client"

import { useApp } from "@/lib/app-context"
import { cardCls } from "@/components/ui-kit"
import { Mail, Phone, Shield } from "lucide-react"

function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

export function ProfilePage() {
  const { user } = useApp()
  if (!user) return null

  const roleLabel = user.role === "OWNER" ? "Owner / Operator" : "Referring Professional"

  const fields = [
    { icon: Mail,   label: "Email",  value: user.email },
    { icon: Phone,  label: "Phone",  value: user.phone || "Not set" },
    { icon: Shield, label: "Role",   value: roleLabel },
    ...(user.title        ? [{ icon: Shield, label: "Title",        value: user.title }]        : []),
    ...(user.organization ? [{ icon: Shield, label: "Organization", value: user.organization }] : []),
  ]

  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      <div>
        <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-[#0f172a]">Profile</h2>
        <p className="mt-1 text-[14px] text-[#64748b]">Your account information.</p>
      </div>

      <div className={`${cardCls} p-6`}>
        <div className="mb-6 flex items-center gap-4 border-b border-[#f1f5f9] pb-6">
          <Avatar name={user.fullName} size={56} />
          <div>
            <div className="text-[18px] font-extrabold text-[#0f172a]">{user.fullName}</div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-[6px] border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[12px] font-bold text-[#2563eb]">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-[10px] bg-[#f8fafc] p-4">
              <Icon className="h-5 w-5 shrink-0 text-[#94a3b8]" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">{label}</div>
                <div className="mt-0.5 text-[14px] font-semibold text-[#374151]">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
