"use client"

import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import Image from "next/image"
import type { Pokemon } from "@/types/pokemon"

interface PokemonSearchResultsProps {
  results: Pokemon[]
  isLoading: boolean
  error: Error | null
  onSelectPokemon: (pokemonId: string) => void
}

export function PokemonSearchResults({ results, isLoading, error, onSelectPokemon }: PokemonSearchResultsProps) {
  return (
    <Card className="absolute top-full mt-1 w-full z-50 max-h-80 overflow-auto">
      {isLoading ? (
        <div className="p-4 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-500">Error searching Pokémon: {error.message}</div>
      ) : results.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No Pokémon found matching your search.</div>
      ) : (
        <ul className="py-2">
          {results.map((pokemon) => (
            <li key={pokemon.id}>
              <button
                className="w-full px-4 py-2 hover:bg-muted flex items-center text-left"
                onClick={() => onSelectPokemon(pokemon.id.toString())}
              >
                <div className="w-10 h-10 mr-3 flex-shrink-0">
                  <Image
                    src={pokemon.sprites.front_default || "/placeholder.svg?height=40&width=40"}
                    alt={pokemon.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium capitalize">{pokemon.name}</div>
                  <div className="text-xs text-muted-foreground">#{pokemon.id.toString().padStart(3, "0")}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
