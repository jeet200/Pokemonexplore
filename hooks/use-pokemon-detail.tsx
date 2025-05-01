"use client"

import { useState, useEffect } from "react"
import type { Pokemon, PokemonSpecies, EvolutionChain } from "@/types/pokemon"

export function usePokemonDetail(id: string) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [previousPokemonId, setPreviousPokemonId] = useState<string | null>(null)
  const [nextPokemonId, setNextPokemonId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch basic Pokémon data
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        if (!pokemonResponse.ok) throw new Error(`Failed to fetch Pokémon with ID: ${id}`)
        const pokemonData: Pokemon = await pokemonResponse.json()
        setPokemon(pokemonData)

        // Set previous and next Pokémon IDs
        const currentId = Number.parseInt(id)
        setPreviousPokemonId(currentId > 1 ? (currentId - 1).toString() : null)
        setNextPokemonId((currentId + 1).toString()) // Assuming we don't know the max ID

        // Fetch species data
        const speciesResponse = await fetch(pokemonData.species.url)
        if (!speciesResponse.ok) throw new Error(`Failed to fetch species data for Pokémon: ${id}`)
        const speciesData: PokemonSpecies = await speciesResponse.json()
        setSpecies(speciesData)

        // Fetch evolution chain
        if (speciesData.evolution_chain?.url) {
          const evolutionResponse = await fetch(speciesData.evolution_chain.url)
          if (!evolutionResponse.ok) throw new Error(`Failed to fetch evolution chain for Pokémon: ${id}`)
          const evolutionData: EvolutionChain = await evolutionResponse.json()
          setEvolutionChain(evolutionData)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch Pokémon details"))
        console.error("Error fetching Pokémon details:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPokemonDetail()
  }, [id])

  return {
    pokemon,
    species,
    evolutionChain,
    isLoading,
    error,
    previousPokemonId,
    nextPokemonId,
  }
}
