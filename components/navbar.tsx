"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Heart, BarChart2, Home } from "lucide-react"
import { useFavoritesContext } from "@/contexts/favorites-context"

export function Navbar() {
  const pathname = usePathname()
  const { favorites } = useFavoritesContext()

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/favorites",
      label: `Favorites (${favorites.length})`,
      icon: <Heart className="h-4 w-4 mr-2" />,
      active: pathname === "/favorites",
    },
    {
      href: "/compare",
      label: "Compare",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      active: pathname === "/compare",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Pokémon Explorer</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-2 lg:space-x-3 ml-auto">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant={item.active ? "default" : "ghost"} size="sm">
              <Link href={item.href} className="flex items-center">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
