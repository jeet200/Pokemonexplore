"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { usePokemonContext } from "@/contexts/pokemon-context"
import type { EvolutionChain } from "@/types/pokemon"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"

interface PokemonEvolutionChainProps {
  evolutionChain: EvolutionChain
  currentPokemonId: number
}

interface EvolutionStage {
  id: number
  name: string
  sprite: string | null
  minLevel: number | null
  trigger: string | null
  item: string | null
}

export function PokemonEvolutionChain({ evolutionChain, currentPokemonId }: PokemonEvolutionChainProps) {
  const { fetchPokemonByName } = usePokemonContext()
  const [evolutionStages, setEvolutionStages] = useState<EvolutionStage[][]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const extractEvolutionData = async () => {
      setIsLoading(true)

      try {
        const stages: EvolutionStage[][] = []
        let currentChain = evolutionChain.chain

        // Process the first Pokémon in the chain
        const basePokemon = await fetchPokemonByName(currentChain.species.name)
        if (!basePokemon) throw new Error("Failed to fetch base Pokémon")

        const baseStage: EvolutionStage[] = [
          {
            id: basePokemon.id,
            name: basePokemon.name,
            sprite: basePokemon.sprites.other["official-artwork"].front_default || basePokemon.sprites.front_default,
            minLevel: null,
            trigger: null,
            item: null,
          },
        ]
        stages.push(baseStage)

        // Process evolution chains
        while (currentChain.evolves_to.length > 0) {
          const stageEvolutions: EvolutionStage[] = []

          for (const evolution of currentChain.evolves_to) {
            const pokemon = await fetchPokemonByName(evolution.species.name)
            if (!pokemon) continue

            const evolutionDetails = evolution.evolution_details[0] || {}

            stageEvolutions.push({
              id: pokemon.id,
              name: pokemon.name,
              sprite: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
              minLevel: evolutionDetails.min_level || null,
              trigger: evolutionDetails.trigger?.name || null,
              item: evolutionDetails.item?.name || null,
            })
          }

          if (stageEvolutions.length > 0) {
            stages.push(stageEvolutions)
          }

          // Move to the next evolution in the chain
          // For simplicity, we'll follow the first branch if there are multiple
          currentChain = currentChain.evolves_to[0]
        }

        setEvolutionStages(stages)
      } catch (error) {
        console.error("Error processing evolution chain:", error)
      } finally {
        setIsLoading(false)
      }
    }

    extractEvolutionData()
  }, [evolutionChain, fetchPokemonByName])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (evolutionStages.length === 0) {
    return <p className="text-muted-foreground">No evolution data available.</p>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center items-center gap-4">
        {evolutionStages.map((stage, stageIndex) => (
          <div key={stageIndex} className="flex items-center">
            {/* Evolution stage */}
            <div className="flex flex-wrap justify-center gap-4">
              {stage.map((pokemon) => (
                <Link
                  key={pokemon.id}
                  href={`/pokemon/${pokemon.id}`}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg transition-all",
                    pokemon.id === currentPokemonId ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  {pokemon.sprite ? (
                    <Image
                      src={pokemon.sprite || "/placeholder.svg"}
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">
                        {pokemon.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-sm font-medium mt-2 capitalize">{pokemon.name.replace("-", " ")}</div>
                  <div className="text-xs text-muted-foreground">#{pokemon.id.toString().padStart(3, "0")}</div>
                </Link>
              ))}
            </div>

            {/* Arrow to next stage */}
            {stageIndex < evolutionStages.length - 1 && (
              <div className="flex flex-col items-center mx-2 sm:mx-4">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
                {evolutionStages[stageIndex + 1][0].minLevel && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Level {evolutionStages[stageIndex + 1][0].minLevel}
                  </div>
                )}
                {evolutionStages[stageIndex + 1][0].item && (
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {evolutionStages[stageIndex + 1][0].item.replace("-", " ")}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
