"use client"

import { useState } from "react"
import Image from "next/image"

interface PokemonCardImageProps {
  sprite: string | null
  name: string
  size: number
}

export function PokemonCardImage({ sprite, name, size }: PokemonCardImageProps) {
  const [isImageError, setIsImageError] = useState(false)

  if (!sprite || isImageError) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-full" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <Image
      src={sprite || "/placeholder.svg"}
      alt={`${name} sprite`}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setIsImageError(true)}
      priority={false}
      loading="lazy"
    />
  )
}
