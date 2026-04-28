"use client"

import { useState, useEffect } from "react"
import { useApp, type Application, type RcfForm, type ApplicationDocument } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Btn, SimpleModal, inputCls } from "@/components/ui-kit"
import { FileText, Download, Upload, Trash2, Loader2, ExternalLink } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"

export function ApplicationDocsModal({
  application,
  title = "Complete Application",
  isOpen,
  onClose,
}: {
  application: Application | null
  title?: string
  isOpen: boolean
  onClose: () => void
}) {
  const { updateApplicationStatus } = useApp()
  const [rcfForms, setRcfForms] = useState<RcfForm[]>([])
  const [docs, setDocs] = useState<ApplicationDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!application) return
    setLoading(true)
    setRcfForms([])
    setDocs([])
    Promise.all([
      apiClient.get<RcfForm[]>(`/rcf-forms/rcf/${application.rcfId}`),
      apiClient.get<ApplicationDocument[]>(`/application-documents/application/${application.id}`),
    ]).then(([forms, appDocs]) => {
      setRcfForms(forms)
      setDocs(appDocs)
    }).catch(handleApiError)
      .finally(() => setLoading(false))
  }, [application?.id])

  const canEdit = application?.status === "PENDING"
  const remaining = Math.max(0, rcfForms.length - docs.length)
  const allDocsUploaded = rcfForms.length === 0 || docs.length >= rcfForms.length

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile || !application) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", uploadFile)
      fd.append("applicationId", application.id)
      fd.append("type", "CUSTOM")
      fd.append("contentType", "PDF")
      const created = await apiClient.postForm<ApplicationDocument>("/application-documents", fd)
      setDocs(p => [...p, created])
      setUploadFile(null)
      const inp = document.getElementById("modal-doc-file") as HTMLInputElement
      if (inp) inp.value = ""
    } catch (e) { handleApiError(e) }
    finally { setIsUploading(false) }
  }

  async function handleDelete(docId: string) {
    try {
      await apiClient.delete(`/application-documents/${docId}`)
      setDocs(p => p.filter(d => d.id !== docId))
    } catch (e) { handleApiError(e) }
  }

  async function handleDownloadDoc(id: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/application-documents/${id}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  async function handleSubmit() {
    if (!application) return
    setIsSubmitting(true)
    try {
      await updateApplicationStatus(application.id, "SUBMITTED")
      onClose()
    } catch (e) { handleApiError(e) }
    finally { setIsSubmitting(false) }
  }

  return (
    <SimpleModal open={isOpen} onClose={onClose} title={title} width={580}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#94a3b8]" />
        </div>
      ) : (
        <>
          {/* Required forms checklist */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">
              Required Forms
            </div>
            {rcfForms.length === 0 ? (
              <p className="text-[13px] text-[#94a3b8]">No forms required for this facility.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {rcfForms.map(form => (
                  <div key={form.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                      <FileText className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                      {form.title}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(form.id)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-[#64748b] cursor-pointer border-none bg-transparent hover:text-[#0f172a]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleDownloadForm(form.id, form.fileName)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] cursor-pointer border-none bg-transparent"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploaded documents */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">
              Uploaded Documents {docs.length > 0 && `(${docs.length})`}
            </div>
            {docs.length === 0 ? (
              <p className="text-[13px] text-[#94a3b8]">No documents uploaded yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] bg-white px-3 py-2">
                    <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                      <FileText className="h-4 w-4 text-[#94a3b8]" />
                      {doc.originalFileName}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownloadDoc(doc.id, doc.originalFileName)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f1f5f9]"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] text-[#dc2626] hover:bg-[#fef2f2]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload form */}
          {canEdit && (
            <form onSubmit={handleUpload} className="flex items-end gap-2 border-t border-[#e2e8f0] pt-3">
              <div className="flex-1">
                <label htmlFor="modal-doc-file" className="mb-1 block text-[12px] font-semibold text-[#374151]">
                  Upload completed form
                </label>
                <input
                  id="modal-doc-file"
                  type="file"
                  accept=".pdf"
                  className={inputCls}
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[9px] bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {canEdit ? (
              <p className="text-[12px] text-[#94a3b8]">
                {allDocsUploaded
                  ? "All forms uploaded — ready to submit."
                  : `${remaining} form${remaining !== 1 ? "s" : ""} remaining to upload`}
              </p>
            ) : (
              <p className="text-[12px] text-[#94a3b8]">Application submitted — documents locked.</p>
            )}
            <div className="flex gap-2">
              {canEdit ? (
                <>
                  <Btn variant="secondary" onClick={onClose}>Save & Close</Btn>
                  <Btn
                    variant="primary"
                    disabled={!allDocsUploaded}
                    loading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Submit Application
                  </Btn>
                </>
              ) : (
                <Btn variant="secondary" onClick={onClose}>Close</Btn>
              )}
            </div>
          </div>
        </>
      )}
    </SimpleModal>
  )
}
