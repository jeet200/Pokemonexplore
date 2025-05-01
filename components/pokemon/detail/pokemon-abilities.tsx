"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { pokemonApi } from "@/lib/api/pokemon-api"
import { LoadingSpinner } from "@/components/loading-spinner"

interface PokemonAbilitiesProps {
  abilities: {
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }[]
}

interface AbilityDetail {
  name: string
  effect_entries: {
    effect: string
    language: {
      name: string
    }
  }[]
}

export function PokemonAbilities({ abilities }: PokemonAbilitiesProps) {
  const [abilityDetails, setAbilityDetails] = useState<Record<string, AbilityDetail | null>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAbilityDetails = async () => {
      setIsLoading(true)

      try {
        const details: Record<string, AbilityDetail | null> = {}

        // Fetch details for each ability
        await Promise.all(
          abilities.map(async ({ ability }) => {
            try {
              const data = await pokemonApi.getAbilityData(ability.name)
              details[ability.name] = data
            } catch (error) {
              console.error(`Error fetching ability ${ability.name}:`, error)
              details[ability.name] = null
            }
          }),
        )

        setAbilityDetails(details)
      } catch (error) {
        console.error("Error fetching ability details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAbilityDetails()
  }, [abilities])

  // Get English effect text for an ability
  const getEffectText = (ability: AbilityDetail | null) => {
    if (!ability) return "No description available."

    const englishEntry = ability.effect_entries.find((entry) => entry.language.name === "en")
    return englishEntry ? englishEntry.effect : "No English description available."
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abilities</CardTitle>
        <CardDescription>Special powers that affect the Pokémon in battle</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {abilities.map(({ ability, is_hidden }) => (
              <div key={ability.name} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold capitalize">{ability.name.replace("-", " ")}</h3>
                  {is_hidden && (
                    <Badge variant="outline" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{getEffectText(abilityDetails[ability.name])}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
