"use client"

import { useState } from "react"
import { useApp, type Application } from "@/lib/app-context"
import { StatusChip, cardCls } from "@/components/ui-kit"
import { ApplicationDocsModal } from "@/components/application-docs-modal"
import { formatDistanceToNow } from "date-fns"

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: React.ReactNode; sub?: string; accent?: string; icon?: string
}) {
  return (
    <div className={`${cardCls} p-6`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#64748b]">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-[32px] font-extrabold leading-none tracking-tight" style={{ color: accent ?? "#0f172a" }}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[12px] text-[#94a3b8]">{sub}</div>}
    </div>
  )
}

export function OwnerDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { user, userOrgId, facilities, applications } = useApp()
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const myFacilities = facilities.filter((f) => f.orgId === userOrgId)
  const myApps       = applications.filter((a) => myFacilities.some((f) => f.id === a.rcfId))
  const totalBeds    = myFacilities.reduce((s, f) => s + f.licensedBeds, 0)
  const totalOpenings= myFacilities.reduce((s, f) => s + f.currentOpenings, 0)
  const pendingCount = myApps.filter((a) => a.status === "SUBMITTED").length
  const isFull       = totalOpenings === 0

  const recentApps = [...myApps]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const statusCounts: Record<string, number> = {
    SUBMITTED: myApps.filter((a) => a.status === "SUBMITTED").length,
    IN_REVIEW: myApps.filter((a) => a.status === "IN_REVIEW").length,
    ACCEPTED:  myApps.filter((a) => a.status === "ACCEPTED").length,
    DECLINED:  myApps.filter((a) => a.status === "DECLINED").length,
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-[#0f172a]">
          Good morning ☀️
        </h2>
        <p className="mt-1 text-[14px] text-[#64748b]">
          {"Here's an overview of "}
          {myFacilities[0]?.name ?? "your RCFs"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My RCFs"             value={myFacilities.length} icon="🏥" sub="Total facilities" />
        <StatCard label="Licensed Beds"      value={totalBeds}           icon="🛏"  sub="Total capacity" />

        {/* Openings card — inline because it needs a chip */}
        <div className={`${cardCls} p-6`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#64748b]">Current Openings</span>
            <span className="text-lg">🪟</span>
          </div>
          <div className="flex items-end gap-2.5">
            <span
              className="text-[32px] font-extrabold leading-none tracking-tight"
              style={{ color: isFull ? "#dc2626" : "#0f172a" }}
            >
              {totalOpenings}
            </span>
            <StatusChip status={isFull ? "full" : "open"} />
          </div>
          <div className="mt-1.5 text-[12px] text-[#94a3b8]">
            {isFull ? "No available beds" : `${totalOpenings} bed${totalOpenings !== 1 ? "s" : ""} available`}
          </div>
        </div>

        <StatCard label="Total Applications" value={myApps.length} icon="📋" sub={`${pendingCount} pending`} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className={`${cardCls} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
            <span className="text-[15px] font-bold text-[#0f172a]">Recent Applications</span>
            <button
              onClick={() => onNavigate("interests")}
              className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-[#2563eb]"
            >
              View all →
            </button>
          </div>
          {recentApps.length === 0 ? (
            <div className="px-5 py-10 text-center text-[14px] text-[#64748b]">No applications yet.</div>
          ) : (
            recentApps.map((a) => {
              const facility = myFacilities.find((f) => f.id === a.rcfId)
              return (
                <div key={a.id} className="flex cursor-pointer items-center justify-between border-b border-[#f1f5f9] px-5 py-3 transition-colors hover:bg-[#f8fafc]" onClick={() => setSelectedApp(a)}>
                  <div>
                    <div className="text-[14px] font-semibold text-[#0f172a]">
                      {facility?.name ?? "Unknown Facility"}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#94a3b8]">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <StatusChip status={a.status} />
                </div>
              )
            })
          )}
        </div>

        {/* Quick Actions + Status Summary */}
        <div className={`${cardCls} p-6`}>
          <div className="mb-4 text-[15px] font-bold text-[#0f172a]">Quick Actions</div>
          <div className="mb-6 flex flex-col gap-2.5">
            {[
              { label: "🏥 Update RCF Info",      view: "my-facility" },
              { label: "📋 Review Applications",  view: "interests" },
              { label: "👤 My Profile",           view: "profile" },
            ].map(({ label, view }) => (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className="w-full cursor-pointer rounded-[9px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-left text-[14px] font-semibold text-[#374151] transition-colors hover:bg-[#f1f5f9] font-[inherit]"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="rounded-[10px] border border-[#f1f5f9] bg-[#f8fafc] p-4">
            <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">
              Status Summary
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="mb-2 flex items-center justify-between">
                <StatusChip status={status} />
                <span className="text-[13px] font-bold text-[#374151]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ApplicationDocsModal
        application={selectedApp}
        title={selectedApp ? `Application — ${myFacilities.find(f => f.id === selectedApp.rcfId)?.name ?? ""}` : ""}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  )
}
