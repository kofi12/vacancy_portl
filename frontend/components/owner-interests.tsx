"use client"

import { useState } from "react"
import { useApp, type InterestRecord } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Phone, User, Clock, CheckCircle2, Send } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export function OwnerInterests() {
  const { user, facilities, interests, followUp } = useApp()
  const [selectedInterest, setSelectedInterest] = useState<InterestRecord | null>(null)
  const [emailBody, setEmailBody] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const myFacilities = facilities.filter((f) => f.ownerId === user?.id)
  const myInterests = interests
    .filter((i) => myFacilities.some((f) => f.id === i.facilityId))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  function openFollowUp(interest: InterestRecord) {
    setSelectedInterest(interest)
    setEmailBody(
      `Dear ${interest.referrerName},\n\nThank you for registering interest for ${interest.applicantName} at our facility. We are writing to follow up on the current status of their placement.\n\nPlease feel free to contact us to discuss next steps.\n\nBest regards,\n${user?.name}`
    )
  }

  function handleSendFollowUp() {
    if (!selectedInterest) return
    followUp(selectedInterest.id)
    setSelectedInterest(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  const pendingCount = myInterests.filter((i) => !i.followedUp).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Interest List</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount > 0
            ? `You have ${pendingCount} pending follow-up${pendingCount > 1 ? "s" : ""}.`
            : "All interest records are up to date."}
        </p>
      </div>

      {myInterests.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No interest registrations yet for your facilities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myInterests.map((interest) => (
            <Card key={interest.id} className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{interest.applicantName}</CardTitle>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {"For "}{interest.facilityName}
                    </p>
                  </div>
                  {interest.followedUp ? (
                    <Badge variant="outline" className="rounded-lg border-success text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Followed Up
                    </Badge>
                  ) : (
                    <Badge className="rounded-lg bg-warning text-warning-foreground hover:bg-warning/90">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Applicant Details
                    </div>
                    <p className="text-sm text-foreground">
                      Age: {interest.applicantAge} | Needs: {interest.applicantNeeds}
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      Referred By
                    </div>
                    <p className="text-sm font-medium text-foreground">{interest.referrerName}</p>
                    <p className="text-xs text-muted-foreground">{interest.referrerEmail}</p>
                    <p className="text-xs text-muted-foreground">{interest.referrerPhone}</p>
                  </div>
                </div>
                {interest.contactNotes && (
                  <div className="mb-4 rounded-xl bg-secondary/50 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">Contact Notes</p>
                    <p className="text-sm text-foreground">{interest.contactNotes}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Submitted {formatDistanceToNow(new Date(interest.submittedAt), { addSuffix: true })}
                    {interest.followedUp && interest.followedUpAt && (
                      <span>
                        {" | Followed up "}{format(new Date(interest.followedUpAt), "MMM d, h:mm a")}
                      </span>
                    )}
                  </div>
                  {!interest.followedUp && (
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => openFollowUp(interest)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Follow Up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Follow-up Email Modal */}
      <Dialog open={!!selectedInterest} onOpenChange={(open) => !open && setSelectedInterest(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Follow-Up Email</DialogTitle>
            <DialogDescription>
              {"Contacting "}{selectedInterest?.referrerName} {"about "}{selectedInterest?.applicantName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{selectedInterest?.referrerEmail}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {selectedInterest?.referrerPhone}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email Body</Label>
              <Textarea
                className="min-h-[180px] rounded-xl text-sm"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {"This action will be logged with a timestamp for audit trail purposes."}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedInterest(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSendFollowUp}>
              <Send className="mr-2 h-4 w-4" />
              Send Follow-Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle>Follow-Up Sent</DialogTitle>
            <DialogDescription>
              {"Email sent and action logged with timestamp."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
