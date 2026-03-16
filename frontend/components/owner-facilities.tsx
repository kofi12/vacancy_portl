"use client"

import { useState } from "react"
import { useApp, type Facility } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Building2, Edit, Clock, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerFacilities() {
  const { user, facilities, updateFacilityStatus } = useApp()
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [editStatus, setEditStatus] = useState<"open" | "full">("open")
  const [editBeds, setEditBeds] = useState("0")
  const [editNotes, setEditNotes] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const myFacilities = facilities.filter((f) => f.ownerId === user?.id)

  function openEditModal(facility: Facility) {
    setEditingFacility(facility)
    setEditStatus(facility.status)
    setEditBeds(String(facility.availableBeds))
    setEditNotes(facility.notes)
  }

  function handleSave() {
    if (!editingFacility) return
    updateFacilityStatus(
      editingFacility.id,
      editStatus,
      parseInt(editBeds) || 0,
      editNotes
    )
    setEditingFacility(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Facilities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Manage vacancy status for your residential care facilities."}
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
                  <div>
                    <CardTitle className="text-base">{facility.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{facility.address}</p>
                  </div>
                </div>
                <Badge
                  className={
                    facility.status === "open"
                      ? "rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      : "rounded-lg bg-muted text-muted-foreground hover:bg-muted/90"
                  }
                >
                  {facility.status === "open" ? "Open" : "Full"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Total Beds</p>
                  <p className="text-lg font-semibold text-foreground">{facility.bedCount}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-semibold text-success">{facility.availableBeds}</p>
                </div>
                <div className="col-span-2 rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground">{facility.notes}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last updated {formatDistanceToNow(new Date(facility.lastUpdated), { addSuffix: true })}
                  <span className="text-muted-foreground/50">
                    ({format(new Date(facility.lastUpdated), "MMM d, yyyy h:mm a")})
                  </span>
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
              {editingFacility?.name} — {"Change the status and notify interested parties."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditStatus("open")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    editStatus === "open"
                      ? "border-success bg-success/5 text-success"
                      : "border-border text-muted-foreground hover:border-success/40"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus("full")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    editStatus === "full"
                      ? "border-muted-foreground bg-muted text-muted-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  Full
                </button>
              </div>
            </div>

            {editStatus === "open" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-beds">Available Beds</Label>
                <Input
                  id="edit-beds"
                  type="number"
                  min="0"
                  max={editingFacility?.bedCount || 10}
                  className="rounded-xl"
                  value={editBeds}
                  onChange={(e) => setEditBeds(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea
                id="edit-notes"
                className="rounded-xl"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any additional details about availability..."
              />
            </div>

            <div className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
              {"Saving will timestamp the change and auto-notify all interested parties if status changes to Open."}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingFacility(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSave}>
              Save & Notify
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
              {"Vacancy status saved with timestamp. Interested parties have been notified."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
