"use client"

import { useState } from "react"
import { useApp, type Facility, type Application } from "@/lib/app-context"
import { Btn, StatusChip, SimpleModal, PageHeader, FieldGroup, cardCls, inputCls } from "@/components/ui-kit"
import { Search, MapPin, Phone, RefreshCw } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { formatDistanceToNow } from "date-fns"
import { ApplicationDocsModal } from "@/components/application-docs-modal"

export function ReferrerFacilities() {
  const { user, facilities, applicants, submitApplication, createApplicant, refreshFacilities } = useApp()

  const [searchQuery, setSearchQuery]   = useState("")
  const [openOnly, setOpenOnly]         = useState(false)
  const [applyFacility, setApplyFacility] = useState<Facility | null>(null)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | "new">("")
  const [newName, setNewName]           = useState("")
  const [newDob, setNewDob]             = useState("")
  const [newCareNeeds, setNewCareNeeds] = useState("")
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [isRefreshing, setIsRefreshing]     = useState(false)
  const [lastRefreshed, setLastRefreshed]   = useState(new Date())
  const [pendingApplication, setPendingApplication] = useState<Application | null>(null)
  const [pendingTitle, setPendingTitle]     = useState("")

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
      const application = await submitApplication(applyFacility.id, applicantId)
      setPendingTitle(`Apply to ${applyFacility.name}`)
      setApplyFacility(null)
      setPendingApplication(application)
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
            placeholder="Search RCFs…"
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
                {hasOpenings ? "Apply" : "No Openings"}
              </Btn>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <Search className="mb-3 h-10 w-10 text-[#94a3b8]" />
          <p className="text-[14px] text-[#64748b]">No RCFs match your search criteria.</p>
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
          <select
            value={selectedApplicantId}
            onChange={(e) => setSelectedApplicantId(e.target.value)}
            className={inputCls}
          >
            {myApplicants.map(a => (
              <option key={a.id} value={a.id}>{a.name} — Age {a.age}</option>
            ))}
            <option value="new">+ New applicant</option>
          </select>
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
            Apply
          </Btn>
        </div>
      </SimpleModal>

      <ApplicationDocsModal
        application={pendingApplication}
        title={pendingTitle}
        isOpen={!!pendingApplication}
        onClose={() => setPendingApplication(null)}
      />
    </div>
  )
}
