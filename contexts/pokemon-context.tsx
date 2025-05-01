"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Pokemon } from "@/types/pokemon"

interface PokemonContextType {
  allPokemon: Pokemon[] | null
  isLoading: boolean
  error: Error | null
  fetchPokemonById: (id: string) => Promise<Pokemon | null>
  fetchPokemonByName: (name: string) => Promise<Pokemon | null>
  getRandomPokemonId: () => number
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined)

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [allPokemon, setAllPokemon] = useState<Pokemon[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch all Pokémon basic data
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        setIsLoading(true)

        // Fetch the first 151 Pokémon (can be adjusted)
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
        const data = await response.json()

        // Fetch detailed data for each Pokémon
        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon: { name: string; url: string }) => {
            const detailResponse = await fetch(pokemon.url)
            return await detailResponse.json()
          }),
        )

        setAllPokemon(detailedPokemon)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch Pokémon data"))
        console.error("Error fetching Pokémon:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllPokemon()
  }, [])

  // Fetch a specific Pokémon by ID
  const fetchPokemonById = useCallback(async (id: string): Promise<Pokemon | null> => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!response.ok) throw new Error(`Failed to fetch Pokémon with ID: ${id}`)
      return await response.json()
    } catch (err) {
      console.error(`Error fetching Pokémon with ID ${id}:`, err)
      return null
    }
  }, [])

  // Fetch a specific Pokémon by name
  const fetchPokemonByName = useCallback(async (name: string): Promise<Pokemon | null> => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      if (!response.ok) throw new Error(`Failed to fetch Pokémon with name: ${name}`)
      return await response.json()
    } catch (err) {
      console.error(`Error fetching Pokémon with name ${name}:`, err)
      return null
    }
  }, [])

  // Get a random Pokémon ID
  const getRandomPokemonId = useCallback((): number => {
    if (!allPokemon || allPokemon.length === 0) return 1
    const randomIndex = Math.floor(Math.random() * allPokemon.length)
    return allPokemon[randomIndex].id
  }, [allPokemon])

  return (
    <PokemonContext.Provider
      value={{
        allPokemon,
        isLoading,
        error,
        fetchPokemonById,
        fetchPokemonByName,
        getRandomPokemonId,
      }}
    >
      {children}
    </PokemonContext.Provider>
  )
}

export function usePokemonContext() {
  const context = useContext(PokemonContext)
  if (context === undefined) {
    throw new Error("usePokemonContext must be used within a PokemonProvider")
  }
  return context
}
