"use client"

import { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PokemonCardImage } from "./pokemon-card-image"
import { PokemonCardHeader } from "./pokemon-card-header"
import { PokemonCardTypes } from "./pokemon-card-types"
import { PokemonCardFavorite } from "./pokemon-card-favorite"
import type { Pokemon } from "@/types/pokemon"

interface PokemonCardProps {
  pokemon: Pokemon
  showFavoriteButton?: boolean
  size?: "sm" | "md" | "lg"
}

// Using memo with custom equality check for better performance
export const PokemonCard = memo(
  function PokemonCard({ pokemon, showFavoriteButton = true, size = "md" }: PokemonCardProps) {
    const { id, name, types } = pokemon

    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <Link href={`/pokemon/${id}`} className="block">
          <div className="pt-6 px-6 flex justify-center">
            <PokemonCardImage
              sprite={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
              name={name}
              size={size === "sm" ? 80 : size === "md" ? 120 : 160}
            />
          </div>
          <CardContent className="p-6">
            <PokemonCardHeader id={id} name={name} />
            <PokemonCardTypes types={types} />
          </CardContent>
        </Link>
        {showFavoriteButton && (
          <CardFooter className="p-4 pt-0 flex justify-end">
            <PokemonCardFavorite id={id} pokemon={pokemon} />
          </CardFooter>
        )}
      </Card>
    )
  },
  // Custom equality function for memoization
  (prevProps, nextProps) => {
    // Only re-render if the pokemon ID changes or favorite status might have changed
    return (
      prevProps.pokemon.id === nextProps.pokemon.id &&
      prevProps.showFavoriteButton === nextProps.showFavoriteButton &&
      prevProps.size === nextProps.size
    )
  },
)
