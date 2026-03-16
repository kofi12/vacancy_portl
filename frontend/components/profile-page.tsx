"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Mail, Phone, Building2, Shield } from "lucide-react"

export function ProfilePage() {
  const { user } = useApp()

  if (!user) return null

  const fields = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "Not set" },
    { icon: Building2, label: "Organization", value: user.organization || "Not set" },
    {
      icon: Shield,
      label: "Role",
      value: user.role === "owner" ? "Owner / Operator" : "Referring Professional",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your account information</p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <Badge variant="outline" className="mt-1 rounded-lg capitalize">
                {user.role === "owner" ? "Owner / Operator" : "Referring Professional"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon
              return (
                <div
                  key={field.label}
                  className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4"
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium text-foreground">{field.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
