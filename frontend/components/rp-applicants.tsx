"use client"

import { useState } from "react"
import { useApp, type Application } from "@/lib/app-context"
import { Btn, SimpleModal, PageHeader, FieldGroup, SearchableSelect, cardCls, inputCls } from "@/components/ui-kit"
import { Users, Plus, Calendar, Heart } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { ApplicationDocsModal } from "@/components/application-docs-modal"

export function RpApplicants() {
  const { user, applicants, facilities, createApplicant, submitApplication } = useApp()

  // Create applicant modal
  const [showCreate, setShowCreate]       = useState(false)
  const [newName, setNewName]             = useState("")
  const [newDob, setNewDob]               = useState("")
  const [newCareNeeds, setNewCareNeeds]   = useState("")
  const [isCreating, setIsCreating]       = useState(false)

  // Apply modal (per applicant)
  const [applyApplicantId, setApplyApplicantId] = useState<string | null>(null)
  const [selectedFacilityId, setSelectedFacilityId] = useState("")
  const [isApplying, setIsApplying]       = useState(false)
  const [pendingApplication, setPendingApplication] = useState<Application | null>(null)

  const myApplicants = applicants.filter((a) => a.rpId === user?.id)
  const openFacilities = facilities.filter((f) => f.isActive && f.currentOpenings > 0)

  function ageFromDob(dob: string): number {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
  }

  const canCreate = newName.trim() && newDob && newCareNeeds.trim()

  async function handleCreate() {
    if (!canCreate) return
    setIsCreating(true)
    try {
      await createApplicant(newName.trim(), newDob, ageFromDob(newDob), newCareNeeds.trim())
      setShowCreate(false)
      setNewName(""); setNewDob(""); setNewCareNeeds("")
    } catch (e) { handleApiError(e) }
    finally { setIsCreating(false) }
  }

  function openApply(applicantId: string) {
    setApplyApplicantId(applicantId)
    setSelectedFacilityId(openFacilities[0]?.id ?? "")
  }

  async function handleApply() {
    if (!applyApplicantId || !selectedFacilityId) return
    setIsApplying(true)
    try {
      const application = await submitApplication(selectedFacilityId, applyApplicantId)
      setApplyApplicantId(null)
      setPendingApplication(application)
    } catch (e) { handleApiError(e) }
    finally { setIsApplying(false) }
  }

  const applyingApplicant = myApplicants.find((a) => a.id === applyApplicantId)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applicants"
        subtitle={`${myApplicants.length} applicant${myApplicants.length !== 1 ? "s" : ""} on file`}
        action={
          <Btn icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            New Applicant
          </Btn>
        }
      />

      {myApplicants.length === 0 ? (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <Users className="mb-3 h-10 w-10 text-[#94a3b8]" />
          <p className="text-[14px] text-[#64748b]">No applicants yet.</p>
          <p className="mt-1 text-[13px] text-[#94a3b8]">Create an applicant to start submitting applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {myApplicants.map((a) => (
            <div key={a.id} className={`${cardCls} p-5`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[15px] font-extrabold text-[#2563eb]">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[#0f172a]">{a.name}</div>
                    <div className="text-[12px] text-[#64748b]">Age {a.age}</div>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-[13px] text-[#64748b]">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                  <span>DOB: {new Date(a.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex items-start gap-2 text-[13px] text-[#64748b]">
                  <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                  <span className="line-clamp-2">{a.careNeeds}</span>
                </div>
              </div>

              <Btn
                style={{ width: "100%" }}
                variant={openFacilities.length > 0 ? "primary" : "secondary"}
                disabled={openFacilities.length === 0}
                onClick={() => openApply(a.id)}
              >
                {openFacilities.length > 0 ? "Apply to RCF" : "No Vacancies Available"}
              </Btn>
            </div>
          ))}
        </div>
      )}

      {/* Create Applicant Modal */}
      <SimpleModal open={showCreate} onClose={() => setShowCreate(false)} title="New Applicant" width={460}>
        <FieldGroup label="Full Name" required>
          <input className={inputCls} placeholder="Prospective resident's full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Date of Birth" required>
          <input type="date" className={inputCls} value={newDob} onChange={(e) => setNewDob(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Care Needs" required>
          <textarea
            rows={3}
            className="w-full resize-y rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-[9px] text-[14px] text-[#0f172a] outline-none focus:border-[#2563eb] font-[inherit]"
            placeholder="Describe specific care needs or requirements…"
            value={newCareNeeds}
            onChange={(e) => setNewCareNeeds(e.target.value)}
          />
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
          <Btn disabled={!canCreate} loading={isCreating} onClick={handleCreate}>Create Applicant</Btn>
        </div>
      </SimpleModal>

      {/* Apply to RCF Modal */}
      <SimpleModal
        open={!!applyApplicantId}
        onClose={() => setApplyApplicantId(null)}
        title={`Apply — ${applyingApplicant?.name ?? ""}`}
        width={480}
      >
        {openFacilities.length === 0 ? (
          <>
            <p className="text-[14px] text-[#64748b]">No RCFs with vacancies are available right now.</p>
            <div className="flex justify-end">
              <Btn variant="secondary" onClick={() => setApplyApplicantId(null)}>Close</Btn>
            </div>
          </>
        ) : (
          <>
            <FieldGroup label="Select RCF" required>
              <SearchableSelect
                items={openFacilities}
                selected={selectedFacilityId}
                onSelect={setSelectedFacilityId}
                getSearchText={f => `${f.name} ${f.address}`}
                placeholder="Search RCFs…"
                renderItem={(f) => (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0f172a]">{f.name}</span>
                      <span className="text-[12px] font-bold text-[#16a34a]">{f.currentOpenings} open</span>
                    </div>
                    {f.address && <div className="mt-0.5 text-[12px] text-[#64748b]">{f.address}</div>}
                  </>
                )}
              />
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setApplyApplicantId(null)}>Cancel</Btn>
              <Btn disabled={!selectedFacilityId} loading={isApplying} onClick={handleApply}>
                Apply
              </Btn>
            </div>
          </>
        )}
      </SimpleModal>

      <ApplicationDocsModal
        application={pendingApplication}
        title={pendingApplication
          ? `Apply to ${facilities.find(f => f.id === pendingApplication.rcfId)?.name ?? "RCF"}`
          : ""}
        isOpen={!!pendingApplication}
        onClose={() => setPendingApplication(null)}
      />
    </div>
  )
}
