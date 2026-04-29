"use client"

import { useState, useEffect } from "react"
import { AppProvider, useApp } from "@/lib/app-context"
import { LoginScreen } from "@/components/login-screen"
import { TopNav } from "@/components/top-nav"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import { OrgCreationModal } from "@/components/org-creation-modal"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { OwnerFacilities } from "@/components/owner-facilities"
import { OwnerInterests } from "@/components/owner-interests"
import { OwnerSettings } from "@/components/owner-settings"
import { ReferrerFacilities } from "@/components/referrer-facilities"
import { ReferrerRegistrations } from "@/components/referrer-registrations"
import { RpApplicants } from "@/components/rp-applicants"
import { RpDashboard } from "@/components/rp-dashboard"
import { RpSettings } from "@/components/rp-settings"
import { ProfilePage } from "@/components/profile-page"

function AppContent() {
  const { user, isLoggedIn, isLoading, facilities, applications, userOrgId } = useApp()
  const [activeView, setActiveView] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentView =
    activeView || (user?.role === "OWNER" ? "dashboard" : "rp-dashboard")

  function navigate(view: string) {
    setActiveView(view)
    window.history.pushState({ view }, "")
  }

  useEffect(() => {
    if (isLoggedIn) {
      window.history.replaceState({ view: currentView }, "")
    }
  }, [isLoggedIn, currentView])

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const defaultView = user?.role === "OWNER" ? "dashboard" : "rp-dashboard"
      setActiveView(e.state?.view ?? defaultView)
    }

    window.addEventListener("popstate", handler)
    return () => window.removeEventListener("popstate", handler)
  }, [user?.role])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-sm text-[#64748b]">Loading…</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const myFacilityIds =
    user?.role === "OWNER"
      ? facilities.filter((f) => f.orgId === userOrgId).map((f) => f.id)
      : []

  const pendingCount = applications.filter(
    (a) => myFacilityIds.includes(a.rcfId) && a.status === "SUBMITTED",
  ).length

  function renderContent() {
    switch (currentView) {
      case "dashboard":
        return <OwnerDashboard onNavigate={navigate} />
      case "my-facility":
        return <OwnerFacilities />
      case "interests":
        return <OwnerInterests />
      case "settings":
        return user?.role === "RP" ? <RpSettings /> : <OwnerSettings />
      case "facilities":
        return <ReferrerFacilities />
      case "applicants":
        return <RpApplicants />
      case "my-interests":
        return <ReferrerRegistrations />
      case "rp-dashboard":
        return <RpDashboard onNavigate={navigate} />
      case "profile":
        return <ProfilePage />
      default:
        return user?.role === "OWNER" ? (
          <OwnerDashboard onNavigate={navigate} />
        ) : (
          <RpDashboard onNavigate={navigate} />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ProfileCompletionModal />
      <OrgCreationModal />

      <div className="hidden lg:block">
        <TopNav />
      </div>

      <div className="lg:hidden">
        <MobileHeader
          activeView={currentView}
          onNavigate={navigate}
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        />
      </div>

      <div className="hidden lg:block">
        <AppSidebar
          activeView={currentView}
          onNavigate={navigate}
          pendingCount={pendingCount}
        />
      </div>

      <main className="hidden lg:block ml-[220px] mt-[68px] min-h-[calc(100vh-68px)] p-8">
        <div className="mx-auto max-w-[1100px]">{renderContent()}</div>
      </main>

      <main className="block lg:hidden p-4">{renderContent()}</main>
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