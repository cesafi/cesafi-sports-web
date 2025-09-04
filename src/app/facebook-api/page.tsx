"use client"

import dynamic from 'next/dynamic'

// Dynamically import the FacebookEmbedClient component with SSR disabled
const FacebookEmbedClient = dynamic(
    () => import('@/components/FacebookEmbedClient'),
    {
        ssr: false,
        loading: () => <div className="w-[550px] h-[400px] bg-gray-200 animate-pulse rounded-md">Loading Facebook embed...</div>
    }
)

export default function Page() {
    return (
        <div className="flex justify-center p-4">
            <FacebookEmbedClient url="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02A3w8fRCrryCUCJ4R9LargdjRbRH2GG8foBV4Gk5dFAUFRCSk9i1d4SrYdxKzz4Zal%26id%3D61579246245906&show_text=true&width=500" width={550} />
        </div>
    )

}

