"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { handleApiError } from "@/lib/handle-error"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ProfileCompletionModal() {
  const { user, completeProfile } = useApp()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = !!user && !user.profileCompleted

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await completeProfile({ fullName: fullName || user?.fullName || "", phone })
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="rounded-2xl sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            {"Please provide a few details so facility owners can contact you."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prof-name">Full Name</Label>
            <Input
              id="prof-name"
              className="rounded-xl"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="prof-phone">Phone Number</Label>
            <Input
              id="prof-phone"
              className="rounded-xl"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              required
            />
          </div>
          <Button type="submit" className="mt-2 w-full rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
