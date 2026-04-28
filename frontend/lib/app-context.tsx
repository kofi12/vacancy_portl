"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { getStoredToken, decodeToken, clearToken } from "@/lib/auth"

export type UserRole = "OWNER" | "RP" | "ADMIN"

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  phone: string | null
  profileCompleted: boolean
  title: string | null
  organization: string | null
}

export interface Applicant {
  id: string
  rpId: string
  name: string
  dob: string
  age: number
  careNeeds: string
  createdAt: string
  updatedAt: string | null
}

export interface Facility {
  id: string
  orgId: string
  name: string
  address: string
  phone: string
  isActive: boolean
  licensedBeds: number
  currentOpenings: number
  updatedAt: string | null
}

export interface RcfForm {
  id: string
  rcfId: string
  fileName: string
  title: string
  formType: string
  contentType: string
  storageKey: string
}

export interface ApplicationDocument {
  id: string
  applicationId: string
  type: string
  originalFileName: string
  contentType: string
  storageKey: string
}

export type ApplicationStatus = "PENDING" | "SUBMITTED" | "IN_REVIEW" | "ACCEPTED" | "DECLINED"

export interface Application {
  id: string
  rcfId: string
  applicantId: string
  rpId: string
  status: ApplicationStatus
  declineReason: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string | null
}

// Shape returned by the API — does not include profileCompleted
interface ApiUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  phone: string | null
  title: string | null
  organization: string | null
}

interface ApiOrg {
  id: string
  ownerId: string
  name: string
}

interface AppContextType {
  user: User | null
  userOrgId: string | null
  isLoggedIn: boolean
  isLoading: boolean
  facilities: Facility[]
  applications: Application[]
  applicants: Applicant[]
  logout: () => void
  refreshFacilities: () => Promise<void>
  createOrg: (name: string) => Promise<void>
  completeProfile: (data: { fullName: string; phone: string; title?: string; organization?: string }) => Promise<void>
  createFacility: (data: { name: string; address: string; phone: string; licensedBeds: number; currentOpenings: number }) => Promise<void>
  updateFacilityStatus: (facilityId: string, isActive: boolean, currentOpenings: number) => Promise<void>
  submitApplication: (rcfId: string, applicantId: string) => Promise<Application>
  createApplicant: (name: string, dob: string, age: number, careNeeds: string) => Promise<Applicant>
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, declineReason?: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function toUser(apiUser: ApiUser): User {
  return {
    ...apiUser,
    profileCompleted: apiUser.phone !== null,
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userOrgId, setUserOrgId] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from stored token on mount
  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const payload = decodeToken(token)
      if (!payload) {
        clearToken()
        setIsLoading(false)
        return
      }

      try {
        const apiUser = await apiClient.get<ApiUser>(`/users/${payload.userId}`)
        const user = toUser(apiUser)
        setUser(user)

        // Data fetches are best-effort — errors don't log the user out
        if (user.role === "OWNER") {
          try {
            const org = await apiClient.get<ApiOrg>(`/orgs/owner/${user.id}`)
            setUserOrgId(org.id)
            const rcfs = await apiClient.get<Facility[]>(`/rcfs/org/${org.id}`)
            setFacilities(rcfs)
            const appsByRcf = await Promise.all(
              rcfs.map(f => apiClient.get<Application[]>(`/applications/rcf/${f.id}`))
            )
            setApplications(appsByRcf.flat())
          } catch { /* no org yet or data unavailable */ }
        } else if (user.role === "RP") {
          try {
            const [rcfs, apps, myApplicants] = await Promise.all([
              apiClient.get<Facility[]>('/rcfs/active'),
              apiClient.get<Application[]>(`/applications/rp/${user.id}`),
              apiClient.get<Applicant[]>(`/applicants/rp/${user.id}`),
            ])
            setFacilities(rcfs)
            setApplications(apps)
            setApplicants(myApplicants)
          } catch { /* data unavailable */ }
        }
      } catch {
        // Only clear token if the user fetch itself fails (invalid/expired token)
        clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setUserOrgId(null)
    setFacilities([])
    setApplications([])
    setApplicants([])
  }, [])

  const refreshFacilities = useCallback(async () => {
    if (!user) return
    if (user.role === "OWNER" && userOrgId) {
      const rcfs = await apiClient.get<Facility[]>(`/rcfs/org/${userOrgId}`)
      setFacilities(rcfs)
    } else if (user.role === "RP") {
      const rcfs = await apiClient.get<Facility[]>('/rcfs/active')
      setFacilities(rcfs)
    }
  }, [user, userOrgId])

  const createOrg = useCallback(async (name: string) => {
    const org = await apiClient.post<ApiOrg>('/orgs', { name })
    setUserOrgId(org.id)
  }, [])

  const completeProfile = useCallback(async (data: { fullName: string; phone: string; title?: string; organization?: string }) => {
    if (!user) return
    const updated = await apiClient.patch<ApiUser>(`/users/${user.id}`, data)
    setUser(toUser(updated))
  }, [user])

  const createFacility = useCallback(async (data: { name: string; address: string; phone: string; licensedBeds: number; currentOpenings: number }) => {
    if (!userOrgId) return
    const created = await apiClient.post<Facility>('/rcfs', { ...data, orgId: userOrgId, isActive: true })
    setFacilities(prev => [...prev, created])
  }, [userOrgId])

  const updateFacilityStatus = useCallback(async (facilityId: string, isActive: boolean, currentOpenings: number) => {
    const updated = await apiClient.patch<Facility>(`/rcfs/${facilityId}`, { isActive, currentOpenings })
    setFacilities(prev => prev.map(f => f.id === facilityId ? updated : f))
  }, [])

  const createApplicant = useCallback(async (name: string, dob: string, age: number, careNeeds: string): Promise<Applicant> => {
    const created = await apiClient.post<Applicant>('/applicants', { name, dob, age, careNeeds })
    setApplicants(prev => [...prev, created])
    return created
  }, [])

  const submitApplication = useCallback(async (rcfId: string, applicantId: string): Promise<Application> => {
    const created = await apiClient.post<Application>('/applications', { rcfId, applicantId })
    setApplications(prev => [...prev, created])
    return created
  }, [])

  const updateApplicationStatus = useCallback(async (applicationId: string, status: ApplicationStatus, declineReason?: string) => {
    const body: Record<string, unknown> = { status }
    if (declineReason !== undefined) body.declineReason = declineReason
    const updated = await apiClient.patch<Application>(`/applications/${applicationId}/status`, body)
    setApplications(prev => prev.map(a => a.id === applicationId ? updated : a))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        userOrgId,
        isLoggedIn: !!user,
        isLoading,
        facilities,
        applications,
        applicants,
        logout,
        refreshFacilities,
        createOrg,
        completeProfile,
        createFacility,
        updateFacilityStatus,
        submitApplication,
        createApplicant,
        updateApplicationStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
