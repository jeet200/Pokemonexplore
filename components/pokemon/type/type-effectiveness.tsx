"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { pokemonApi } from "@/lib/api/pokemon-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { typeColors } from "@/lib/type-colors"

interface TypeEffectivenessProps {
  types: {
    type: {
      name: string
      url: string
    }
  }[]
}

interface TypeRelations {
  double_damage_from: { name: string; url: string }[]
  double_damage_to: { name: string; url: string }[]
  half_damage_from: { name: string; url: string }[]
  half_damage_to: { name: string; url: string }[]
  no_damage_from: { name: string; url: string }[]
  no_damage_to: { name: string; url: string }[]
}

export function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const [typeRelations, setTypeRelations] = useState<Record<string, TypeRelations | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTypeRelations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const relations: Record<string, TypeRelations | null> = {}

        // Fetch type relations for each type
        await Promise.all(
          types.map(async ({ type }) => {
            try {
              const data = await pokemonApi.getTypeData(type.name)
              relations[type.name] = data.damage_relations
            } catch (error) {
              console.error(`Error fetching type ${type.name}:`, error)
              relations[type.name] = null
            }
          }),
        )

        setTypeRelations(relations)
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to fetch type relations")
        setError(err)
        console.error("Error fetching type relations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTypeRelations()
  }, [types])

  // Calculate combined effectiveness
  const calculateEffectiveness = () => {
    const effectiveness: Record<string, number> = {}

    // Process each type's relations
    Object.values(typeRelations).forEach((relations) => {
      if (!relations) return

      // Double damage from (weakness)
      relations.double_damage_from.forEach((type) => {
        effectiveness[type.name] = (effectiveness[type.name] || 1) * 2
      })

      // Half damage from (resistance)
      relations.half_damage_from.forEach((type) => {
        effectiveness[type.name] = (effectiveness[type.name] || 1) * 0.5
      })

      // No damage from (immunity)
      relations.no_damage_from.forEach((type) => {
        effectiveness[type.name] = 0
      })
    })

    return effectiveness
  }

  const getEffectivenessGroups = () => {
    const effectiveness = calculateEffectiveness()

    // Group types by effectiveness
    const groups = {
      quadruple: [] as string[], // 4x damage
      double: [] as string[], // 2x damage
      normal: [] as string[], // 1x damage
      half: [] as string[], // 0.5x damage
      quarter: [] as string[], // 0.25x damage
      immune: [] as string[], // 0x damage
    }

    Object.entries(effectiveness).forEach(([type, value]) => {
      if (value === 0) groups.immune.push(type)
      else if (value === 0.25) groups.quarter.push(type)
      else if (value === 0.5) groups.half.push(type)
      else if (value === 1) groups.normal.push(type)
      else if (value === 2) groups.double.push(type)
      else if (value === 4) groups.quadruple.push(type)
    })

    return groups
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Type Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Type Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading type effectiveness: {error.message}</div>
        </CardContent>
      </Card>
    )
  }

  const effectivenessGroups = getEffectivenessGroups()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Type Effectiveness</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weaknesses */}
          <div>
            <h3 className="font-medium mb-2">Weaknesses</h3>
            <div className="flex flex-wrap gap-2">
              {effectivenessGroups.quadruple.length > 0 && (
                <>
                  {effectivenessGroups.quadruple.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn("capitalize", typeColors[type] || "border-gray-200")}
                    >
                      {type} (4×)
                    </Badge>
                  ))}
                </>
              )}

              {effectivenessGroups.double.length > 0
                ? effectivenessGroups.double.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn("capitalize", typeColors[type] || "border-gray-200")}
                    >
                      {type} (2×)
                    </Badge>
                  ))
                : effectivenessGroups.quadruple.length === 0 && (
                    <span className="text-sm text-muted-foreground">No weaknesses</span>
                  )}
            </div>
          </div>

          {/* Resistances */}
          <div>
            <h3 className="font-medium mb-2">Resistances</h3>
            <div className="flex flex-wrap gap-2">
              {effectivenessGroups.quarter.length > 0 && (
                <>
                  {effectivenessGroups.quarter.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn("capitalize", typeColors[type] || "border-gray-200")}
                    >
                      {type} (¼×)
                    </Badge>
                  ))}
                </>
              )}

              {effectivenessGroups.half.length > 0
                ? effectivenessGroups.half.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn("capitalize", typeColors[type] || "border-gray-200")}
                    >
                      {type} (½×)
                    </Badge>
                  ))
                : effectivenessGroups.quarter.length === 0 && (
                    <span className="text-sm text-muted-foreground">No resistances</span>
                  )}
            </div>
          </div>

          {/* Immunities */}
          <div>
            <h3 className="font-medium mb-2">Immunities</h3>
            <div className="flex flex-wrap gap-2">
              {effectivenessGroups.immune.length > 0 ? (
                effectivenessGroups.immune.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className={cn("capitalize", typeColors[type] || "border-gray-200")}
                  >
                    {type} (0×)
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No immunities</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
