import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { PWARegister } from "@/components/PWARegister"
import { CookieBanner } from "@/components/gdpr/CookieBanner"
import { InstallBanner } from "@/components/pwa/InstallBanner"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "R+R",
  description: "Premium sports supplements",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "R+R",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark bg-zinc-950 h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-zinc-950 text-zinc-50 min-h-full flex flex-col">
        {children}
        <Toaster />
        <CookieBanner />
        <InstallBanner />
        <PWARegister />
      </body>
    </html>
  )
}
