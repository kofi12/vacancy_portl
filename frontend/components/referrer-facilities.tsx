"use client"

import { useState } from "react"
import { useApp, type Facility } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building2,
  Search,
  Clock,
  Phone,
  MapPin,
  UserPlus,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ReferrerFacilities() {
  const { user, facilities, registerInterest } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "full">("all")
  const [registerFacility, setRegisterFacility] = useState<Facility | null>(null)
  const [applicantName, setApplicantName] = useState("")
  const [applicantAge, setApplicantAge] = useState("")
  const [applicantNeeds, setApplicantNeeds] = useState("")
  const [contactNotes, setContactNotes] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openRegisterModal(facility: Facility) {
    setRegisterFacility(facility)
    setApplicantName("")
    setApplicantAge("")
    setApplicantNeeds("")
    setContactNotes("")
  }

  function handleRegister() {
    if (!registerFacility || !user) return
    registerInterest({
      facilityId: registerFacility.id,
      facilityName: registerFacility.name,
      referrerId: user.id,
      referrerName: user.name,
      referrerEmail: user.email,
      referrerPhone: user.phone || "",
      applicantName,
      applicantAge,
      applicantNeeds,
      contactNotes,
    })
    setRegisterFacility(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const openCount = facilities.filter((f) => f.status === "open").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Find Facilities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {openCount} {openCount === 1 ? "facility" : "facilities"} currently with vacancies
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => setLastRefreshed(new Date())}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            className="rounded-xl pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "open", "full"] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "default" : "outline"}
              size="sm"
              className="rounded-xl capitalize"
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "all" ? "All" : filter === "open" ? "Open" : "Full"}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Last refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground">{facility.ownerName}</p>
                  </div>
                </div>
                <Badge
                  className={
                    facility.status === "open"
                      ? "rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      : "rounded-lg bg-muted text-muted-foreground hover:bg-muted/90"
                  }
                >
                  {facility.status === "open"
                    ? `Open (${facility.availableBeds})`
                    : "Full"}
                </Badge>
              </div>

              <div className="mb-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {facility.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {facility.phone}
                </div>
              </div>

              {facility.notes && (
                <p className="mb-3 rounded-xl bg-secondary/50 p-3 text-sm text-foreground">
                  {facility.notes}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {formatDistanceToNow(new Date(facility.lastUpdated), { addSuffix: true })}
                </div>
                {facility.status === "full" && (
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openRegisterModal(facility)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Interest
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No facilities match your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Register Interest Modal */}
      <Dialog open={!!registerFacility} onOpenChange={(open) => !open && setRegisterFacility(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Interest</DialogTitle>
            <DialogDescription>
              {registerFacility?.name} {"is currently full. Submit your details to be notified when a vacancy opens."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-name">Applicant Name</Label>
              <Input
                id="reg-name"
                className="rounded-xl"
                placeholder="Full name of the prospective resident"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-age">Applicant Age</Label>
              <Input
                id="reg-age"
                className="rounded-xl"
                type="number"
                placeholder="Age"
                value={applicantAge}
                onChange={(e) => setApplicantAge(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-needs">Care Needs</Label>
              <Textarea
                id="reg-needs"
                className="rounded-xl"
                rows={2}
                placeholder="Describe any specific care needs or requirements..."
                value={applicantNeeds}
                onChange={(e) => setApplicantNeeds(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-notes">Contact Preferences (optional)</Label>
              <Input
                id="reg-notes"
                className="rounded-xl"
                placeholder="e.g., Best reached mornings, prefer email"
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
              />
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
              {"Your contact information ("}{user?.email}{", "}{user?.phone}{") will be shared with the facility owner."}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setRegisterFacility(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleRegister}
              disabled={!applicantName || !applicantAge || !applicantNeeds}
            >
              Submit Interest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle>Interest Registered</DialogTitle>
            <DialogDescription>
              {"Your interest has been submitted with a timestamp. The facility owner will contact you when a vacancy becomes available."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
