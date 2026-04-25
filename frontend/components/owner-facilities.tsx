"use client"

import { useState } from "react"
import { useApp, type Facility } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Edit, Clock, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerFacilities() {
  const { userOrgId, facilities, updateFacilityStatus } = useApp()
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editOpenings, setEditOpenings] = useState("0")
  const [showSuccess, setShowSuccess] = useState(false)

  const myFacilities = facilities.filter((f) => f.orgId === userOrgId)

  function openEditModal(facility: Facility) {
    setEditingFacility(facility)
    setEditIsActive(facility.isActive)
    setEditOpenings(String(facility.currentOpenings))
  }

  function handleSave() {
    if (!editingFacility) return
    updateFacilityStatus(
      editingFacility.id,
      editIsActive,
      parseInt(editOpenings) || 0,
    )
    setEditingFacility(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My RCFs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Manage vacancy status for your registered residential care facilities."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {myFacilities.map((facility) => (
          <Card key={facility.id} className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{facility.name}</CardTitle>
                </div>
                <Badge
                  className={
                    facility.isActive && facility.currentOpenings > 0
                      ? "rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      : "rounded-lg bg-muted text-muted-foreground hover:bg-muted/90"
                  }
                >
                  {facility.isActive
                    ? facility.currentOpenings > 0
                      ? `${facility.currentOpenings} opening${facility.currentOpenings !== 1 ? "s" : ""}`
                      : "No Vacancies"
                    : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Licensed Beds</p>
                  <p className="text-lg font-semibold text-foreground">{facility.licensedBeds}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Current Openings</p>
                  <p className="text-lg font-semibold text-success">{facility.currentOpenings}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {facility.updatedAt ? (
                    <>
                      Last updated {formatDistanceToNow(new Date(facility.updatedAt), { addSuffix: true })}
                      <span className="text-muted-foreground/50">
                        ({format(new Date(facility.updatedAt), "MMM d, yyyy h:mm a")})
                      </span>
                    </>
                  ) : (
                    "Never updated"
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => openEditModal(facility)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Status Modal */}
      <Dialog open={!!editingFacility} onOpenChange={(open) => !open && setEditingFacility(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Vacancy Status</DialogTitle>
            <DialogDescription>
              {editingFacility?.name} — {"Update the current openings and active status."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditIsActive(true)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    editIsActive
                      ? "border-success bg-success/5 text-success"
                      : "border-border text-muted-foreground hover:border-success/40"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsActive(false)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    !editIsActive
                      ? "border-muted-foreground bg-muted text-muted-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {editIsActive && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-openings">Current Openings</Label>
                <Input
                  id="edit-openings"
                  type="number"
                  min="0"
                  max={editingFacility?.licensedBeds || 10}
                  className="rounded-xl"
                  value={editOpenings}
                  onChange={(e) => setEditOpenings(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingFacility(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle>Status Updated</DialogTitle>
            <DialogDescription>
              {"Vacancy status has been saved."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
