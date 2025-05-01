"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Pokemon } from "@/types/pokemon"

interface FavoritesContextType {
  favorites: Pokemon[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (pokemon: Pokemon) => void
  clearAllFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Pokemon[]>([])

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem("pokemonFavorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error)
        localStorage.removeItem("pokemonFavorites")
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pokemonFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Check if a Pokémon is in favorites
  const isFavorite = (id: number): boolean => {
    return favorites.some((pokemon) => pokemon.id === id)
  }

  // Toggle a Pokémon in favorites
  const toggleFavorite = (pokemon: Pokemon) => {
    setFavorites((prevFavorites) => {
      if (isFavorite(pokemon.id)) {
        return prevFavorites.filter((p) => p.id !== pokemon.id)
      } else {
        return [...prevFavorites, pokemon]
      }
    })
  }

  // Clear all favorites
  const clearAllFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        clearAllFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider")
  }
  return context
}
