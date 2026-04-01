"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type UserRole = "owner" | "rp"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organization?: string
  phone?: string
  profileCompleted: boolean
}

export interface Facility {
  id: string
  name: string
  address: string
  ownerId: string
  ownerName: string
  isActive: boolean
  licensedBeds: number
  currentOpenings: number
  notes: string
  lastUpdated: string
  phone: string
}

export interface Application {
  id: string
  rcfId: string
  rcfName: string
  rpId: string
  rpName: string
  rpEmail: string
  rpPhone: string
  applicantName: string
  applicantAge: string
  applicantNeeds: string
  contactNotes: string
  submittedAt: string
  status: "PENDING" | "SUBMITTED"
}

interface AppContextType {
  user: User | null
  isLoggedIn: boolean
  facilities: Facility[]
  applications: Application[]
  login: (role: UserRole) => void
  logout: () => void
  completeProfile: (data: Partial<User>) => void
  updateFacilityStatus: (facilityId: string, isActive: boolean, currentOpenings: number, notes: string) => void
  submitApplication: (data: Omit<Application, "id" | "submittedAt" | "status">) => void
  updateApplicationStatus: (applicationId: string, status: "PENDING" | "SUBMITTED") => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "Sunrise Gardens RCF",
    address: "142 Oak Lane, Springfield",
    ownerId: "owner1",
    ownerName: "Maria Chen",
    isActive: true,
    licensedBeds: 6,
    currentOpenings: 2,
    notes: "Two beds available in shared room. Accepting ambulatory residents.",
    lastUpdated: new Date(Date.now() - 2 * 60000).toISOString(),
    phone: "(555) 123-4567",
  },
  {
    id: "f2",
    name: "Maplewood Care Home",
    address: "88 Elm Street, Riverside",
    ownerId: "owner2",
    ownerName: "James Okafor",
    isActive: true,
    licensedBeds: 4,
    currentOpenings: 0,
    notes: "Currently full. Expecting a vacancy in approximately 2 weeks.",
    lastUpdated: new Date(Date.now() - 15 * 60000).toISOString(),
    phone: "(555) 234-5678",
  },
  {
    id: "f3",
    name: "Harmony House",
    address: "310 Birch Drive, Lakeview",
    ownerId: "owner3",
    ownerName: "Patricia Williams",
    isActive: true,
    licensedBeds: 6,
    currentOpenings: 0,
    notes: "No vacancies. Waitlist active.",
    lastUpdated: new Date(Date.now() - 45 * 60000).toISOString(),
    phone: "(555) 345-6789",
  },
  {
    id: "f4",
    name: "Valley View Residence",
    address: "55 Maple Court, Greenfield",
    ownerId: "owner4",
    ownerName: "Robert Martinez",
    isActive: true,
    licensedBeds: 5,
    currentOpenings: 1,
    notes: "One private room available. Wheelchair accessible.",
    lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(),
    phone: "(555) 456-7890",
  },
  {
    id: "f5",
    name: "Pinecrest Care Facility",
    address: "200 Pine Ridge Road, Oakdale",
    ownerId: "owner1",
    ownerName: "Maria Chen",
    isActive: true,
    licensedBeds: 4,
    currentOpenings: 3,
    notes: "Multiple beds available. Recently renovated.",
    lastUpdated: new Date(Date.now() - 10 * 60000).toISOString(),
    phone: "(555) 567-8901",
  },
]

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    rcfId: "f2",
    rcfName: "Maplewood Care Home",
    rpId: "rp1",
    rpName: "Sarah Johnson",
    rpEmail: "sarah.johnson@hospital.org",
    rpPhone: "(555) 111-2222",
    applicantName: "Dorothy Miller",
    applicantAge: "78",
    applicantNeeds: "Requires daily medication management and mobility assistance",
    contactNotes: "Preferred contact in the morning",
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "PENDING",
  },
  {
    id: "a2",
    rcfId: "f2",
    rcfName: "Maplewood Care Home",
    rpId: "rp2",
    rpName: "Michael Torres",
    rpEmail: "m.torres@socialservices.gov",
    rpPhone: "(555) 333-4444",
    applicantName: "Harold Simpson",
    applicantAge: "82",
    applicantNeeds: "Mild cognitive impairment, ambulatory",
    contactNotes: "Urgent placement needed within 30 days",
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "SUBMITTED",
  },
  {
    id: "a3",
    rcfId: "f3",
    rcfName: "Harmony House",
    rpId: "rp3",
    rpName: "Linda Park",
    rpEmail: "l.park@countyhealth.org",
    rpPhone: "(555) 555-6666",
    applicantName: "George Washington",
    applicantAge: "75",
    applicantNeeds: "Needs wheelchair-accessible room, dietary restrictions",
    contactNotes: "Available weekdays 9-5 only",
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: "PENDING",
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)

  const login = useCallback((role: UserRole) => {
    if (role === "owner") {
      setUser({
        id: "owner1",
        name: "Maria Chen",
        email: "maria.chen@sunrisegardens.com",
        role: "owner",
        organization: "Sunrise Gardens RCF",
        phone: "(555) 123-4567",
        profileCompleted: true,
      })
    } else {
      setUser({
        id: "rp-new",
        name: "Alex Rivera",
        email: "alex.rivera@hospital.org",
        role: "rp",
        organization: "",
        phone: "",
        profileCompleted: false,
      })
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const completeProfile = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data, profileCompleted: true } : null)
  }, [])

  const updateFacilityStatus = useCallback((facilityId: string, isActive: boolean, currentOpenings: number, notes: string) => {
    setFacilities(prev =>
      prev.map(f =>
        f.id === facilityId
          ? { ...f, isActive, currentOpenings, notes, lastUpdated: new Date().toISOString() }
          : f
      )
    )
  }, [])

  const submitApplication = useCallback((data: Omit<Application, "id" | "submittedAt" | "status">) => {
    const newApplication: Application = {
      ...data,
      id: `a${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "PENDING",
    }
    setApplications(prev => [...prev, newApplication])
  }, [])

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
        isLoggedIn: !!user,
        facilities,
        applications,
        login,
        logout,
        completeProfile,
        updateFacilityStatus,
        submitApplication,
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
