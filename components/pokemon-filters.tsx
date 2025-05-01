"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { typeColors } from "@/lib/type-colors"

interface PokemonFiltersProps {
  selectedTypes: string[]
  setSelectedTypes: (types: string[]) => void
  sortOption: string
  setSortOption: (option: string) => void
  itemsPerPage: number
  setItemsPerPage: (count: number) => void
}

const pokemonTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

export function PokemonFilters({
  selectedTypes,
  setSelectedTypes,
  sortOption,
  setSortOption,
  itemsPerPage,
  setItemsPerPage,
}: PokemonFiltersProps) {
  const [open, setOpen] = useState(false)

  const handleTypeSelect = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleRemoveType = (type: string) => {
    setSelectedTypes(selectedTypes.filter((t) => t !== type))
  }

  const handleClearTypes = () => {
    setSelectedTypes([])
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 justify-between">
              {selectedTypes.length > 0
                ? `${selectedTypes.length} type${selectedTypes.length > 1 ? "s" : ""} selected`
                : "Filter by type"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search type..." />
              <CommandList>
                <CommandEmpty>No type found.</CommandEmpty>
                <CommandGroup>
                  {pokemonTypes.map((type) => (
                    <CommandItem key={type} value={type} onSelect={() => handleTypeSelect(type)}>
                      <div
                        className={cn(
                          "mr-2 h-4 w-4 rounded-sm border flex items-center justify-center",
                          selectedTypes.includes(type) ? "bg-primary border-primary" : "opacity-50",
                        )}
                      >
                        {selectedTypes.includes(type) && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="capitalize">{type}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-2 items-center">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="outline"
              className={cn("capitalize gap-1 px-2", typeColors[type] || "border-gray-200")}
            >
              {type}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleRemoveType(type)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {selectedTypes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearTypes} className="h-7 text-xs">
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id-asc">ID (Ascending)</SelectItem>
              <SelectItem value="id-desc">ID (Descending)</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
