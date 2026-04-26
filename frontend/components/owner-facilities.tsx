"use client"

import { useState } from "react"
import { useApp, type Facility, type RcfForm } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
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
import { Building2, Edit, Clock, CheckCircle2, Loader2, Plus, FileText, Download, Trash2, Upload } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerFacilities() {
  const { userOrgId, facilities, updateFacilityStatus, createFacility } = useApp()
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editOpenings, setEditOpenings] = useState("0")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forms modal state
  const [formsFacility, setFormsFacility] = useState<Facility | null>(null)
  const [rcfForms, setRcfForms] = useState<RcfForm[]>([])
  const [formsLoading, setFormsLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Create RCF modal state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newBeds, setNewBeds] = useState("")
  const [newOpenings, setNewOpenings] = useState("0")
  const [isCreating, setIsCreating] = useState(false)

  const myFacilities = facilities.filter((f) => f.orgId === userOrgId)

  function openEditModal(facility: Facility) {
    setEditingFacility(facility)
    setEditIsActive(facility.isActive)
    setEditOpenings(String(facility.currentOpenings))
  }

  async function openFormsModal(facility: Facility) {
    setFormsFacility(facility)
    setFormsLoading(true)
    try {
      const forms = await apiClient.get<RcfForm[]>(`/rcf-forms/rcf/${facility.id}`)
      setRcfForms(forms)
    } catch (e) {
      handleApiError(e)
    } finally {
      setFormsLoading(false)
    }
  }

  async function handleUploadForm(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile || !formsFacility) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('rcfId', formsFacility.id)
      fd.append('title', uploadTitle || uploadFile.name)
      fd.append('formType', 'CUSTOM')
      fd.append('contentType', 'PDF')
      const created = await apiClient.postForm<RcfForm>('/rcf-forms', fd)
      setRcfForms(prev => [...prev, created])
      setUploadFile(null)
      setUploadTitle("")
    } catch (e) {
      handleApiError(e)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteForm(formId: string) {
    try {
      await apiClient.delete(`/rcf-forms/${formId}`)
      setRcfForms(prev => prev.filter(f => f.id !== formId))
    } catch (e) {
      handleApiError(e)
    }
  }

  async function handleDownloadForm(formId: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/rcf-forms/${formId}/download`)
      await downloadFile(url, fileName)
    } catch (e) {
      handleApiError(e)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createFacility({
        name: newName,
        address: newAddress,
        phone: newPhone,
        licensedBeds: parseInt(newBeds),
        currentOpenings: parseInt(newOpenings) || 0,
      })
      setShowCreate(false)
      setNewName(""); setNewAddress(""); setNewPhone(""); setNewBeds(""); setNewOpenings("0")
    } catch (e) {
      handleApiError(e)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSave() {
    if (!editingFacility) return
    setIsSubmitting(true)
    try {
      await updateFacilityStatus(editingFacility.id, editIsActive, parseInt(editOpenings) || 0)
      setEditingFacility(null)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2500)
    } catch (e) {
      handleApiError(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My RCFs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Manage vacancy status for your registered residential care facilities."}
          </p>
        </div>
        <Button size="sm" className="rounded-xl" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add RCF
        </Button>
      </div>

      {myFacilities.length === 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No RCFs yet. Add your first facility above.</p>
          </CardContent>
        </Card>
      )}

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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openFormsModal(facility)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Forms
                  </Button>
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
            <Button className="rounded-xl" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

      {/* Manage Forms Modal */}
      <Dialog open={!!formsFacility} onOpenChange={(open) => { if (!open) { setFormsFacility(null); setRcfForms([]) } }}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Forms — {formsFacility?.name}</DialogTitle>
            <DialogDescription>{"Upload PDF templates that RPs must complete for applications."}</DialogDescription>
          </DialogHeader>

          {/* Existing forms */}
          <div className="flex flex-col gap-2">
            {formsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : rcfForms.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No forms uploaded yet.</p>
            ) : (
              rcfForms.map(form => (
                <div key={form.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{form.title}</span>
                    <span className="text-xs text-muted-foreground">{form.fileName}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDownloadForm(form.id, form.fileName)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteForm(form.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upload new form */}
          <form onSubmit={handleUploadForm} className="flex flex-col gap-3 border-t pt-4">
            <p className="text-sm font-medium">Upload New Form</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="form-title">Title</Label>
              <Input id="form-title" className="rounded-xl" placeholder="e.g. Intake Form" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="form-file">PDF File</Label>
              <Input id="form-file" type="file" accept=".pdf" className="rounded-xl" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} required />
            </div>
            <Button type="submit" className="rounded-xl" disabled={isUploading || !uploadFile}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Form
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create RCF Modal */}
      <Dialog open={showCreate} onOpenChange={(open) => !open && setShowCreate(false)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add RCF</DialogTitle>
            <DialogDescription>{"Register a new residential care facility."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rcf-name">Facility Name</Label>
              <Input id="rcf-name" className="rounded-xl" placeholder="Sunrise Care Home" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rcf-address">Address</Label>
              <Input id="rcf-address" className="rounded-xl" placeholder="123 Main St, Vancouver, BC" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rcf-phone">Phone</Label>
              <Input id="rcf-phone" className="rounded-xl" placeholder="(555) 000-0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rcf-beds">Licensed Beds</Label>
                <Input id="rcf-beds" type="number" min="1" className="rounded-xl" placeholder="10" value={newBeds} onChange={(e) => setNewBeds(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rcf-openings">Current Openings</Label>
                <Input id="rcf-openings" type="number" min="0" className="rounded-xl" placeholder="0" value={newOpenings} onChange={(e) => setNewOpenings(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add RCF
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
