"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePokemonSearch } from "@/hooks/use-pokemon-search"
import { PokemonSearchResults } from "./pokemon-search-results"

interface PokemonSearchBarProps {
  onSelectPokemon?: (pokemonId: string) => void
  placeholder?: string
  className?: string
}

export function PokemonSearchBar({
  onSelectPokemon,
  placeholder = "Search Pokémon...",
  className = "",
}: PokemonSearchBarProps) {
  const { query, setQuery, results, isLoading, error } = usePokemonSearch()
  const [isFocused, setIsFocused] = useState(false)

  const handleSelectPokemon = (pokemonId: string) => {
    setQuery("")
    onSelectPokemon?.(pokemonId)
  }

  const handleClearSearch = () => {
    setQuery("")
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding results to allow for clicking on them
            setTimeout(() => setIsFocused(false), 200)
          }}
          className="pl-10 pr-10"
          aria-label="Search Pokémon"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isFocused && query && (
        <PokemonSearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          onSelectPokemon={handleSelectPokemon}
        />
      )}
    </div>
  )
}
