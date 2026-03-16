"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Clock, ArrowUpRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface OwnerDashboardProps {
  onNavigate: (view: string) => void
}

export function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const { user, facilities, interests } = useApp()

  const myFacilities = facilities.filter((f) => f.ownerId === user?.id)
  const myInterests = interests.filter((i) =>
    myFacilities.some((f) => f.id === i.facilityId)
  )
  const pendingInterests = myInterests.filter((i) => !i.followedUp)
  const totalBeds = myFacilities.reduce((sum, f) => sum + f.bedCount, 0)
  const availableBeds = myFacilities.reduce((sum, f) => sum + f.availableBeds, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {"Welcome back, "}{user?.name?.split(" ")[0]}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Here's an overview of your facilities and pending actions."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">My Facilities</p>
              <p className="text-2xl font-semibold text-foreground">{myFacilities.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
              <ArrowUpRight className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Beds</p>
              <p className="text-2xl font-semibold text-foreground">{availableBeds} <span className="text-sm font-normal text-muted-foreground">/ {totalBeds}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
              <p className="text-2xl font-semibold text-foreground">{pendingInterests.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Interests</p>
              <p className="text-2xl font-semibold text-foreground">{myInterests.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Facility Status</CardTitle>
              <button
                onClick={() => onNavigate("my-facility")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Manage
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {myFacilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{facility.name}</p>
                  <p className="text-sm text-muted-foreground">{facility.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(facility.lastUpdated), { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  className={
                    facility.status === "open"
                      ? "rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      : "rounded-lg bg-muted text-muted-foreground hover:bg-muted/90"
                  }
                >
                  {facility.status === "open"
                    ? `Open (${facility.availableBeds} beds)`
                    : "Full"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Interest</CardTitle>
              <button
                onClick={() => onNavigate("interests")}
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {myInterests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No interest registrations yet.</p>
            ) : (
              myInterests.slice(0, 3).map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{interest.applicantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {"Referred by "}{interest.referrerName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(interest.submittedAt), { addSuffix: true })}
                    </p>
                  </div>
                  {interest.followedUp ? (
                    <Badge variant="outline" className="rounded-lg border-success text-success">
                      Followed Up
                    </Badge>
                  ) : (
                    <Badge className="rounded-lg bg-warning text-warning-foreground hover:bg-warning/90">
                      Pending
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
