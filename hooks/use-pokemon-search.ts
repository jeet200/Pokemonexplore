"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { pokemonApi } from "@/lib/api/pokemon-api"
import type { Pokemon } from "@/types/pokemon"

export function usePokemonSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Debounce the search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    // Don't search if query is empty
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const searchPokemon = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // First try to get an exact match by name
        try {
          const pokemon = await pokemonApi.getPokemonByName(debouncedQuery.toLowerCase())
          if (pokemon) {
            setResults([pokemon])
            setIsLoading(false)
            return
          }
        } catch (e) {
          // If no exact match, continue to search in the list
        }

        // Get a list of Pokémon and filter by name
        const response = await pokemonApi.getPokemonList(100, 0)

        // Get the Pokémon that match the query
        const matchingPokemon = response.results.filter((p: { name: string }) =>
          p.name.includes(debouncedQuery.toLowerCase()),
        )

        // Fetch detailed data for each matching Pokémon
        const detailedResults = await Promise.all(
          matchingPokemon.slice(0, 5).map(async (p: { name: string }) => {
            return await pokemonApi.getPokemonByName(p.name)
          }),
        )

        setResults(detailedResults)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to search Pokémon"))
        console.error("Error searching Pokémon:", err)
      } finally {
        setIsLoading(false)
      }
    }

    searchPokemon()
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  }
}
