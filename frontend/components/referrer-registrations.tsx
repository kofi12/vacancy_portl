"use client"

import { useState } from "react"
import { useApp, type Application, type RcfForm, type ApplicationDocument } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ReferrerRegistrations() {
  const { user, applications, applicants, facilities } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)

  const myApplications = applications
    .filter((a) => a.rpId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Track your applications and upload required documents."}
        </p>
      </div>

      {myApplications.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{"You haven't submitted any applications yet."}</p>
            <p className="mt-1 text-xs text-muted-foreground">{"Browse RCFs and apply on behalf of your applicants."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myApplications.map((application) => {
            const facility = facilities.find((f) => f.id === application.rcfId)
            const applicant = applicants.find((a) => a.id === application.applicantId)
            const isExpanded = expanded === application.id
            return (
              <Card key={application.id} className="rounded-2xl shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{facility?.name ?? application.rcfId}</h3>
                        {applicant && (
                          <p className="text-sm text-muted-foreground">
                            {"For "}{applicant.name}{" (age "}{applicant.age}{")"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === "SUBMITTED" ? (
                        <Badge variant="outline" className="rounded-lg border-success text-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          SUBMITTED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-lg">
                          <Clock className="mr-1 h-3 w-3" />
                          PENDING
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-8 w-8 p-0"
                        onClick={() => setExpanded(isExpanded ? null : application.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {application.submittedAt
                      ? `Submitted ${formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}`
                      : `Created ${formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}`}
                  </div>

                  {isExpanded && (
                    <ApplicationDocs
                      application={application}
                      rcfId={application.rcfId}
                    />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ApplicationDocs({ application, rcfId }: { application: Application; rcfId: string }) {
  const [rcfForms, setRcfForms] = useState<RcfForm[] | null>(null)
  const [docs, setDocs] = useState<ApplicationDocument[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Lazy-load on first expand
  useState(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [forms, appDocs] = await Promise.all([
          apiClient.get<RcfForm[]>(`/rcf-forms/rcf/${rcfId}`),
          apiClient.get<ApplicationDocument[]>(`/application-documents/application/${application.id}`),
        ])
        if (!cancelled) { setRcfForms(forms); setDocs(appDocs) }
      } catch (e) {
        handleApiError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  })

  async function handleDownload(formId: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/rcf-forms/${formId}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  async function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('applicationId', application.id)
      fd.append('type', 'CUSTOM')
      fd.append('contentType', 'PDF')
      const created = await apiClient.postForm<ApplicationDocument>('/application-documents', fd)
      setDocs(prev => [...(prev ?? []), created])
      setUploadFile(null)
      const input = document.getElementById(`doc-file-${application.id}`) as HTMLInputElement
      if (input) input.value = ''
    } catch (e) { handleApiError(e) }
    finally { setIsUploading(false) }
  }

  async function handleDeleteDoc(docId: string) {
    try {
      await apiClient.delete(`/application-documents/${docId}`)
      setDocs(prev => (prev ?? []).filter(d => d.id !== docId))
    } catch (e) { handleApiError(e) }
  }

  async function handleDownloadDoc(docId: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/application-documents/${docId}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center py-4 border-t">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-4 border-t pt-4">
      {/* Required forms to download */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Required Forms</p>
        {rcfForms && rcfForms.length === 0 ? (
          <p className="text-xs text-muted-foreground">No forms required for this RCF.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {(rcfForms ?? []).map(form => (
              <div key={form.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{form.title}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1.5" onClick={() => handleDownload(form.id, form.fileName)}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded documents */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Uploaded Documents</p>
        {docs && docs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {(docs ?? []).map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{doc.originalFileName}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => handleDownloadDoc(doc.id, doc.originalFileName)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {application.status === "PENDING" && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteDoc(doc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload a document */}
      {application.status === "PENDING" && (
        <form onSubmit={handleUploadDoc} className="flex items-end gap-2 border-t pt-3">
          <div className="flex-1">
            <Label htmlFor={`doc-file-${application.id}`} className="mb-1 text-xs">Upload completed form</Label>
            <Input
              id={`doc-file-${application.id}`}
              type="file"
              accept=".pdf"
              className="rounded-xl"
              onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl shrink-0" disabled={isUploading || !uploadFile}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>
        </form>
      )}
    </div>
  )
}
