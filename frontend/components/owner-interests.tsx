"use client"

import { useState } from "react"
import { useApp, type Application, type ApplicationDocument } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Clock, CheckCircle2, Loader2, ChevronDown, ChevronUp, FileText, Download } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerInterests() {
  const { userOrgId, facilities, applications, updateApplicationStatus } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)

  const myFacilities = facilities.filter((f) => f.orgId === userOrgId)
  const myApplications = applications
    .filter((a) => myFacilities.some((f) => f.id === a.rcfId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingCount = myApplications.filter((a) => a.status === "PENDING").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount > 0
            ? `You have ${pendingCount} pending application${pendingCount > 1 ? "s" : ""}.`
            : "All applications are up to date."}
        </p>
      </div>

      {myApplications.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No applications yet for your RCFs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              facilityName={myFacilities.find((f) => f.id === application.rcfId)?.name}
              isExpanded={expanded === application.id}
              onToggle={() => setExpanded(expanded === application.id ? null : application.id)}
              onMarkSubmitted={() => updateApplicationStatus(application.id, "SUBMITTED").catch(handleApiError)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({
  application,
  facilityName,
  isExpanded,
  onToggle,
  onMarkSubmitted,
}: {
  application: Application
  facilityName?: string
  isExpanded: boolean
  onToggle: () => void
  onMarkSubmitted: () => void
}) {
  const [docs, setDocs] = useState<ApplicationDocument[] | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(false)

  async function loadDocs() {
    if (docs !== null) return
    setLoadingDocs(true)
    try {
      const result = await apiClient.get<ApplicationDocument[]>(`/application-documents/application/${application.id}`)
      setDocs(result)
    } catch (e) {
      handleApiError(e)
    } finally {
      setLoadingDocs(false)
    }
  }

  function handleToggle() {
    if (!isExpanded) loadDocs()
    onToggle()
  }

  async function handleDownload(docId: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/application-documents/${docId}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Applicant {application.applicantId}</CardTitle>
            {facilityName && (
              <p className="mt-0.5 text-sm text-muted-foreground">{"For "}{facilityName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {application.status === "SUBMITTED" ? (
              <Badge variant="outline" className="rounded-lg border-success text-success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                SUBMITTED
              </Badge>
            ) : (
              <Badge className="rounded-lg bg-warning text-warning-foreground hover:bg-warning/90">
                PENDING
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl p-0" onClick={handleToggle}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {application.submittedAt ? (
              <>
                Submitted {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                <span className="text-muted-foreground/50">
                  ({format(new Date(application.submittedAt), "MMM d, h:mm a")})
                </span>
              </>
            ) : (
              <>Created {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</>
            )}
          </div>
          {application.status === "PENDING" && (
            <Button size="sm" className="rounded-xl" onClick={onMarkSubmitted}>
              Mark Submitted
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Uploaded Documents</p>
            {loadingDocs ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : !docs || docs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{doc.originalFileName}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => handleDownload(doc.id, doc.originalFileName)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
