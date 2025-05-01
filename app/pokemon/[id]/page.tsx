"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePokemonDetail } from "@/hooks/use-pokemon-detail"
import { PokemonDetailView } from "@/components/pokemon-detail-view"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function PokemonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""

  const { pokemon, isLoading, error, species, evolutionChain, previousPokemonId, nextPokemonId } = usePokemonDetail(id)

  useEffect(() => {
    if (error) {
      console.error("Error loading Pokémon:", error)
    }
  }, [error])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error Loading Pokémon</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the Pokémon you're looking for.</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to List
        </Button>

        <div className="flex gap-2">
          {previousPokemonId && (
            <Button variant="outline" onClick={() => router.push(`/pokemon/${previousPokemonId}`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}

          {nextPokemonId && (
            <Button variant="outline" onClick={() => router.push(`/pokemon/${nextPokemonId}`)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <PokemonDetailView pokemon={pokemon} species={species} evolutionChain={evolutionChain} />
    </div>
  )
}
