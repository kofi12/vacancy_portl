"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Clock, CheckCircle2, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ReferrerRegistrations() {
  const { user, interests } = useApp()
  const myInterests = interests
    .filter((i) => i.referrerId === user?.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Registrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Track the status of your interest registrations."}
        </p>
      </div>

      {myInterests.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {"You haven't registered interest in any facilities yet."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Browse facilities marked as Full to register interest."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myInterests.map((interest) => (
            <Card key={interest.id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{interest.facilityName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {"For "}{interest.applicantName} {"(age "}{interest.applicantAge}{")"}
                      </p>
                    </div>
                  </div>
                  {interest.followedUp ? (
                    <Badge variant="outline" className="rounded-lg border-success text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Contacted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-lg">
                      <Clock className="mr-1 h-3 w-3" />
                      Waiting
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Submitted {formatDistanceToNow(new Date(interest.submittedAt), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
