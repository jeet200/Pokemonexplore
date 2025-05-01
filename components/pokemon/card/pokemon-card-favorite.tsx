"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavoritesContext } from "@/contexts/favorites-context"
import type { Pokemon } from "@/types/pokemon"

interface PokemonCardFavoriteProps {
  id: number
  pokemon: Pokemon
}

export function PokemonCardFavorite({ id, pokemon }: PokemonCardFavoriteProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const isFav = isFavorite(id)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault() // Prevent navigation when clicking the button
        toggleFavorite(pokemon)
      }}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("h-5 w-5", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
    </Button>
  )
}
