"use client"

import { useState } from "react"
import { useApp, type Application, type ApplicationDocument } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Btn, StatusChip, SimpleModal, PageHeader, FieldGroup, cardCls } from "@/components/ui-kit"
import { ChevronDown, ChevronUp, FileText, Download, Loader2 } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import { formatDistanceToNow, format } from "date-fns"

type AppStatus = Application["status"]

const STATUS_LABEL: Record<AppStatus, string> = {
  SUBMITTED: "Submitted", IN_REVIEW: "In Review", ACCEPTED: "Accepted", DECLINED: "Declined",
}

const FILTERS: { key: "all" | AppStatus; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "ACCEPTED",  label: "Accepted" },
  { key: "DECLINED",  label: "Declined" },
]

export function OwnerInterests() {
  const { userOrgId, facilities, applications, updateApplicationStatus } = useApp()
  const [filter, setFilter]       = useState<"all" | AppStatus>("all")
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [declineAppId, setDeclineAppId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [updating, setUpdating]   = useState<string | null>(null)

  const myFacilities  = facilities.filter((f) => f.orgId === userOrgId)
  const allApps       = applications
    .filter((a) => myFacilities.some((f) => f.id === a.rcfId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const filtered      = filter === "all" ? allApps : allApps.filter((a) => a.status === filter)
  const newCount      = allApps.filter((a) => a.status === "SUBMITTED").length

  async function doUpdate(appId: string, status: AppStatus, reason?: string) {
    setUpdating(appId)
    try {
      await updateApplicationStatus(appId, status, reason)
      if (status === "DECLINED") { setDeclineAppId(null); setDeclineReason("") }
    } catch (e) { handleApiError(e) }
    finally { setUpdating(null) }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        subtitle={newCount > 0 ? `${newCount} new application${newCount > 1 ? "s" : ""} awaiting review.` : `${allApps.length} total applications received.`}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ key, label }) => {
          const count = key === "all" ? allApps.length : allApps.filter((a) => a.status === key).length
          const active = filter === key
          return (
            <button key={key} onClick={() => setFilter(key)}
              className="cursor-pointer rounded-[8px] border px-3.5 py-1.5 text-[13px] font-semibold transition-all font-[inherit]"
              style={{ background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#64748b", borderColor: active ? "#2563eb" : "#e2e8f0" }}>
              {label}{key !== "all" && ` (${count})`}
              {key === "all" && ` (${count})`}
            </button>
          )
        })}
      </div>

      {/* Application rows */}
      <div className={`${cardCls} overflow-hidden`}>
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-[14px] text-[#64748b]">No applications match this filter.</div>
        ) : (
          filtered.map((app, i) => {
            const facility  = myFacilities.find((f) => f.id === app.rcfId)
            const isLast    = i === filtered.length - 1
            const isOpen    = expanded === app.id
            const busy      = updating === app.id
            return (
              <div key={app.id} className={isLast ? "" : "border-b border-[#f1f5f9]"}>
                {/* Row header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-[#0f172a]">
                      {facility?.name ?? "Unknown Facility"}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#94a3b8]">
                      {app.submittedAt
                        ? `Submitted ${format(new Date(app.submittedAt), "MMM d, yyyy")}`
                        : `Created ${formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}`}
                    </div>
                    {app.status === "DECLINED" && app.declineReason && (
                      <div className="mt-1 text-[12px] italic text-[#dc2626]">
                        Reason: {app.declineReason}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <StatusChip status={app.status} label={STATUS_LABEL[app.status]} />

                    {app.status === "SUBMITTED" && (
                      <Btn size="sm" loading={busy} onClick={() => doUpdate(app.id, "IN_REVIEW")}>
                        Start Review
                      </Btn>
                    )}
                    {app.status === "IN_REVIEW" && (
                      <>
                        <Btn variant="success" size="sm" loading={busy} onClick={() => doUpdate(app.id, "ACCEPTED")}>
                          Accept
                        </Btn>
                        <Btn variant="danger" size="sm" disabled={busy} onClick={() => setDeclineAppId(app.id)}>
                          Decline
                        </Btn>
                      </>
                    )}

                    <button onClick={() => setExpanded(isOpen ? null : app.id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f8fafc]">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: documents */}
                {isOpen && (
                  <ApplicationDocs appId={app.id} />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Decline Modal */}
      <SimpleModal
        open={!!declineAppId}
        onClose={() => { setDeclineAppId(null); setDeclineReason("") }}
        title="Decline Application"
        width={480}
      >
        <p className="text-[14px] text-[#374151]">
          Provide a reason for declining this application.
        </p>
        <FieldGroup label="Decline Reason" required>
          <textarea
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. No available beds matching required care level…"
            className="w-full resize-y rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-[9px] text-[14px] text-[#0f172a] outline-none transition-colors focus:border-[#2563eb] font-[inherit]"
          />
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => { setDeclineAppId(null); setDeclineReason("") }}>Cancel</Btn>
          <Btn variant="danger" disabled={!declineReason.trim() || !!updating} loading={!!updating}
            onClick={() => declineAppId && doUpdate(declineAppId, "DECLINED", declineReason)}>
            Confirm Decline
          </Btn>
        </div>
      </SimpleModal>
    </div>
  )
}

function ApplicationDocs({ appId }: { appId: string }) {
  const [docs, setDocs] = useState<ApplicationDocument[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!loaded && !loading) {
    setLoading(true)
    apiClient.get<ApplicationDocument[]>(`/application-documents/application/${appId}`)
      .then((d) => { setDocs(d); setLoaded(true) })
      .catch(handleApiError)
      .finally(() => setLoading(false))
  }

  async function handleDownload(docId: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/application-documents/${docId}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  return (
    <div className="border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-4">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">
        Uploaded Documents
      </div>
      {loading ? (
        <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-[#94a3b8]" /></div>
      ) : !docs || docs.length === 0 ? (
        <p className="text-[13px] text-[#94a3b8]">No documents uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-2">
              <div className="flex items-center gap-2 text-[14px] text-[#374151]">
                <FileText className="h-4 w-4 text-[#94a3b8]" />
                {doc.originalFileName}
              </div>
              <button onClick={() => handleDownload(doc.id, doc.originalFileName)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f1f5f9]">
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
