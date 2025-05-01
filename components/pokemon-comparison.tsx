"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { typeColors } from "@/lib/type-colors"
import type { Pokemon } from "@/types/pokemon"

interface PokemonComparisonProps {
  firstPokemon: Pokemon
  secondPokemon: Pokemon
}

export function PokemonComparison({ firstPokemon, secondPokemon }: PokemonComparisonProps) {
  // Format names and IDs
  const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
  const formatId = (id: number) => `#${id.toString().padStart(3, "0")}`

  // Calculate which Pokémon has higher stats
  const getStatComparison = (stat1: number, stat2: number) => {
    if (stat1 > stat2) return "text-green-500"
    if (stat1 < stat2) return "text-red-500"
    return ""
  }

  // Get stat by name
  const getStat = (pokemon: Pokemon, statName: string) => {
    const stat = pokemon.stats.find((s) => s.stat.name === statName)
    return stat ? stat.base_stat : 0
  }

  // Calculate total stats
  const getTotalStats = (pokemon: Pokemon) => {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)
  }

  const firstTotal = getTotalStats(firstPokemon)
  const secondTotal = getTotalStats(secondPokemon)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* First Pokémon */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <Link href={`/pokemon/${firstPokemon.id}`} className="hover:underline">
              {formatName(firstPokemon.name)}
            </Link>
            <span className="text-sm text-muted-foreground">{formatId(firstPokemon.id)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Image
              src={firstPokemon.sprites.other["official-artwork"].front_default || firstPokemon.sprites.front_default}
              alt={firstPokemon.name}
              width={150}
              height={150}
              className="h-[150px] w-[150px] object-contain"
            />
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {firstPokemon.types.map(({ type }) => (
                <Badge
                  key={type.name}
                  variant="outline"
                  className={cn("capitalize", typeColors[type.name] || "border-gray-200")}
                >
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-muted-foreground">Height</p>
                <p className="font-medium">{firstPokemon.height / 10} m</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">{firstPokemon.weight / 10} kg</p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Base Stats</h3>

            {firstPokemon.stats.map((stat) => {
              const statName = stat.stat.name
                .replace("special-attack", "Sp. Atk")
                .replace("special-defense", "Sp. Def")
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              const secondStat = getStat(secondPokemon, stat.stat.name)
              const comparisonClass = getStatComparison(stat.base_stat, secondStat)
              const percentage = Math.min(100, (stat.base_stat / 255) * 100)

              return (
                <div key={stat.stat.name} className="grid grid-cols-[100px_1fr] gap-4 items-center">
                  <div className="text-sm font-medium">{statName}</div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="h-2" />
                    <div className={cn("text-sm font-medium w-10", comparisonClass)}>{stat.base_stat}</div>
                  </div>
                </div>
              )
            })}

            <div className="grid grid-cols-[100px_1fr] gap-4 items-center pt-2 border-t">
              <div className="text-sm font-bold">Total</div>
              <div className="flex items-center gap-3">
                <Progress value={Math.min(100, (firstTotal / 600) * 100)} className="h-2 bg-muted-foreground/20" />
                <div className={cn("text-sm font-bold w-10", getStatComparison(firstTotal, secondTotal))}>
                  {firstTotal}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Pokémon */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <Link href={`/pokemon/${secondPokemon.id}`} className="hover:underline">
              {formatName(secondPokemon.name)}
            </Link>
            <span className="text-sm text-muted-foreground">{formatId(secondPokemon.id)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Image
              src={secondPokemon.sprites.other["official-artwork"].front_default || secondPokemon.sprites.front_default}
              alt={secondPokemon.name}
              width={150}
              height={150}
              className="h-[150px] w-[150px] object-contain"
            />
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {secondPokemon.types.map(({ type }) => (
                <Badge
                  key={type.name}
                  variant="outline"
                  className={cn("capitalize", typeColors[type.name] || "border-gray-200")}
                >
                  {type.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-muted-foreground">Height</p>
                <p className="font-medium">{secondPokemon.height / 10} m</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">{secondPokemon.weight / 10} kg</p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Base Stats</h3>

            {secondPokemon.stats.map((stat) => {
              const statName = stat.stat.name
                .replace("special-attack", "Sp. Atk")
                .replace("special-defense", "Sp. Def")
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              const firstStat = getStat(firstPokemon, stat.stat.name)
              const comparisonClass = getStatComparison(stat.base_stat, firstStat)
              const percentage = Math.min(100, (stat.base_stat / 255) * 100)

              return (
                <div key={stat.stat.name} className="grid grid-cols-[100px_1fr] gap-4 items-center">
                  <div className="text-sm font-medium">{statName}</div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="h-2" />
                    <div className={cn("text-sm font-medium w-10", comparisonClass)}>{stat.base_stat}</div>
                  </div>
                </div>
              )
            })}

            <div className="grid grid-cols-[100px_1fr] gap-4 items-center pt-2 border-t">
              <div className="text-sm font-bold">Total</div>
              <div className="flex items-center gap-3">
                <Progress value={Math.min(100, (secondTotal / 600) * 100)} className="h-2 bg-muted-foreground/20" />
                <div className={cn("text-sm font-bold w-10", getStatComparison(secondTotal, firstTotal))}>
                  {secondTotal}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
