"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { handleApiError } from "@/lib/handle-error"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function OrgCreationModal() {
  const { user, userOrgId, createOrg } = useApp()
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = !!user && user.profileCompleted && user.role === "OWNER" && !userOrgId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createOrg(name)
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
          <DialogTitle>Create Your Organization</DialogTitle>
          <DialogDescription>
            {"Set up your organization to start managing your RCFs."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              className="rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunrise Care Group"
              required
            />
          </div>
          <Button type="submit" className="mt-2 w-full rounded-xl" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Organization
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
