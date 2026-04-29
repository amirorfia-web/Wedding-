import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Amir & Fiancée — Simulateur mariage",
  description: "Simulateur de scénarios pour planifier votre mariage de rêve",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  )
}
