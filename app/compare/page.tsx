"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PokemonSelect } from "@/components/pokemon-select"
import { PokemonComparison } from "@/components/pokemon-comparison"
import { usePokemonContext } from "@/contexts/pokemon-context"
import type { Pokemon } from "@/types/pokemon"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ComparePage() {
  const router = useRouter()
  const { fetchPokemonById, allPokemon, isLoading } = usePokemonContext()

  const [firstPokemonId, setFirstPokemonId] = useState<string>("")
  const [secondPokemonId, setSecondPokemonId] = useState<string>("")
  const [firstPokemon, setFirstPokemon] = useState<Pokemon | null>(null)
  const [secondPokemon, setSecondPokemon] = useState<Pokemon | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    const loadPokemonDetails = async () => {
      setIsLoadingDetails(true)

      if (firstPokemonId) {
        const pokemon = await fetchPokemonById(firstPokemonId)
        setFirstPokemon(pokemon)
      } else {
        setFirstPokemon(null)
      }

      if (secondPokemonId) {
        const pokemon = await fetchPokemonById(secondPokemonId)
        setSecondPokemon(pokemon)
      } else {
        setSecondPokemon(null)
      }

      setIsLoadingDetails(false)
    }

    loadPokemonDetails()
  }, [firstPokemonId, secondPokemonId, fetchPokemonById])

  const handleRandomComparison = () => {
    if (!allPokemon || allPokemon.length < 2) return

    const getRandomId = () => {
      const randomIndex = Math.floor(Math.random() * allPokemon.length)
      return allPokemon[randomIndex].id.toString()
    }

    const first = getRandomId()
    let second = getRandomId()

    // Make sure we don't get the same Pokémon twice
    while (first === second) {
      second = getRandomId()
    }

    setFirstPokemonId(first)
    setSecondPokemonId(second)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Compare Pokémon</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/")}>Back to All Pokémon</Button>
          <Button onClick={handleRandomComparison}>Random Comparison</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">First Pokémon</h2>
          <PokemonSelect value={firstPokemonId} onChange={setFirstPokemonId} placeholder="Select first Pokémon" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Second Pokémon</h2>
          <PokemonSelect value={secondPokemonId} onChange={setSecondPokemonId} placeholder="Select second Pokémon" />
        </div>
      </div>

      {isLoadingDetails ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {firstPokemon && secondPokemon ? (
            <PokemonComparison firstPokemon={firstPokemon} secondPokemon={secondPokemon} />
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Select two Pokémon to compare their stats and abilities.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
