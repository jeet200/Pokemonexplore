"use client"

import { useState } from "react"
import { useFavoritesContext } from "@/contexts/favorites-context"
import { PokemonCard } from "@/components/pokemon-card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, clearAllFavorites } = useFavoritesContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<string>("id-asc")

  const filteredFavorites = favorites.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (sortOption === "id-asc") return a.id - b.id
    if (sortOption === "id-desc") return b.id - a.id
    if (sortOption === "name-asc") return a.name.localeCompare(b.name)
    if (sortOption === "name-desc") return b.name.localeCompare(a.name)
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Favorite Pokémon</h1>
        <Button onClick={() => router.push("/")}>Back to All Pokémon</Button>
      </div>

      {favorites.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Sort by:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id-asc">ID (Ascending)</SelectItem>
                    <SelectItem value="id-desc">ID (Descending)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="destructive" onClick={clearAllFavorites} size="sm">
                Clear All
              </Button>
            </div>
          </div>

          {sortedFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedFavorites.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No favorites match your search.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't added any Pokémon to your favorites list.</p>
          <Button onClick={() => router.push("/")}>Explore Pokémon</Button>
        </div>
      )}
    </div>
  )
}
