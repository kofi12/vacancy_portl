"use client"

import { useState } from "react"
import { useApp, type Application, type Facility } from "@/lib/app-context"
import { StatusChip, PageHeader, cardCls, Btn, SimpleModal } from "@/components/ui-kit"
import { ApplicationDocsModal } from "@/components/application-docs-modal"
import { Building2, ClipboardList, Users, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const STATUS_LABEL: Record<Application["status"], string> = {
  PENDING: "Pending", SUBMITTED: "Submitted", IN_REVIEW: "In Review", ACCEPTED: "Accepted", DECLINED: "Declined",
}

interface RpDashboardProps {
  onNavigate: (view: string) => void
}

export function RpDashboard({ onNavigate }: RpDashboardProps) {
  const { user, applications, facilities, applicants } = useApp()
  const [selectedRcf, setSelectedRcf] = useState<Facility | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const myApps = applications
    .filter((a) => a.rpId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const recentApps = myApps.slice(0, 5)
  const rcfsWithVacancies = facilities.filter((f) => f.isActive && f.currentOpenings > 0)
  const activeApplicants = applicants.filter((a) => a.rpId === user?.id)

  const stats = [
    {
      label: "Applications",
      value: myApps.length,
      icon: ClipboardList,
      color: "#2563eb",
      bg: "#eff6ff",
      onClick: () => onNavigate("my-interests"),
    },
    {
      label: "My Applicants",
      value: activeApplicants.length,
      icon: Users,
      color: "#7c3aed",
      bg: "#f5f3ff",
      onClick: () => onNavigate("my-interests"),
    },
    {
      label: "RCFs Available",
      value: rcfsWithVacancies.length,
      icon: Building2,
      color: "#16a34a",
      bg: "#f0fdf4",
      onClick: () => onNavigate("facilities"),
    },
    {
      label: "In Review",
      value: myApps.filter((a) => a.status === "IN_REVIEW").length,
      icon: TrendingUp,
      color: "#d97706",
      bg: "#fffbeb",
      onClick: undefined,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(" ")[0] ?? "back"}`}
        subtitle="Here's an overview of your applications and available RCFs."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, onClick }) => (
          <div
            key={label}
            className={`${cardCls} p-5 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={onClick}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: bg }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="text-[26px] font-extrabold text-[#0f172a]">{value}</div>
            <div className="mt-0.5 text-[13px] font-medium text-[#64748b]">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent applications */}
        <div className={`${cardCls} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
            <div className="text-[15px] font-bold text-[#0f172a]">Recent Applications</div>
            <button
              onClick={() => onNavigate("my-interests")}
              className="cursor-pointer text-[13px] font-semibold text-[#2563eb] hover:underline"
            >
              View all
            </button>
          </div>
          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="mb-2 h-8 w-8 text-[#94a3b8]" />
              <p className="text-[14px] text-[#64748b]">No applications yet.</p>
              <button
                onClick={() => onNavigate("facilities")}
                className="mt-2 cursor-pointer text-[13px] font-semibold text-[#2563eb] hover:underline"
              >
                Browse RCFs
              </button>
            </div>
          ) : (
            recentApps.map((app, i) => {
              const facility = facilities.find((f) => f.id === app.rcfId)
              const applicant = applicants.find((a) => a.id === app.applicantId)
              const isLast = i === recentApps.length - 1
              return (
                <div key={app.id} className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#f8fafc] transition-colors ${isLast ? "" : "border-b border-[#f1f5f9]"}`} onClick={() => setSelectedApp(app)}>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-[#0f172a]">
                      {facility?.name ?? "Unknown Facility"}
                    </div>
                    {applicant && (
                      <div className="text-[12px] text-[#64748b]">For {applicant.name}</div>
                    )}
                    <div className="text-[12px] text-[#94a3b8]">
                      {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="ml-3 shrink-0">
                    <StatusChip status={app.status} label={STATUS_LABEL[app.status]} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* RCFs with vacancies */}
        <div className={`${cardCls} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
            <div className="text-[15px] font-bold text-[#0f172a]">Available RCFs</div>
            <button
              onClick={() => onNavigate("facilities")}
              className="cursor-pointer text-[13px] font-semibold text-[#2563eb] hover:underline"
            >
              Browse all
            </button>
          </div>
          {rcfsWithVacancies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="mb-2 h-8 w-8 text-[#94a3b8]" />
              <p className="text-[14px] text-[#64748b]">No vacancies right now.</p>
            </div>
          ) : (
            rcfsWithVacancies.slice(0, 5).map((f, i) => {
              const isLast = i === Math.min(rcfsWithVacancies.length, 5) - 1
              return (
                <div key={f.id} className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#f8fafc] transition-colors ${isLast ? "" : "border-b border-[#f1f5f9]"}`} onClick={() => setSelectedRcf(f)}>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-[#0f172a]">{f.name}</div>
                    {f.address && (
                      <div className="truncate text-[12px] text-[#64748b]">{f.address}</div>
                    )}
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <div className="text-[18px] font-extrabold text-[#16a34a]">{f.currentOpenings}</div>
                    <div className="text-[11px] text-[#94a3b8]">{f.currentOpenings === 1 ? "opening" : "openings"}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <SimpleModal
        open={!!selectedRcf}
        onClose={() => setSelectedRcf(null)}
        title={selectedRcf?.name ?? ""}
      >
        {selectedRcf && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-[#f8fafc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Licensed Beds</div>
                <div className="mt-1 text-[20px] font-extrabold text-[#0f172a]">{selectedRcf.licensedBeds}</div>
              </div>
              <div className="rounded-[10px] bg-[#f8fafc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Openings</div>
                <div className="mt-1 text-[20px] font-extrabold text-[#16a34a]">{selectedRcf.currentOpenings}</div>
              </div>
            </div>
            {selectedRcf.address && (
              <p className="text-[14px] text-[#64748b]">{selectedRcf.address}</p>
            )}
            {selectedRcf.phone && (
              <p className="text-[14px] text-[#64748b]">{selectedRcf.phone}</p>
            )}
            <div className="flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setSelectedRcf(null)}>Close</Btn>
              <Btn onClick={() => { setSelectedRcf(null); onNavigate("facilities") }}>Apply Now</Btn>
            </div>
          </div>
        )}
      </SimpleModal>

      <ApplicationDocsModal
        application={selectedApp}
        title={selectedApp ? `Application — ${facilities.find(f => f.id === selectedApp.rcfId)?.name ?? ""}` : ""}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  )
}
