"use client"

import type React from "react"

import { useEffect, useMemo } from "react"
import { PokemonCard } from "@/components/pokemon/card/pokemon-card"
import { Pagination } from "@/components/pagination"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { usePokemonContext } from "@/contexts/pokemon-context-v2"
import { markStart, markEnd } from "@/lib/performance"
import type { Pokemon } from "@/types/pokemon"
import type { PokemonListState } from "@/features/pokemon-list/types"

interface PokemonListViewProps {
  listState: PokemonListState
}

export function PokemonListView({ listState }: PokemonListViewProps) {
  const { allPokemon, isLoading, error, refreshData } = usePokemonContext()

  const {
    types: selectedTypes,
    sortBy: sortOption,
    itemsPerPage,
    searchTerm,
    currentPage,
    setPage,
    setFilters,
  } = listState

  // Track render performance
  useEffect(() => {
    markStart("pokemon_list_render")
    return () => {
      markEnd("pokemon_list_render")
    }
  }, [])

  // Filter and sort pokemon
  const filteredAndSortedPokemon = useMemo(() => {
    markStart("filter_and_sort")

    if (!allPokemon) {
      markEnd("filter_and_sort")
      return []
    }

    // First filter by search term
    let filtered = allPokemon.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Then filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((pokemon) =>
        selectedTypes.every((type) => pokemon.types.some((t) => t.type.name === type)),
      )
    }

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "id-asc") return a.id - b.id
      if (sortOption === "id-desc") return b.id - a.id
      if (sortOption === "name-asc") return a.name.localeCompare(b.name)
      if (sortOption === "name-desc") return b.name.localeCompare(a.name)
      return 0
    })

    markEnd("filter_and_sort")
    return sorted
  }, [allPokemon, searchTerm, selectedTypes, sortOption])

  // Paginate the results
  const paginatedPokemon = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedPokemon.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedPokemon, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedPokemon.length / itemsPerPage)

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchTerm: e.target.value })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="max-w-md">
          <Input placeholder="Search Pokémon by name..." disabled className="w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Error Loading Pokémon</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={() => refreshData()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search Pokémon by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
            aria-label="Search Pokémon by name"
          />
        </div>

        <Button variant="outline" size="icon" onClick={() => refreshData()} aria-label="Refresh Pokémon data">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {filteredAndSortedPokemon.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            role="list"
            aria-label="Pokémon list"
          >
            {paginatedPokemon.map((pokemon: Pokemon) => (
              <div key={pokemon.id} role="listitem">
                <PokemonCard pokemon={pokemon} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            aria-label="Pagination"
          />
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg" role="status" aria-live="polite">
          <p className="text-muted-foreground">No Pokémon found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
