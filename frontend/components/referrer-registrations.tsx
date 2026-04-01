"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Clock, CheckCircle2, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ReferrerRegistrations() {
  const { user, applications } = useApp()
  const myApplications = applications
    .filter((a) => a.rpId === user?.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Track the status of your submitted applications."}
        </p>
      </div>

      {myApplications.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {"You haven't submitted any applications yet."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Browse RCFs and apply on behalf of your applicants."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myApplications.map((application) => (
            <Card key={application.id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{application.rcfName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {"For "}{application.applicantName} {"(age "}{application.applicantAge}{")"}
                      </p>
                    </div>
                  </div>
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
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Submitted {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
