import { pokemonApi } from "../api/pokemon-api"
import type { Pokemon, PokemonSpecies, EvolutionChain } from "@/types/pokemon"

// Repository interface - defines the contract for data access
export interface PokemonRepository {
  getAllPokemon(limit?: number, offset?: number): Promise<Pokemon[]>
  getPokemonById(id: string): Promise<Pokemon | null>
  getPokemonByName(name: string): Promise<Pokemon | null>
  getPokemonSpecies(id: string): Promise<PokemonSpecies | null>
  getEvolutionChain(url: string): Promise<EvolutionChain | null>
}

// Concrete implementation using the PokeAPI
export class PokeApiRepository implements PokemonRepository {
  async getAllPokemon(limit = 151, offset = 0): Promise<Pokemon[]> {
    try {
      const response = await pokemonApi.getPokemonList(limit, offset)

      // Fetch detailed data for each Pokémon
      const detailedPokemon = await Promise.all(
        response.results.map(async (pokemon: { name: string; url: string }) => {
          return this.getPokemonByName(pokemon.name)
        }),
      )

      // Filter out any null results
      return detailedPokemon.filter((pokemon): pokemon is Pokemon => pokemon !== null)
    } catch (error) {
      console.error("Error fetching all Pokémon:", error)
      return []
    }
  }

  async getPokemonById(id: string): Promise<Pokemon | null> {
    try {
      return await pokemonApi.getPokemonById(id)
    } catch (error) {
      console.error(`Error fetching Pokémon with ID ${id}:`, error)
      return null
    }
  }

  async getPokemonByName(name: string): Promise<Pokemon | null> {
    try {
      return await pokemonApi.getPokemonByName(name)
    } catch (error) {
      console.error(`Error fetching Pokémon with name ${name}:`, error)
      return null
    }
  }

  async getPokemonSpecies(id: string): Promise<PokemonSpecies | null> {
    try {
      return await pokemonApi.getPokemonSpecies(id)
    } catch (error) {
      console.error(`Error fetching species for Pokémon ${id}:`, error)
      return null
    }
  }

  async getEvolutionChain(url: string): Promise<EvolutionChain | null> {
    try {
      return await pokemonApi.getEvolutionChain(url)
    } catch (error) {
      console.error(`Error fetching evolution chain:`, error)
      return null
    }
  }
}

// Mock repository for testing
export class MockPokemonRepository implements PokemonRepository {
  private mockPokemon: Pokemon[] = []
  private mockSpecies: Record<string, PokemonSpecies> = {}
  private mockEvolutionChains: Record<string, EvolutionChain> = {}

  constructor(mockData?: {
    pokemon?: Pokemon[]
    species?: Record<string, PokemonSpecies>
    evolutionChains?: Record<string, EvolutionChain>
  }) {
    if (mockData?.pokemon) this.mockPokemon = mockData.pokemon
    if (mockData?.species) this.mockSpecies = mockData.species
    if (mockData?.evolutionChains) this.mockEvolutionChains = mockData.evolutionChains
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    return this.mockPokemon
  }

  async getPokemonById(id: string): Promise<Pokemon | null> {
    return this.mockPokemon.find((p) => p.id.toString() === id) || null
  }

  async getPokemonByName(name: string): Promise<Pokemon | null> {
    return this.mockPokemon.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null
  }

  async getPokemonSpecies(id: string): Promise<PokemonSpecies | null> {
    return this.mockSpecies[id] || null
  }

  async getEvolutionChain(url: string): Promise<EvolutionChain | null> {
    // Extract ID from URL
    const matches = url.match(/\/evolution-chain\/(\d+)\//)
    const id = matches ? matches[1] : null

    return id ? this.mockEvolutionChains[id] || null : null
  }
}

// Factory to create the appropriate repository
export function createPokemonRepository(type: "api" | "mock" = "api", mockData?: any): PokemonRepository {
  if (type === "mock") {
    return new MockPokemonRepository(mockData)
  }
  return new PokeApiRepository()
}
