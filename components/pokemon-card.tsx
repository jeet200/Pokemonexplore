"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavoritesContext } from "@/contexts/favorites-context"
import { cn } from "@/lib/utils"
import type { Pokemon } from "@/types/pokemon"
import { typeColors } from "@/lib/type-colors"

interface PokemonCardProps {
  pokemon: Pokemon
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const { id, name, types, sprites } = pokemon
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const [isImageError, setIsImageError] = useState(false)

  const formattedId = `#${id.toString().padStart(3, "0")}`
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
  const isFav = isFavorite(id)

  // Get the primary type for the card border color
  const primaryType = types[0]?.type.name || "normal"
  const borderColor = typeColors[primaryType] || "border-gray-200"

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", `border-t-4 ${borderColor}`)}>
      <Link href={`/pokemon/${id}`} className="block">
        <div className="pt-6 px-6 flex justify-center">
          {!isImageError ? (
            <Image
              src={sprites.other["official-artwork"].front_default || sprites.front_default}
              alt={name}
              width={120}
              height={120}
              className="h-[120px] w-[120px] object-contain"
              onError={() => setIsImageError(true)}
            />
          ) : (
            <div className="h-[120px] w-[120px] flex items-center justify-center bg-muted rounded-full">
              <span className="text-2xl font-bold text-muted-foreground">{formattedName.charAt(0)}</span>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground mb-1">{formattedId}</div>
          <h3 className="font-bold text-lg mb-2">{formattedName}</h3>
          <div className="flex flex-wrap gap-2">
            {types.map(({ type }) => (
              <Badge
                key={type.name}
                variant="outline"
                className={cn("capitalize", typeColors[type.name] || "border-gray-200")}
              >
                {type.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(pokemon)}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </Button>
      </CardFooter>
    </Card>
  )
}
