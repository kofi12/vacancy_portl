"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type UserRole = "OWNER" | "RP" | "ADMIN"

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  phone: string | null
  profileCompleted: boolean
}

export interface Applicant {
  id: string
  rpId: string
  name: string
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

export interface Application {
  id: string
  rcfId: string
  applicantId: string
  rpId: string
  status: "PENDING" | "SUBMITTED"
  submittedAt: string | null
  createdAt: string
  updatedAt: string | null
}

interface AppContextType {
  user: User | null
  userOrgId: string | null
  isLoggedIn: boolean
  facilities: Facility[]
  applications: Application[]
  applicants: Applicant[]
  login: (role: UserRole) => void
  logout: () => void
  completeProfile: (data: { fullName: string; phone: string }) => void
  updateFacilityStatus: (facilityId: string, isActive: boolean, currentOpenings: number) => void
  submitApplication: (rcfId: string, applicantId: string) => void
  createApplicant: (name: string, age: number, careNeeds: string) => Applicant
  updateApplicationStatus: (applicationId: string, status: "PENDING" | "SUBMITTED") => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_FACILITIES: Facility[] = [
  {
    id: "f1",
    orgId: "org1",
    name: "Sunrise Gardens RCF",
    address: "1201 Sunrise Blvd, Sacramento, CA 95820",
    phone: "(916) 555-0101",
    isActive: true,
    licensedBeds: 6,
    currentOpenings: 2,
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: "f2",
    orgId: "org2",
    name: "Maplewood Care Home",
    address: "340 Maplewood Ave, Elk Grove, CA 95758",
    phone: "(916) 555-0202",
    isActive: true,
    licensedBeds: 4,
    currentOpenings: 0,
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "f3",
    orgId: "org3",
    name: "Harmony House",
    address: "88 Harmony Lane, Roseville, CA 95661",
    phone: "(916) 555-0303",
    isActive: true,
    licensedBeds: 6,
    currentOpenings: 0,
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "f4",
    orgId: "org4",
    name: "Valley View Residence",
    address: "512 Valley View Dr, Folsom, CA 95630",
    phone: "(916) 555-0404",
    isActive: true,
    licensedBeds: 5,
    currentOpenings: 1,
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "f5",
    orgId: "org1",
    name: "Pinecrest Care Facility",
    address: "77 Pinecrest Rd, Rancho Cordova, CA 95670",
    phone: "(916) 555-0505",
    isActive: true,
    licensedBeds: 4,
    currentOpenings: 3,
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
]

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "ap1",
    rpId: "rp-new",
    name: "Dorothy Miller",
    age: 78,
    careNeeds: "Requires assistance with daily living activities and medication management.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: null,
  },
  {
    id: "ap2",
    rpId: "rp-new",
    name: "Harold Simpson",
    age: 83,
    careNeeds: "Memory care support, early-stage dementia.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: null,
  },
]

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    rcfId: "f2",
    applicantId: "ap1",
    rpId: "rp1",
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "PENDING",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: null,
  },
  {
    id: "a2",
    rcfId: "f2",
    applicantId: "ap2",
    rpId: "rp2",
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "SUBMITTED",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: null,
  },
  {
    id: "a3",
    rcfId: "f3",
    applicantId: "ap1",
    rpId: "rp3",
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: "PENDING",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: null,
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userOrgId, setUserOrgId] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS)

  const login = useCallback((role: UserRole) => {
    if (role === "OWNER") {
      setUser({
        id: "owner1",
        fullName: "Maria Chen",
        email: "maria.chen@sunrisegardens.com",
        role: "OWNER",
        phone: "(555) 123-4567",
        profileCompleted: true,
      })
      setUserOrgId("org1")
    } else {
      setUser({
        id: "rp-new",
        fullName: "Alex Rivera",
        email: "alex.rivera@hospital.org",
        role: "RP",
        phone: null,
        profileCompleted: false,
      })
      setUserOrgId(null)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setUserOrgId(null)
  }, [])

  const completeProfile = useCallback((data: { fullName: string; phone: string }) => {
    setUser(prev => prev ? { ...prev, ...data, profileCompleted: true } : null)
  }, [])

  const updateFacilityStatus = useCallback((facilityId: string, isActive: boolean, currentOpenings: number) => {
    setFacilities(prev =>
      prev.map(f =>
        f.id === facilityId
          ? { ...f, isActive, currentOpenings, updatedAt: new Date().toISOString() }
          : f
      )
    )
  }, [])

  const createApplicant = useCallback((name: string, age: number, careNeeds: string): Applicant => {
    const newApplicant: Applicant = {
      id: `ap${Date.now()}`,
      rpId: user?.id ?? "",
      name,
      age,
      careNeeds,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }
    setApplicants(prev => [...prev, newApplicant])
    return newApplicant
  }, [user?.id])

  const submitApplication = useCallback((rcfId: string, applicantId: string) => {
    const newApplication: Application = {
      id: `a${Date.now()}`,
      rcfId,
      applicantId,
      rpId: user?.id ?? "",
      submittedAt: null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }
    setApplications(prev => [...prev, newApplication])
  }, [user?.id])

  const updateApplicationStatus = useCallback((applicationId: string, status: "PENDING" | "SUBMITTED") => {
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId ? { ...a, status } : a
      )
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        userOrgId,
        isLoggedIn: !!user,
        facilities,
        applications,
        applicants,
        login,
        logout,
        completeProfile,
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
