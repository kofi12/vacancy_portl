"use client"

import { useApp, type Application } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Clock, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerInterests() {
  const { userOrgId, facilities, applications, updateApplicationStatus } = useApp()

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
              onMarkSubmitted={() => updateApplicationStatus(application.id, "SUBMITTED")}
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
  onMarkSubmitted,
}: {
  application: Application
  facilityName?: string
  onMarkSubmitted: () => void
}) {
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
      </CardContent>
    </Card>
  )
}
