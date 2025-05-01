"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePokemonContext } from "@/contexts/pokemon-context"

interface PokemonSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PokemonSelect({ value, onChange, placeholder = "Select a Pokémon" }: PokemonSelectProps) {
  const [open, setOpen] = useState(false)
  const { allPokemon } = usePokemonContext()

  // Find the selected Pokémon name
  const selectedPokemon = allPokemon?.find((p) => p.id.toString() === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value && selectedPokemon
            ? `${selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)} (#${selectedPokemon.id})`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search Pokémon..." />
          <CommandList>
            <CommandEmpty>No Pokémon found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {allPokemon?.map((pokemon) => (
                <CommandItem
                  key={pokemon.id}
                  value={`${pokemon.name}-${pokemon.id}`}
                  onSelect={() => {
                    onChange(pokemon.id.toString())
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === pokemon.id.toString() ? "opacity-100" : "opacity-0")}
                  />
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#{pokemon.id})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
