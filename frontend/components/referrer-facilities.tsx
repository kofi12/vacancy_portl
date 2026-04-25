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
  Plus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ReferrerFacilities() {
  const { user, facilities, applicants, submitApplication, createApplicant } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "openings" | "no-vacancies">("all")
  const [applyFacility, setApplyFacility] = useState<Facility | null>(null)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | "new">("")
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newCareNeeds, setNewCareNeeds] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const myApplicants = applicants.filter((a) => a.rpId === user?.id)

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "openings" && f.isActive && f.currentOpenings > 0) ||
      (statusFilter === "no-vacancies" && f.isActive && f.currentOpenings === 0)
    return matchesSearch && matchesStatus
  })

  function openApplyModal(facility: Facility) {
    setApplyFacility(facility)
    setSelectedApplicantId(myApplicants.length > 0 ? myApplicants[0].id : "new")
    setNewName("")
    setNewAge("")
    setNewCareNeeds("")
  }

  function handleApply() {
    if (!applyFacility) return

    let applicantId = selectedApplicantId
    if (selectedApplicantId === "new") {
      const created = createApplicant(newName, parseInt(newAge), newCareNeeds)
      applicantId = created.id
    }

    submitApplication(applyFacility.id, applicantId)
    setApplyFacility(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const isNewApplicantValid = newName.trim() && parseInt(newAge) > 0 && newCareNeeds.trim()
  const canSubmit = selectedApplicantId !== "new" || isNewApplicantValid

  const openCount = facilities.filter((f) => f.isActive && f.currentOpenings > 0).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Find RCFs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {openCount} {openCount === 1 ? "RCF" : "RCFs"} currently with openings
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
            placeholder="Search by name or address..."
            className="rounded-xl pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: "all", label: "All" },
            { value: "openings", label: "With Openings" },
            { value: "no-vacancies", label: "No Vacancies" },
          ] as const).map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
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
                    <p className="text-xs text-muted-foreground">{facility.licensedBeds} licensed beds</p>
                  </div>
                </div>
                <Badge
                  className={
                    facility.isActive && facility.currentOpenings > 0
                      ? "rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      : "rounded-lg bg-muted text-muted-foreground hover:bg-muted/90"
                  }
                >
                  {facility.isActive && facility.currentOpenings > 0
                    ? `${facility.currentOpenings} opening${facility.currentOpenings !== 1 ? "s" : ""}`
                    : "No Vacancies"}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {facility.updatedAt
                    ? `Updated ${formatDistanceToNow(new Date(facility.updatedAt), { addSuffix: true })}`
                    : "Never updated"}
                </div>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => openApplyModal(facility)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No RCFs match your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Application Modal */}
      <Dialog open={!!applyFacility} onOpenChange={(open) => !open && setApplyFacility(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Application</DialogTitle>
            <DialogDescription>
              {"Submit an application to "}{applyFacility?.name}{"."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Applicant</Label>
              <div className="flex flex-col gap-2">
                {myApplicants.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedApplicantId(a.id)}
                    className={`flex flex-col rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                      selectedApplicantId === a.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium text-foreground">{a.name}</span>
                    <span className="text-xs text-muted-foreground">Age {a.age} — {a.careNeeds}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedApplicantId("new")}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm transition-colors ${
                    selectedApplicantId === "new"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  New applicant
                </button>
              </div>
            </div>

            {selectedApplicantId === "new" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-name">Full Name</Label>
                  <Input
                    id="new-name"
                    className="rounded-xl"
                    placeholder="Full name of the prospective resident"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-age">Age</Label>
                  <Input
                    id="new-age"
                    type="number"
                    min="1"
                    className="rounded-xl"
                    placeholder="Age"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-needs">Care Needs</Label>
                  <Textarea
                    id="new-needs"
                    className="rounded-xl"
                    rows={2}
                    placeholder="Describe any specific care needs or requirements..."
                    value={newCareNeeds}
                    onChange={(e) => setNewCareNeeds(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setApplyFacility(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleApply} disabled={!canSubmit}>
              Submit Application
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
            <DialogTitle>Application Submitted</DialogTitle>
            <DialogDescription>
              {"Your application has been submitted. The RCF owner will be in touch."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
