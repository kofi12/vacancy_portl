"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
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
  const [name, setName] = useState(user?.name || "")
  const [org, setOrg] = useState("")
  const [phone, setPhone] = useState("")

  const isOpen = !!user && !user.profileCompleted

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    completeProfile({
      name: name || user?.name,
      organization: org,
      phone,
    })
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="prof-org">Organization</Label>
            <Input
              id="prof-org"
              className="rounded-xl"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g., Springfield General Hospital"
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
          <Button type="submit" className="mt-2 w-full rounded-xl" size="lg">
            Complete Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
