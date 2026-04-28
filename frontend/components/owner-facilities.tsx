"use client"

import { useState } from "react"
import { useApp, type Facility, type RcfForm } from "@/lib/app-context"
import { apiClient } from "@/lib/api-client"
import { Btn, StatusChip, SimpleModal, PageHeader, FieldGroup, cardCls, inputCls } from "@/components/ui-kit"
import { Building2, FileText, Download, Trash2, Upload, Loader2, Plus, Edit } from "lucide-react"
import { handleApiError } from "@/lib/handle-error"
import { downloadFile } from "@/lib/download"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerFacilities() {
  const { userOrgId, facilities, updateFacilityStatus, createFacility } = useApp()

  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editOpenings, setEditOpenings] = useState("0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formsFacility, setFormsFacility] = useState<Facility | null>(null)
  const [rcfForms, setRcfForms] = useState<RcfForm[]>([])
  const [formsLoading, setFormsLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newBeds, setNewBeds] = useState("")
  const [newOpenings, setNewOpenings] = useState("0")
  const [isCreating, setIsCreating] = useState(false)

  const myFacilities = facilities.filter((f) => f.orgId === userOrgId)

  function openEdit(f: Facility) {
    setEditingFacility(f)
    setEditIsActive(f.isActive)
    setEditOpenings(String(f.currentOpenings))
  }

  async function openForms(f: Facility) {
    setFormsFacility(f)
    setFormsLoading(true)
    try {
      setRcfForms(await apiClient.get<RcfForm[]>(`/rcf-forms/rcf/${f.id}`))
    } catch (e) { handleApiError(e) }
    finally { setFormsLoading(false) }
  }

  async function handleUploadForm(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile || !formsFacility) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", uploadFile)
      fd.append("rcfId", formsFacility.id)
      fd.append("title", uploadTitle || uploadFile.name)
      fd.append("formType", "CUSTOM")
      fd.append("contentType", "PDF")
      const created = await apiClient.postForm<RcfForm>("/rcf-forms", fd)
      setRcfForms((p) => [...p, created])
      setUploadFile(null); setUploadTitle("")
    } catch (e) { handleApiError(e) }
    finally { setIsUploading(false) }
  }

  async function handleDeleteForm(id: string) {
    try {
      await apiClient.delete(`/rcf-forms/${id}`)
      setRcfForms((p) => p.filter((f) => f.id !== id))
    } catch (e) { handleApiError(e) }
  }

  async function handleDownloadForm(id: string, fileName: string) {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/rcf-forms/${id}/download`)
      await downloadFile(url, fileName)
    } catch (e) { handleApiError(e) }
  }

  async function handleSaveStatus() {
    if (!editingFacility) return
    setIsSubmitting(true)
    try {
      await updateFacilityStatus(editingFacility.id, editIsActive, parseInt(editOpenings) || 0)
      setEditingFacility(null)
    } catch (e) { handleApiError(e) }
    finally { setIsSubmitting(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createFacility({ name: newName, address: newAddress, phone: newPhone, licensedBeds: parseInt(newBeds), currentOpenings: parseInt(newOpenings) || 0 })
      setShowCreate(false)
      setNewName(""); setNewAddress(""); setNewPhone(""); setNewBeds(""); setNewOpenings("0")
    } catch (e) { handleApiError(e) }
    finally { setIsCreating(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My RCFs"
        subtitle="Manage vacancy status for your registered residential care facilities."
        action={
          <Btn icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            Add RCF
          </Btn>
        }
      />

      {myFacilities.length === 0 && (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <Building2 className="mb-3 h-10 w-10 text-[#94a3b8]" />
          <p className="text-[14px] text-[#64748b]">No RCFs yet. Add your first facility above.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {myFacilities.map((f) => {
          const statusKey = !f.isActive ? "inactive" : f.currentOpenings > 0 ? "open" : "full"
          const statusLabel = !f.isActive ? "Inactive" : f.currentOpenings > 0 ? `${f.currentOpenings} Opening${f.currentOpenings !== 1 ? "s" : ""}` : "Full"
          return (
            <div key={f.id} className={`${cardCls} p-6`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[#eff6ff]">
                    <Building2 className="h-5 w-5 text-[#2563eb]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[#0f172a]">{f.name}</div>
                    {f.address && <div className="mt-0.5 text-[13px] text-[#64748b]">{f.address}</div>}
                  </div>
                </div>
                <StatusChip status={statusKey} label={statusLabel} />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-[10px] bg-[#f8fafc] p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Licensed Beds</div>
                  <div className="mt-1 text-[20px] font-extrabold text-[#0f172a]">{f.licensedBeds}</div>
                </div>
                <div className="rounded-[10px] bg-[#f8fafc] p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[.05em] text-[#94a3b8]">Current Openings</div>
                  <div className="mt-1 text-[20px] font-extrabold" style={{ color: f.currentOpenings > 0 ? "#16a34a" : "#dc2626" }}>
                    {f.currentOpenings}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[12px] text-[#94a3b8]">
                  {f.updatedAt
                    ? `Updated ${formatDistanceToNow(new Date(f.updatedAt), { addSuffix: true })} (${format(new Date(f.updatedAt), "MMM d, yyyy")})`
                    : "Never updated"}
                </div>
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" icon={<FileText className="h-4 w-4" />} onClick={() => openForms(f)}>
                    Forms
                  </Btn>
                  <Btn variant="secondary" size="sm" icon={<Edit className="h-4 w-4" />} onClick={() => openEdit(f)}>
                    Update Status
                  </Btn>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Status Modal */}
      <SimpleModal open={!!editingFacility} onClose={() => setEditingFacility(null)} title="Update Vacancy Status" width={440}>
        <p className="text-[14px] text-[#374151]">
          <strong>{editingFacility?.name}</strong> — update current openings and active status.
        </p>
        <FieldGroup label="Status">
          <div className="grid grid-cols-2 gap-3">
            {[{ val: true, label: "Active" }, { val: false, label: "Inactive" }].map(({ val, label }) => (
              <button key={String(val)} type="button" onClick={() => setEditIsActive(val)}
                className="cursor-pointer rounded-[9px] border-2 p-3 text-[14px] font-semibold transition-all font-[inherit]"
                style={{ borderColor: editIsActive === val ? "#2563eb" : "#e2e8f0", background: editIsActive === val ? "#eff6ff" : "#fff", color: editIsActive === val ? "#2563eb" : "#374151" }}>
                {label}
              </button>
            ))}
          </div>
        </FieldGroup>
        {editIsActive && (
          <FieldGroup label="Current Openings">
            <input type="number" min="0" max={editingFacility?.licensedBeds} value={editOpenings}
              onChange={(e) => setEditOpenings(e.target.value)} className={inputCls} />
          </FieldGroup>
        )}
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setEditingFacility(null)}>Cancel</Btn>
          <Btn loading={isSubmitting} onClick={handleSaveStatus}>Save Changes</Btn>
        </div>
      </SimpleModal>

      {/* Manage Forms Modal */}
      <SimpleModal
        open={!!formsFacility}
        onClose={() => { setFormsFacility(null); setRcfForms([]) }}
        title={`Forms — ${formsFacility?.name}`}
        width={520}
      >
        <div className="flex flex-col gap-2">
          {formsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#94a3b8]" /></div>
          ) : rcfForms.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-[#64748b]">No forms uploaded yet.</p>
          ) : rcfForms.map((form) => (
            <div key={form.id} className="flex items-center justify-between rounded-[9px] border border-[#e2e8f0] px-3 py-2">
              <div className="flex items-center gap-2 text-[14px] text-[#374151]">
                <FileText className="h-4 w-4 text-[#94a3b8]" />
                <span className="font-semibold">{form.title}</span>
                <span className="text-[12px] text-[#94a3b8]">{form.fileName}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleDownloadForm(form.id, form.fileName)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] text-[#64748b] hover:bg-[#f8fafc]">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteForm(form.id)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] text-[#dc2626] hover:bg-[#fef2f2]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleUploadForm} className="flex flex-col gap-3 border-t border-[#f1f5f9] pt-4">
          <div className="text-[14px] font-semibold text-[#0f172a]">Upload New Form</div>
          <FieldGroup label="Title">
            <input className={inputCls} placeholder="e.g. Intake Form" value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)} required />
          </FieldGroup>
          <FieldGroup label="PDF File">
            <input type="file" accept=".pdf" className={inputCls} onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} required />
          </FieldGroup>
          <Btn type="submit" loading={isUploading} disabled={!uploadFile} icon={<Upload className="h-4 w-4" />}>
            Upload Form
          </Btn>
        </form>
      </SimpleModal>

      {/* Create RCF Modal */}
      <SimpleModal open={showCreate} onClose={() => setShowCreate(false)} title="Add RCF" width={480}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FieldGroup label="Facility Name" required>
            <input className={inputCls} placeholder="Sunrise Care Home" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </FieldGroup>
          <FieldGroup label="Address" required>
            <input className={inputCls} placeholder="123 Main St, San Diego, CA" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required />
          </FieldGroup>
          <FieldGroup label="Phone" required>
            <input className={inputCls} placeholder="(555) 000-0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Licensed Beds" required>
              <input type="number" min="1" className={inputCls} placeholder="10" value={newBeds} onChange={(e) => setNewBeds(e.target.value)} required />
            </FieldGroup>
            <FieldGroup label="Current Openings">
              <input type="number" min="0" className={inputCls} placeholder="0" value={newOpenings} onChange={(e) => setNewOpenings(e.target.value)} />
            </FieldGroup>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn type="submit" loading={isCreating}>Add RCF</Btn>
          </div>
        </form>
      </SimpleModal>
    </div>
  )
}
