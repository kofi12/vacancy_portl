"use client"

import { useState } from "react"
import type { UserRole } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2, Mail } from "lucide-react"

export function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  function handleGoogleLogin() {
    if (!selectedRole) return
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?role=${selectedRole}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Vacancy Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">RCF Vacancy Coordination Platform</p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Sign in with Google to access the portal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Sign in as</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("OWNER")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${
                    selectedRole === "OWNER"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm font-medium">Owner / Operator</span>
                  <span className="text-xs text-muted-foreground">Manage your facility</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("RP")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${
                    selectedRole === "RP"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Mail className="h-6 w-6" />
                  <span className="text-sm font-medium">Referring Professional</span>
                  <span className="text-xs text-muted-foreground">Find vacancies</span>
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-xl"
              size="lg"
              disabled={!selectedRole}
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {"By signing in, you agree to our Terms of Service and Privacy Policy."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
