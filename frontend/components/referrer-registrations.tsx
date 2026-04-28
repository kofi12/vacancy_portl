"use client"

import { useState, useEffect } from "react"
import { useApp, type Application, type RcfForm, type ApplicationDocument, type Facility, type Applicant } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Btn, StatusChip, SimpleModal, PageHeader, FieldGroup, SearchableSelect, cardCls, inputCls } from "@/components/ui-kit"
import { Building2, ChevronDown, ChevronUp, Download, Upload, FileText, Loader2, Trash2, ClipboardList, Plus, ExternalLink } from "lucide-react"
import { ApplicationDocsModal } from "@/components/application-docs-modal"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import { formatDistanceToNow } from "date-fns"

type AppStatus = Application["status"]

const STATUS_LABEL: Record<AppStatus, string> = {
  PENDING: "Pending", SUBMITTED: "Submitted", IN_REVIEW: "In Review", ACCEPTED: "Accepted", DECLINED: "Declined",
}

export function ReferrerRegistrations() {
  const { user, applications, applicants, facilities, submitApplication } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)

  const [showNew, setShowNew]               = useState(false)
  const [selectedApplicantId, setSelectedApplicantId] = useState("")
  const [selectedFacilityId, setSelectedFacilityId]   = useState("")
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [pendingApplication, setPendingApplication] = useState<Application | null>(null)

  const myApps = applications
    .filter((a) => a.rpId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const myApplicants = applicants.filter((a) => a.rpId === user?.id)
  const openFacilities = facilities.filter((f) => f.isActive && f.currentOpenings > 0)

  function openNew() {
    setSelectedApplicantId(myApplicants[0]?.id ?? "")
    setSelectedFacilityId(openFacilities[0]?.id ?? "")
    setShowNew(true)
  }

  async function handleSubmit() {
    if (!selectedApplicantId || !selectedFacilityId) return
    setIsSubmitting(true)
    try {
      const application = await submitApplication(selectedFacilityId, selectedApplicantId)
      setShowNew(false)
      setPendingApplication(application)
    } catch (e) { handleApiError(e) }
    finally { setIsSubmitting(false) }
  }

  const canSubmit = !!selectedApplicantId && !!selectedFacilityId

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Applications"
        subtitle={`${myApps.length} application${myApps.length !== 1 ? "s" : ""} submitted`}
        action={
          <Btn icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Application
          </Btn>
        }
      />

      {myApps.length === 0 ? (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <ClipboardList className="mb-3 h-10 w-10 text-[#94a3b8]" />
          <p className="text-[14px] text-[#64748b]">{"You haven't submitted any applications yet."}</p>
          <p className="mt-1 text-[13px] text-[#94a3b8]">Click "New Application" to get started.</p>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          {myApps.map((app, i) => {
            const facility  = facilities.find((f) => f.id === app.rcfId)
            const applicant = applicants.find((a) => a.id === app.applicantId)
            const isLast    = i === myApps.length - 1
            const isOpen    = expanded === app.id

            return (
              <div key={app.id} className={isLast ? "" : "border-b border-[#f1f5f9]"}>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[#eff6ff]">
                      <Building2 className="h-5 w-5 text-[#2563eb]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[#0f172a]">
                        {facility?.name ?? app.rcfId}
                      </div>
                      {applicant && (
                        <div className="mt-0.5 text-[12px] text-[#64748b]">
                          For {applicant.name} (age {applicant.age})
                        </div>
                      )}
                      <div className="mt-0.5 text-[12px] text-[#94a3b8]">
                        {app.submittedAt
                          ? `Submitted ${formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}`
                          : `Created ${formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}`}
                      </div>
                      {app.status === "DECLINED" && app.declineReason && (
                        <div className="mt-1 text-[12px] italic text-[#dc2626]">
                          Declined: {app.declineReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <StatusChip status={app.status} label={STATUS_LABEL[app.status]} />
                    <button onClick={() => setExpanded(isOpen ? null : app.id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f8fafc]">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <AppDocs application={app} rcfId={app.rcfId} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Application Modal */}
      <SimpleModal open={showNew} onClose={() => setShowNew(false)} title="New Application" width={500}>
        {myApplicants.length === 0 ? (
          <p className="text-[14px] text-[#64748b]">
            You have no applicants yet. Go to the <strong>Applicants</strong> page to create one first.
          </p>
        ) : (
          <>
            <FieldGroup label="Select Applicant" required>
              <SearchableSelect
                items={myApplicants}
                selected={selectedApplicantId}
                onSelect={setSelectedApplicantId}
                getSearchText={a => `${a.name} ${a.careNeeds}`}
                placeholder="Search applicants…"
                renderItem={(a) => (
                  <>
                    <span className="font-semibold text-[#0f172a]">{a.name}</span>
                    <span className="ml-2 text-[12px] text-[#64748b]">Age {a.age} — {a.careNeeds}</span>
                  </>
                )}
              />
            </FieldGroup>

            <FieldGroup label="Select RCF" required>
              {openFacilities.length === 0 ? (
                <p className="text-[13px] text-[#94a3b8]">No facilities with vacancies available right now.</p>
              ) : (
                <SearchableSelect
                  items={openFacilities}
                  selected={selectedFacilityId}
                  onSelect={setSelectedFacilityId}
                  getSearchText={f => `${f.name} ${f.address}`}
                  placeholder="Search facilities…"
                  renderItem={(f) => (
                    <>
                      <span className="font-semibold text-[#0f172a]">{f.name}</span>
                      <span className="ml-2 text-[12px] text-[#16a34a] font-semibold">{f.currentOpenings} opening{f.currentOpenings !== 1 ? "s" : ""}</span>
                      {f.address && <div className="mt-0.5 text-[12px] text-[#64748b]">{f.address}</div>}
                    </>
                  )}
                />
              )}
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setShowNew(false)}>Cancel</Btn>
              <Btn disabled={!canSubmit || openFacilities.length === 0} loading={isSubmitting} onClick={handleSubmit}>
                Apply
              </Btn>
            </div>
          </>
        )}
        {myApplicants.length === 0 && (
          <div className="flex justify-end">
            <Btn variant="secondary" onClick={() => setShowNew(false)}>Close</Btn>
          </div>
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

function AppDocs({ application, rcfId }: { application: Application; rcfId: string }) {
  const { updateApplicationStatus } = useApp()
  const [rcfForms, setRcfForms]     = useState<RcfForm[]>([])
  const [docs, setDocs]             = useState<ApplicationDocument[]>([])
  const [loading, setLoading]       = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading]   = useState(false)
  const [isSubmittingApp, setIsSubmittingApp] = useState(false)

  const canEdit = application.status === "PENDING"
  const allDocsUploaded = rcfForms.length === 0 || docs.length >= rcfForms.length

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiClient.get<RcfForm[]>(`/rcf-forms/rcf/${rcfId}`),
      apiClient.get<ApplicationDocument[]>(`/application-documents/application/${application.id}`),
    ]).then(([forms, appDocs]) => {
      if (!cancelled) { setRcfForms(forms); setDocs(appDocs) }
    }).catch(handleApiError)
     .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [application.id, rcfId])

  async function handleView(id: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/rcf-forms/${id}/download`)
      window.open(url, "_blank")
    } catch (e) { handleApiError(e) }
  }

  async function handleDownloadForm(id: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/rcf-forms/${id}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  async function handleSubmitApp() {
    setIsSubmittingApp(true)
    try {
      await updateApplicationStatus(application.id, "SUBMITTED")
    } catch (e) { handleApiError(e) }
    finally { setIsSubmittingApp(false) }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", uploadFile)
      fd.append("applicationId", application.id)
      fd.append("type", "CUSTOM")
      fd.append("contentType", "PDF")
      const created = await apiClient.postForm<ApplicationDocument>("/application-documents", fd)
      setDocs((p) => [...p, created])
      setUploadFile(null)
      const inp = document.getElementById(`doc-file-${application.id}`) as HTMLInputElement
      if (inp) inp.value = ""
    } catch (e) { handleApiError(e) }
    finally { setIsUploading(false) }
  }

  async function handleDelete(docId: string) {
    try {
      await apiClient.delete(`/application-documents/${docId}`)
      setDocs((p) => p.filter((d) => d.id !== docId))
    } catch (e) { handleApiError(e) }
  }

  async function handleDownloadDoc(id: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/application-documents/${id}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  if (loading) {
    return (
      <div className="flex justify-center border-t border-[#f1f5f9] bg-[#f8fafc] py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#94a3b8]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-4">
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Required Forms</div>
        {rcfForms.length === 0 ? (
          <p className="text-[13px] text-[#94a3b8]">No forms required for this RCF.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {rcfForms.map((form) => (
              <div key={form.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-2">
                <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                  <FileText className="h-4 w-4 text-[#94a3b8]" />{form.title}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleView(form.id)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#64748b] cursor-pointer border-none bg-transparent hover:text-[#0f172a]">
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </button>
                  <button onClick={() => handleDownloadForm(form.id, form.fileName)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] cursor-pointer border-none bg-transparent">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Uploaded Documents</div>
        {docs.length === 0 ? (
          <p className="text-[13px] text-[#94a3b8]">No documents uploaded yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-2">
                <div className="flex items-center gap-2 text-[14px] text-[#374151]">
                  <FileText className="h-4 w-4 text-[#94a3b8]" />{doc.originalFileName}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownloadDoc(doc.id, doc.originalFileName)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f1f5f9]">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  {canEdit && (
                    <button onClick={() => handleDelete(doc.id)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] text-[#dc2626] hover:bg-[#fef2f2]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <form onSubmit={handleUpload} className="flex items-end gap-2 border-t border-[#e2e8f0] pt-3">
          <div className="flex-1">
            <label htmlFor={`doc-file-${application.id}`} className="mb-1 block text-[12px] font-semibold text-[#374151]">
              Upload completed form
            </label>
            <input id={`doc-file-${application.id}`} type="file" accept=".pdf" className={inputCls}
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} required />
          </div>
          <button type="submit" disabled={isUploading || !uploadFile}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[9px] bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-50">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </button>
        </form>
      )}

      {canEdit && (
        <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-3">
          <p className="text-[12px] text-[#94a3b8]">
            {allDocsUploaded
              ? "All forms uploaded — ready to submit."
              : `${Math.max(0, rcfForms.length - docs.length)} form${rcfForms.length - docs.length !== 1 ? "s" : ""} remaining`}
          </p>
          <Btn size="sm" disabled={!allDocsUploaded} loading={isSubmittingApp} onClick={handleSubmitApp}>
            Submit Application
          </Btn>
        </div>
      )}
    </div>
  )
}
