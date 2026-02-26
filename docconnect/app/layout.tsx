import type { Metadata, Viewport } from "next"
import { Newsreader, Noto_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/Providers"

// ── Stitch fonts (downloaded at build-time, served locally) ──────────────────
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
})

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "DocConnect — Nigerian Telemedicine",
    template: "%s | DocConnect",
  },
  description:
    "Connect with MDCN-verified doctors in Nigeria. Get medical consultations from anywhere, anytime.",
  keywords: ["telemedicine", "Nigeria", "doctor", "healthcare", "MDCN", "online doctor"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocConnect",
  },
  openGraph: {
    title: "DocConnect — Nigerian Telemedicine",
    description: "Connect with MDCN-verified doctors in Nigeria.",
    type: "website",
    locale: "en_NG",
  },
}

export const viewport: Viewport = {
  themeColor: "#0C6B4E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${notoSans.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
