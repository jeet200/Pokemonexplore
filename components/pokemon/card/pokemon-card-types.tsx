import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { typeColors } from "@/lib/type-colors"

interface PokemonCardTypesProps {
  types: {
    type: {
      name: string
      url: string
    }
  }[]
}

export function PokemonCardTypes({ types }: PokemonCardTypesProps) {
  return (
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
  )
}
