"use client"

import { useEffect, useState, ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ClientOnly component that ensures its children are only rendered on the client-side
 * to prevent hydration mismatches with components that use browser-specific APIs.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // Set hasMounted to true only after the component has mounted on the client
    setHasMounted(true)
  }, [])

  // Only render children after the component has mounted on the client
  // This ensures no hydration mismatch between server and client
  if (!hasMounted) {
    return <>{fallback}</>
  }

  // Use a key to force a fresh client-side render
  return <div key="client-only-wrapper">{children}</div>
}

