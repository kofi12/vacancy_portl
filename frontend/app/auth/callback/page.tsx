'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storeToken, decodeToken } from '@/lib/auth'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.replace('/')
      return
    }
    const payload = decodeToken(token)
    if (!payload) {
      router.replace('/')
      return
    }
    storeToken(token)
    router.replace('/')
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[--color-text-mute]">Signing you in…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  )
}
