export interface PokemonListFilters {
  types: string[]
  sortBy: "id-asc" | "id-desc" | "name-asc" | "name-desc"
  itemsPerPage: number
  searchTerm: string
}

export interface PokemonListState extends PokemonListFilters {
  currentPage: number
  setPage: (page: number) => void
  setFilters: (filters: Partial<PokemonListFilters>) => void
  resetFilters: () => void
}
