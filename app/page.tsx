"use client"

import { useState } from "react"
import { PokemonList } from "@/components/pokemon-list"
import { PokemonFilters } from "@/components/pokemon-filters"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { usePokemonContext } from "@/contexts/pokemon-context"

export default function Home() {
  const router = useRouter()
  const { getRandomPokemonId } = usePokemonContext()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<string>("id-asc")
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)

  const handleRandomPokemon = () => {
    const randomId = getRandomPokemonId()
    router.push(`/pokemon/${randomId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Pokémon Explorer</h1>
        <Button onClick={handleRandomPokemon}>Random Pokémon</Button>
      </div>

      <PokemonFilters
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        sortOption={sortOption}
        setSortOption={setSortOption}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />

      <PokemonList selectedTypes={selectedTypes} sortOption={sortOption} itemsPerPage={itemsPerPage} />
    </div>
  )
}
