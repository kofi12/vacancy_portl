"use client"

import { useState } from "react"
import { AppProvider, useApp } from "@/lib/app-context"
import { LoginScreen } from "@/components/login-screen"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import { OrgCreationModal } from "@/components/org-creation-modal"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { OwnerFacilities } from "@/components/owner-facilities"
import { OwnerInterests } from "@/components/owner-interests"
import { ReferrerFacilities } from "@/components/referrer-facilities"
import { ReferrerRegistrations } from "@/components/referrer-registrations"
import { ProfilePage } from "@/components/profile-page"

function AppContent() {
  const { user, isLoggedIn, isLoading } = useApp()
  const [activeView, setActiveView] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const currentView = activeView || (user?.role === "OWNER" ? "dashboard" : "facilities")

  function renderContent() {
    switch (currentView) {
      case "dashboard":
        return <OwnerDashboard onNavigate={setActiveView} />
      case "my-facility":
        return <OwnerFacilities />
      case "interests":
        return <OwnerInterests />
      case "facilities":
        return <ReferrerFacilities />
      case "my-interests":
        return <ReferrerRegistrations />
      case "profile":
        return <ProfilePage />
      default:
        return user?.role === "OWNER" ? (
          <OwnerDashboard onNavigate={setActiveView} />
        ) : (
          <ReferrerFacilities />
        )
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 lg:flex-row lg:p-5">
      <ProfileCompletionModal />
      <OrgCreationModal />

      {/* Mobile Header */}
      <MobileHeader
        activeView={currentView}
        onNavigate={setActiveView}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-5">
          <AppSidebar activeView={currentView} onNavigate={setActiveView} />
        </div>
      </div>

      {/* Main Content */}
      <main className="min-w-0 flex-1 rounded-2xl bg-card p-5 shadow-sm lg:p-8">
        {renderContent()}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
