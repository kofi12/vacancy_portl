"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type UserRole = "owner" | "referrer"

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
  status: "open" | "full"
  bedCount: number
  availableBeds: number
  notes: string
  lastUpdated: string
  phone: string
}

export interface InterestRecord {
  id: string
  facilityId: string
  facilityName: string
  referrerId: string
  referrerName: string
  referrerEmail: string
  referrerPhone: string
  applicantName: string
  applicantAge: string
  applicantNeeds: string
  contactNotes: string
  submittedAt: string
  followedUp: boolean
  followedUpAt?: string
}

interface AppContextType {
  user: User | null
  isLoggedIn: boolean
  facilities: Facility[]
  interests: InterestRecord[]
  login: (role: UserRole) => void
  logout: () => void
  completeProfile: (data: Partial<User>) => void
  updateFacilityStatus: (facilityId: string, status: "open" | "full", availableBeds: number, notes: string) => void
  registerInterest: (data: Omit<InterestRecord, "id" | "submittedAt" | "followedUp">) => void
  followUp: (interestId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "Sunrise Gardens RCF",
    address: "142 Oak Lane, Springfield",
    ownerId: "owner1",
    ownerName: "Maria Chen",
    status: "open",
    bedCount: 6,
    availableBeds: 2,
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
    status: "full",
    bedCount: 4,
    availableBeds: 0,
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
    status: "full",
    bedCount: 6,
    availableBeds: 0,
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
    status: "open",
    bedCount: 5,
    availableBeds: 1,
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
    status: "open",
    bedCount: 4,
    availableBeds: 3,
    notes: "Multiple beds available. Recently renovated.",
    lastUpdated: new Date(Date.now() - 10 * 60000).toISOString(),
    phone: "(555) 567-8901",
  },
]

const MOCK_INTERESTS: InterestRecord[] = [
  {
    id: "i1",
    facilityId: "f2",
    facilityName: "Maplewood Care Home",
    referrerId: "ref1",
    referrerName: "Sarah Johnson",
    referrerEmail: "sarah.johnson@hospital.org",
    referrerPhone: "(555) 111-2222",
    applicantName: "Dorothy Miller",
    applicantAge: "78",
    applicantNeeds: "Requires daily medication management and mobility assistance",
    contactNotes: "Preferred contact in the morning",
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    followedUp: false,
  },
  {
    id: "i2",
    facilityId: "f2",
    facilityName: "Maplewood Care Home",
    referrerId: "ref2",
    referrerName: "Michael Torres",
    referrerEmail: "m.torres@socialservices.gov",
    referrerPhone: "(555) 333-4444",
    applicantName: "Harold Simpson",
    applicantAge: "82",
    applicantNeeds: "Mild cognitive impairment, ambulatory",
    contactNotes: "Urgent placement needed within 30 days",
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    followedUp: true,
    followedUpAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "i3",
    facilityId: "f3",
    facilityName: "Harmony House",
    referrerId: "ref3",
    referrerName: "Linda Park",
    referrerEmail: "l.park@countyhealth.org",
    referrerPhone: "(555) 555-6666",
    applicantName: "George Washington",
    applicantAge: "75",
    applicantNeeds: "Needs wheelchair-accessible room, dietary restrictions",
    contactNotes: "Available weekdays 9-5 only",
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    followedUp: false,
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES)
  const [interests, setInterests] = useState<InterestRecord[]>(MOCK_INTERESTS)

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
        id: "ref-new",
        name: "Alex Rivera",
        email: "alex.rivera@hospital.org",
        role: "referrer",
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

  const updateFacilityStatus = useCallback((facilityId: string, status: "open" | "full", availableBeds: number, notes: string) => {
    setFacilities(prev =>
      prev.map(f =>
        f.id === facilityId
          ? { ...f, status, availableBeds, notes, lastUpdated: new Date().toISOString() }
          : f
      )
    )
  }, [])

  const registerInterest = useCallback((data: Omit<InterestRecord, "id" | "submittedAt" | "followedUp">) => {
    const newInterest: InterestRecord = {
      ...data,
      id: `i${Date.now()}`,
      submittedAt: new Date().toISOString(),
      followedUp: false,
    }
    setInterests(prev => [...prev, newInterest])
  }, [])

  const followUp = useCallback((interestId: string) => {
    setInterests(prev =>
      prev.map(i =>
        i.id === interestId
          ? { ...i, followedUp: true, followedUpAt: new Date().toISOString() }
          : i
      )
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        facilities,
        interests,
        login,
        logout,
        completeProfile,
        updateFacilityStatus,
        registerInterest,
        followUp,
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
