"use client"

import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavoritesContext } from "@/contexts/favorites-context"
import { cn } from "@/lib/utils"
import { typeColors } from "@/lib/type-colors"
import type { Pokemon, PokemonSpecies, EvolutionChain } from "@/types/pokemon"
import { PokemonEvolutionChain } from "@/components/pokemon-evolution-chain"

interface PokemonDetailViewProps {
  pokemon: Pokemon
  species: PokemonSpecies | null
  evolutionChain: EvolutionChain | null
}

export function PokemonDetailView({ pokemon, species, evolutionChain }: PokemonDetailViewProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const isFav = isFavorite(pokemon.id)

  const formattedId = `#${pokemon.id.toString().padStart(3, "0")}`
  const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  // Get description from species data
  const description =
    species?.flavor_text_entries?.find((entry) => entry.language.name === "en")?.flavor_text.replace(/\f/g, " ") ||
    "No description available."

  // Get genus from species data
  const genus = species?.genera?.find((g) => g.language.name === "en")?.genus || ""

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <Card className="overflow-hidden">
          <div className="bg-muted p-6 flex justify-center">
            <Image
              src={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              width={200}
              height={200}
              className="h-[200px] w-[200px] object-contain"
            />
          </div>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">{formattedId}</div>
            <h1 className="text-2xl font-bold mb-2">{formattedName}</h1>
            {genus && <p className="text-sm text-muted-foreground mb-4">{genus}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {pokemon.types.map(({ type }) => (
                <Badge
                  key={type.name}
                  variant="outline"
                  className={cn("capitalize", typeColors[type.name] || "border-gray-200")}
                >
                  {type.name}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Height</p>
                <p className="font-medium">{pokemon.height / 10} m</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">{pokemon.weight / 10} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Base Experience</p>
                <p className="font-medium">{pokemon.base_experience || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Abilities</p>
                <div>
                  {pokemon.abilities.map(({ ability, is_hidden }) => (
                    <p key={ability.name} className="font-medium capitalize">
                      {ability.name} {is_hidden && <span className="text-xs text-muted-foreground">(Hidden)</span>}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6" onClick={() => toggleFavorite(pokemon)}>
              <Heart className={cn("h-4 w-4 mr-2", isFav ? "fill-red-500 text-red-500" : "")} />
              {isFav ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pokemon.stats.map((stat) => {
                  const statName = stat.stat.name
                    .replace("special-attack", "Sp. Atk")
                    .replace("special-defense", "Sp. Def")
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")

                  // Max base stat is typically around 255
                  const percentage = Math.min(100, (stat.base_stat / 255) * 100)

                  return (
                    <div key={stat.stat.name} className="grid grid-cols-[100px_1fr] gap-4 items-center">
                      <div className="text-sm font-medium">{statName}</div>
                      <div className="flex items-center gap-3">
                        <Progress value={percentage} className="h-2" />
                        <div className="text-sm font-medium w-10">{stat.base_stat}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="moves">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="moves">Moves</TabsTrigger>
          <TabsTrigger value="evolution">Evolution Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="moves" className="border rounded-md mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Moves</CardTitle>
              <CardDescription>List of moves that {formattedName} can learn.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pokemon.moves.slice(0, 40).map(({ move }) => (
                  <Badge key={move.name} variant="outline" className="capitalize">
                    {move.name.replace("-", " ")}
                  </Badge>
                ))}
                {pokemon.moves.length > 40 && (
                  <div className="text-sm text-muted-foreground col-span-full mt-2">
                    + {pokemon.moves.length - 40} more moves
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="border rounded-md mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Chain</CardTitle>
              <CardDescription>Evolution stages of {formattedName}.</CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionChain ? (
                <PokemonEvolutionChain evolutionChain={evolutionChain} currentPokemonId={pokemon.id} />
              ) : (
                <p className="text-muted-foreground">Evolution data not available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
