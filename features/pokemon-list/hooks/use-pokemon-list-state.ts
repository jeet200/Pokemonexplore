"use client"

import { useCallback, useReducer, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { PokemonListFilters, PokemonListState } from "../types"

// Initial state
const initialState: PokemonListFilters & { currentPage: number } = {
  types: [],
  sortBy: "id-asc",
  itemsPerPage: 20,
  searchTerm: "",
  currentPage: 1,
}

// Action types
type Action =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_FILTERS"; payload: Partial<PokemonListFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "SYNC_WITH_URL"; payload: Partial<PokemonListFilters & { currentPage: number }> }

// Reducer
function reducer(state: PokemonListFilters & { currentPage: number }, action: Action) {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, currentPage: action.payload }
    case "SET_FILTERS":
      // Reset to page 1 when filters change
      return { ...state, ...action.payload, currentPage: 1 }
    case "RESET_FILTERS":
      return { ...initialState, currentPage: 1 }
    case "SYNC_WITH_URL":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function usePokemonListState(): PokemonListState {
  const [state, dispatch] = useReducer(reducer, initialState)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    // Extract values from URL
    const page = params.get("page") ? Number.parseInt(params.get("page")!, 10) : initialState.currentPage
    const types = params.getAll("type")
    const sortBy = (params.get("sort") as PokemonListFilters["sortBy"]) || initialState.sortBy
    const itemsPerPage = params.get("limit") ? Number.parseInt(params.get("limit")!, 10) : initialState.itemsPerPage
    const searchTerm = params.get("search") || initialState.searchTerm

    // Update state from URL
    dispatch({
      type: "SYNC_WITH_URL",
      payload: {
        currentPage: page,
        types,
        sortBy,
        itemsPerPage,
        searchTerm,
      },
    })
  }, [searchParams])

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams()

    // Only add params that differ from defaults
    if (state.currentPage !== initialState.currentPage) {
      params.set("page", state.currentPage.toString())
    }

    state.types.forEach((type) => {
      params.append("type", type)
    })

    if (state.sortBy !== initialState.sortBy) {
      params.set("sort", state.sortBy)
    }

    if (state.itemsPerPage !== initialState.itemsPerPage) {
      params.set("limit", state.itemsPerPage.toString())
    }

    if (state.searchTerm) {
      params.set("search", state.searchTerm)
    }

    // Update URL
    const queryString = params.toString()
    const url = pathname + (queryString ? `?${queryString}` : "")

    router.replace(url, { scroll: false })
  }, [state, pathname, router])

  // Actions
  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", payload: page })
  }, [])

  const setFilters = useCallback((filters: Partial<PokemonListFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" })
  }, [])

  return {
    ...state,
    setPage,
    setFilters,
    resetFilters,
  }
}
