"use client"

import { useEffect, useState } from 'react'
import { FacebookEmbed } from 'react-social-media-embed'

interface FacebookEmbedClientProps {
  url: string
  width?: number
}

/**
 * A client-only component that renders the Facebook embed
 * This component completely isolates the Facebook embed from server rendering
 * to prevent hydration mismatches
 */
export default function FacebookEmbedClient({ url, width = 550 }: FacebookEmbedClientProps) {
  // Use state to control when to render the Facebook embed
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only render the Facebook embed after the component has mounted on the client
    setShouldRender(true)
  }, [])

  // Show loading state until client-side rendering is ready
  if (!shouldRender) {
    return (
      <div className="w-[550px] h-[400px] bg-gray-200 animate-pulse rounded-md">
        Loading Facebook post...
      </div>
    )
  }

  // Render the Facebook embed only on the client side
  return (
    <div key={`facebook-embed-${Date.now()}`}>
      <FacebookEmbed url={url} width={width} />
    </div>
  )
}

