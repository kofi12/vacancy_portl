"use client"

import { useState } from "react"
import type { UserRole } from "@/lib/app-context"
import { Building2, Mail } from "lucide-react"

export function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  function handleGoogleLogin() {
    if (!selectedRole) return
    window.location.replace(`${process.env.NEXT_PUBLIC_API_URL}/auth/google?role=${selectedRole}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br from-blue-600 to-indigo-600">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#0f172a]">Vacancy Portal</h1>
          <p className="mt-1.5 text-[14px] text-[#64748b]">RCF Vacancy Coordination Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-[16px] border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="mb-1 text-[18px] font-bold text-[#0f172a]">Sign In</div>
          <div className="mb-5 text-[14px] text-[#64748b]">Select your role to continue</div>

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {([
              { role: "OWNER" as UserRole, label: "Owner / Operator", sub: "Manage your facility", icon: Building2 },
              { role: "RP" as UserRole, label: "Referring Professional", sub: "Find vacancies", icon: Mail },
            ] as const).map(({ role, label, sub, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className="flex flex-col items-center gap-2 rounded-[12px] p-4 text-center transition-all"
                style={{
                  border: `2px solid ${selectedRole === role ? "#2563eb" : "#e2e8f0"}`,
                  background: selectedRole === role ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                }}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  style={{ color: selectedRole === role ? "#2563eb" : "#64748b" }}
                />
                <span
                  className="text-[13px] font-bold"
                  style={{ color: selectedRole === role ? "#2563eb" : "#374151" }}
                >
                  {label}
                </span>
                <span className="text-[12px] text-[#64748b]">{sub}</span>
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            type="button"
            disabled={!selectedRole}
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2.5 rounded-[9px] py-[11px] text-[15px] font-semibold transition-all"
            style={{
              background: selectedRole ? "#2563eb" : "#f8fafc",
              color: selectedRole ? "#fff" : "#374151",
              border: `1px solid ${selectedRole ? "transparent" : "#e2e8f0"}`,
              cursor: selectedRole ? "pointer" : "not-allowed",
              opacity: selectedRole ? 1 : 0.6,
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-3.5 text-center text-[12px] text-[#94a3b8]">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
