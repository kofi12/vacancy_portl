"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Btn, PageHeader, FieldGroup, cardCls, inputCls } from "@/components/ui-kit"
import { handleApiError } from "@/lib/handle-error"

const NOTIF_KEY = "vp_rp_vacancy_notifications"

export function RpSettings() {
  const { user, completeProfile } = useApp()

  const [fullName,     setFullName]     = useState(user?.fullName     ?? "")
  const [phone,        setPhone]        = useState(user?.phone        ?? "")
  const [title,        setTitle]        = useState(user?.title        ?? "")
  const [organization, setOrganization] = useState(user?.organization ?? "")
  const [isSaving,     setIsSaving]     = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [vacancyNotifs, setVacancyNotifs] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(NOTIF_KEY) === "true") setVacancyNotifs(true)
  }, [])

  if (!user) return null

  const isDirty =
    fullName     !== (user.fullName     ?? "") ||
    phone        !== (user.phone        ?? "") ||
    title        !== (user.title        ?? "") ||
    organization !== (user.organization ?? "")

  async function handleSave() {
    if (!fullName.trim() || !phone.trim()) return
    setIsSaving(true); setSaved(false)
    try {
      await completeProfile({ fullName: fullName.trim(), phone: phone.trim(), title: title.trim() || undefined, organization: organization.trim() || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { handleApiError(e) }
    finally { setIsSaving(false) }
  }

  function toggleNotifs() {
    const next = !vacancyNotifs
    setVacancyNotifs(next)
    localStorage.setItem(NOTIF_KEY, String(next))
  }

  return (
    <div className="flex max-w-[600px] flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your account and notification preferences." />

      {/* Profile */}
      <div className={`${cardCls} p-6`}>
        <div className="mb-5 flex items-center gap-3 border-b border-[#f1f5f9] pb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff]">
            <span className="text-xl font-extrabold text-[#2563eb]">
              {user.fullName?.charAt(0) ?? "U"}
            </span>
          </div>
          <div>
            <div className="font-bold text-[#0f172a]">{user.fullName}</div>
            <div className="text-[13px] text-[#64748b]">{user.email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup label="Full Name" required>
              <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </FieldGroup>
            <FieldGroup label="Phone" required>
              <input type="tel" className={inputCls} placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </FieldGroup>
          </div>

          <div className="border-t border-[#f1f5f9] pt-4">
            <div className="mb-3 text-[14px] font-semibold text-[#374151]">Professional Information</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Title">
                <input className={inputCls} placeholder="e.g. Social Worker" value={title} onChange={(e) => setTitle(e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Organization">
                <input className={inputCls} placeholder="Organization name" value={organization} onChange={(e) => setOrganization(e.target.value)} />
              </FieldGroup>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved && <p className="text-[14px] font-semibold text-[#16a34a]">Profile saved successfully.</p>}
            <div className="ml-auto">
              <Btn onClick={handleSave} disabled={!isDirty || !fullName.trim() || !phone.trim()} loading={isSaving}>
                Save Changes
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`${cardCls} p-6`}>
        <div className="mb-4 text-[15px] font-bold text-[#0f172a]">Notifications</div>
        <div className="flex items-center justify-between rounded-[10px] border border-[#e2e8f0] p-4">
          <div>
            <div className="text-[14px] font-semibold text-[#374151]">RCF Vacancy Changes</div>
            <div className="mt-0.5 text-[12px] text-[#94a3b8]">
              Get notified when vacancy availability changes at RCFs where you have applications.
            </div>
          </div>
          <button
            onClick={toggleNotifs}
            className="relative ml-4 shrink-0 cursor-pointer rounded-full transition-colors"
            style={{ width: 44, height: 24, background: vacancyNotifs ? "#2563eb" : "#e2e8f0" }}
            aria-label="Toggle vacancy notifications"
          >
            <span
              className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all"
              style={{ left: vacancyNotifs ? 23 : 3 }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
