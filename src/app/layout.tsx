import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "Amir & Rojda — Simulateur mariage",
  description: "Simulateur de scénarios pour planifier votre mariage de rêve",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
