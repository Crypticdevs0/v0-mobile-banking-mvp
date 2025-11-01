import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Premier America Credit Union - Mobile Banking",
  description: "Modern Mobile Banking with Real-time Updates",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.className} bg-background text-foreground antialiased`}>
        {/* Global route transitions for all internal navigations */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        {/* The wrapper below provides fade/slide transitions and a top progress bar on redirects */}
        {typeof window === 'undefined' ? (
          children
        ) : (
          // Use a dynamic import-free client wrapper to avoid SSR mismatch
          // The RouteTransition component is client-only and will mount on the client
          // We guard with window check above so SSR still streams content without animation wrappers
          // This preserves original styles and only adds subtle transition effects
          // while keeping the DOM structure minimal.
          // @ts-expect-error - window check ensures client
          (require("@/components/common/route-transition").default as any)({ children })
        )}
      </body>
    </html>
  )
}
