"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createPokemonRepository, type PokemonRepository } from "@/lib/data-layer/pokemon-repository"
import type { Pokemon, PokemonSpecies, EvolutionChain } from "@/types/pokemon"
import { markStart, markEnd } from "@/lib/performance"

interface PokemonContextType {
  allPokemon: Pokemon[] | null
  isLoading: boolean
  error: Error | null
  fetchPokemonById: (id: string) => Promise<Pokemon | null>
  fetchPokemonByName: (name: string) => Promise<Pokemon | null>
  fetchPokemonSpecies: (id: string) => Promise<PokemonSpecies | null>
  fetchEvolutionChain: (url: string) => Promise<EvolutionChain | null>
  getRandomPokemonId: () => number
  refreshData: () => Promise<void>
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined)

interface PokemonProviderProps {
  children: ReactNode
  repository?: PokemonRepository
  initialData?: {
    pokemon?: Pokemon[]
  }
}

export function PokemonProvider({ children, repository, initialData }: PokemonProviderProps) {
  // Use provided repository or create default one
  const pokemonRepository = repository || createPokemonRepository("api")

  const [allPokemon, setAllPokemon] = useState<Pokemon[] | null>(initialData?.pokemon || null)
  const [isLoading, setIsLoading] = useState(!initialData?.pokemon)
  const [error, setError] = useState<Error | null>(null)

  // Fetch all Pokémon basic data
  const fetchAllPokemon = useCallback(async () => {
    try {
      markStart("fetch_all_pokemon")
      setIsLoading(true)
      setError(null)

      const pokemon = await pokemonRepository.getAllPokemon(151, 0)
      setAllPokemon(pokemon)

      markEnd("fetch_all_pokemon")
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch Pokémon data"))
      console.error("Error fetching Pokémon:", err)
    } finally {
      setIsLoading(false)
    }
  }, [pokemonRepository])

  // Initial data fetch
  useEffect(() => {
    if (!initialData?.pokemon) {
      fetchAllPokemon()
    }
  }, [fetchAllPokemon, initialData?.pokemon])

  // Fetch a specific Pokémon by ID
  const fetchPokemonById = useCallback(
    async (id: string): Promise<Pokemon | null> => {
      try {
        markStart(`fetch_pokemon_${id}`)
        const pokemon = await pokemonRepository.getPokemonById(id)
        markEnd(`fetch_pokemon_${id}`)
        return pokemon
      } catch (err) {
        console.error(`Error fetching Pokémon with ID ${id}:`, err)
        return null
      }
    },
    [pokemonRepository],
  )

  // Fetch a specific Pokémon by name
  const fetchPokemonByName = useCallback(
    async (name: string): Promise<Pokemon | null> => {
      try {
        markStart(`fetch_pokemon_${name}`)
        const pokemon = await pokemonRepository.getPokemonByName(name)
        markEnd(`fetch_pokemon_${name}`)
        return pokemon
      } catch (err) {
        console.error(`Error fetching Pokémon with name ${name}:`, err)
        return null
      }
    },
    [pokemonRepository],
  )

  // Fetch species data
  const fetchPokemonSpecies = useCallback(
    async (id: string): Promise<PokemonSpecies | null> => {
      try {
        markStart(`fetch_species_${id}`)
        const species = await pokemonRepository.getPokemonSpecies(id)
        markEnd(`fetch_species_${id}`)
        return species
      } catch (err) {
        console.error(`Error fetching species for Pokémon ${id}:`, err)
        return null
      }
    },
    [pokemonRepository],
  )

  // Fetch evolution chain
  const fetchEvolutionChain = useCallback(
    async (url: string): Promise<EvolutionChain | null> => {
      try {
        markStart(`fetch_evolution_chain`)
        const chain = await pokemonRepository.getEvolutionChain(url)
        markEnd(`fetch_evolution_chain`)
        return chain
      } catch (err) {
        console.error(`Error fetching evolution chain:`, err)
        return null
      }
    },
    [pokemonRepository],
  )

  // Get a random Pokémon ID
  const getRandomPokemonId = useCallback((): number => {
    if (!allPokemon || allPokemon.length === 0) return 1
    const randomIndex = Math.floor(Math.random() * allPokemon.length)
    return allPokemon[randomIndex].id
  }, [allPokemon])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchAllPokemon()
  }, [fetchAllPokemon])

  return (
    <PokemonContext.Provider
      value={{
        allPokemon,
        isLoading,
        error,
        fetchPokemonById,
        fetchPokemonByName,
        fetchPokemonSpecies,
        fetchEvolutionChain,
        getRandomPokemonId,
        refreshData,
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
