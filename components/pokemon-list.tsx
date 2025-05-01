"use client"

import { useState, useEffect, useMemo } from "react"
import { usePokemonContext } from "@/contexts/pokemon-context"
import { PokemonCard } from "@/components/pokemon-card"
import { Pagination } from "@/components/pagination"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Input } from "@/components/ui/input"
import type { Pokemon } from "@/types/pokemon"

interface PokemonListProps {
  selectedTypes: string[]
  sortOption: string
  itemsPerPage: number
}

export function PokemonList({ selectedTypes, sortOption, itemsPerPage }: PokemonListProps) {
  const { allPokemon, isLoading } = usePokemonContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTypes, sortOption, itemsPerPage, searchTerm])

  // Filter and sort pokemon
  const filteredAndSortedPokemon = useMemo(() => {
    if (!allPokemon) return []

    // First filter by search term
    let filtered = allPokemon.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Then filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((pokemon) =>
        selectedTypes.every((type) => pokemon.types.some((t) => t.type.name === type)),
      )
    }

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      if (sortOption === "id-asc") return a.id - b.id
      if (sortOption === "id-desc") return b.id - a.id
      if (sortOption === "name-asc") return a.name.localeCompare(b.name)
      if (sortOption === "name-desc") return b.name.localeCompare(a.name)
      return 0
    })
  }, [allPokemon, searchTerm, selectedTypes, sortOption])

  // Paginate the results
  const paginatedPokemon = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedPokemon.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedPokemon, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedPokemon.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <Input
          placeholder="Search Pokémon by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {filteredAndSortedPokemon.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedPokemon.map((pokemon: Pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Pokémon found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
