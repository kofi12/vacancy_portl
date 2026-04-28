"use client"

import { useState } from "react"
import { useApp, type Facility } from "@/lib/app-context"
import { Btn, StatusChip, SimpleModal, PageHeader, FieldGroup, cardCls, inputCls } from "@/components/ui-kit"
import { Building2, Search, MapPin, Phone, RefreshCw, Plus, CheckCircle2, Loader2 } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { formatDistanceToNow } from "date-fns"

export function ReferrerFacilities() {
  const { user, facilities, applicants, submitApplication, createApplicant, refreshFacilities } = useApp()

  const [searchQuery, setSearchQuery]   = useState("")
  const [openOnly, setOpenOnly]         = useState(false)
  const [applyFacility, setApplyFacility] = useState<Facility | null>(null)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | "new">("")
  const [newName, setNewName]           = useState("")
  const [newDob, setNewDob]             = useState("")
  const [newCareNeeds, setNewCareNeeds] = useState("")
  const [showSuccess, setShowSuccess]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const myApplicants = applicants.filter((a) => a.rpId === user?.id)

  const filtered = facilities.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchOpen   = !openOnly || (f.isActive && f.currentOpenings > 0)
    return matchSearch && matchOpen
  })

  const openCount = facilities.filter((f) => f.isActive && f.currentOpenings > 0).length

  function ageFromDob(dob: string): number {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
  }

  function openApply(f: Facility) {
    setApplyFacility(f)
    setSelectedApplicantId(myApplicants.length > 0 ? myApplicants[0].id : "new")
    setNewName(""); setNewDob(""); setNewCareNeeds("")
  }

  async function handleApply() {
    if (!applyFacility) return
    setIsSubmitting(true)
    try {
      let applicantId = selectedApplicantId
      if (selectedApplicantId === "new") {
        const created = await createApplicant(newName, newDob, ageFromDob(newDob), newCareNeeds)
        applicantId = created.id
      }
      await submitApplication(applyFacility.id, applicantId)
      setApplyFacility(null)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (e) { handleApiError(e) }
    finally { setIsSubmitting(false) }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    try { await refreshFacilities(); setLastRefreshed(new Date()) }
    catch (e) { handleApiError(e) }
    finally { setIsRefreshing(false) }
  }

  const isNewValid = newName.trim() && newDob && newCareNeeds.trim()
  const canSubmit  = selectedApplicantId !== "new" || isNewValid

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="RCFs"
        subtitle={`${openCount} ${openCount === 1 ? "RCF" : "RCFs"} currently with openings`}
        action={
          <Btn variant="secondary" size="sm" loading={isRefreshing} icon={<RefreshCw className="h-4 w-4" />} onClick={handleRefresh}>
            Refresh
          </Btn>
        }
      />

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <Btn variant={openOnly ? "primary" : "outline"} size="sm" onClick={() => setOpenOnly((o) => !o)}>
          {openOnly ? "✓ Vacancies" : "Vacancies"}
        </Btn>
      </div>

      <div className="text-[12px] text-[#94a3b8]">
        Last refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
      </div>

      {/* Facility cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((f) => {
          const hasOpenings = f.isActive && f.currentOpenings > 0
          return (
            <div key={f.id} className={`${cardCls} p-6`}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-[16px] font-extrabold tracking-tight text-[#0f172a]">{f.name}</div>
                </div>
                <StatusChip status={hasOpenings ? "open" : "full"} />
              </div>

              <div className="mb-4 flex gap-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Licensed Beds</div>
                  <div className="mt-1 text-[20px] font-extrabold text-[#0f172a]">{f.licensedBeds}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Openings</div>
                  <div className="mt-1 text-[20px] font-extrabold" style={{ color: hasOpenings ? "#16a34a" : "#dc2626" }}>
                    {f.currentOpenings}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-1.5">
                {f.address && (
                  <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />{f.address}
                  </div>
                )}
                {f.phone && (
                  <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
                    <Phone className="h-3.5 w-3.5 shrink-0" />{f.phone}
                  </div>
                )}
              </div>

              <Btn
                style={{ width: "100%" }}
                disabled={!hasOpenings}
                variant={hasOpenings ? "primary" : "secondary"}
                onClick={() => hasOpenings && openApply(f)}
              >
                {hasOpenings ? "Submit Application" : "No Openings"}
              </Btn>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <Search className="mb-3 h-10 w-10 text-[#94a3b8]" />
          <p className="text-[14px] text-[#64748b]">No facilities match your search criteria.</p>
        </div>
      )}

      {/* Apply Modal */}
      <SimpleModal
        open={!!applyFacility}
        onClose={() => setApplyFacility(null)}
        title={`Apply — ${applyFacility?.name}`}
        width={460}
      >
        <p className="text-[14px] text-[#64748b]">
          Complete the form below to submit a housing application.
        </p>

        <FieldGroup label="Applicant">
          <div className="flex flex-col gap-2">
            {myApplicants.map((a) => (
              <button key={a.id} type="button" onClick={() => setSelectedApplicantId(a.id)}
                className="rounded-[9px] border-2 p-3 text-left text-[14px] transition-all cursor-pointer font-[inherit]"
                style={{ borderColor: selectedApplicantId === a.id ? "#2563eb" : "#e2e8f0", background: selectedApplicantId === a.id ? "#eff6ff" : "#fff" }}>
                <span className="font-semibold text-[#0f172a]">{a.name}</span>
                <span className="ml-2 text-[12px] text-[#64748b]">Age {a.age} — {a.careNeeds}</span>
              </button>
            ))}
            <button type="button" onClick={() => setSelectedApplicantId("new")}
              className="flex items-center gap-2 rounded-[9px] border-2 p-3 text-[14px] transition-all cursor-pointer font-[inherit]"
              style={{ borderColor: selectedApplicantId === "new" ? "#2563eb" : "#e2e8f0", background: selectedApplicantId === "new" ? "#eff6ff" : "#fff", color: selectedApplicantId === "new" ? "#2563eb" : "#64748b" }}>
              <Plus className="h-4 w-4" /> New applicant
            </button>
          </div>
        </FieldGroup>

        {selectedApplicantId === "new" && (
          <>
            <FieldGroup label="Full Name" required>
              <input className={inputCls} placeholder="Prospective resident's full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Date of Birth" required>
              <input type="date" className={inputCls} value={newDob} onChange={(e) => setNewDob(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Care Needs" required>
              <textarea rows={2} className="w-full resize-y rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-[9px] text-[14px] text-[#0f172a] outline-none focus:border-[#2563eb] font-[inherit]"
                placeholder="Describe any specific care needs…" value={newCareNeeds} onChange={(e) => setNewCareNeeds(e.target.value)} />
            </FieldGroup>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setApplyFacility(null)}>Cancel</Btn>
          <Btn disabled={!canSubmit} loading={isSubmitting} onClick={handleApply}>
            Submit Application
          </Btn>
        </div>
      </SimpleModal>

      {/* Success Modal */}
      <SimpleModal open={showSuccess} onClose={() => setShowSuccess(false)} title="" width={360}>
        <div className="flex flex-col items-center py-3 text-center">
          <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#f0fdf4]">
            <CheckCircle2 className="h-7 w-7 text-[#16a34a]" />
          </div>
          <div className="text-[18px] font-bold text-[#0f172a]">Application Submitted</div>
          <div className="mt-1.5 text-[14px] text-[#64748b]">The facility owner will be in touch.</div>
        </div>
      </SimpleModal>
    </div>
  )
}
