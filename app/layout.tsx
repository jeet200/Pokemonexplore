import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { PokemonProvider } from "@/contexts/pokemon-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Navbar } from "@/components/navbar"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Pokémon Explorer",
  description: "Explore the world of Pokémon with advanced features",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <PokemonProvider>
              <FavoritesProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
                  <footer className="py-6 border-t">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                      Pokémon Explorer &copy; {new Date().getFullYear()}
                    </div>
                  </footer>
                </div>
              </FavoritesProvider>
            </PokemonProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
