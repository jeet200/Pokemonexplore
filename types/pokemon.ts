export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  sprites: {
    front_default: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
  types: {
    type: {
      name: string
      url: string
    }
  }[]
  stats: {
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }[]
  abilities: {
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }[]
  moves: {
    move: {
      name: string
      url: string
    }
  }[]
  species: {
    name: string
    url: string
  }
}

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  flavor_text_entries: {
    flavor_text: string
    language: {
      name: string
      url: string
    }
    version: {
      name: string
      url: string
    }
  }[]
  genera: {
    genus: string
    language: {
      name: string
      url: string
    }
  }[]
  evolution_chain: {
    url: string
  }
}

export interface EvolutionChain {
  id: number
  chain: {
    species: {
      name: string
      url: string
    }
    evolution_details: {
      min_level: number | null
      trigger: {
        name: string
        url: string
      } | null
      item: {
        name: string
        url: string
      } | null
    }[]
    evolves_to: {
      species: {
        name: string
        url: string
      }
      evolution_details: {
        min_level: number | null
        trigger: {
          name: string
          url: string
        } | null
        item: {
          name: string
          url: string
        } | null
      }[]
      evolves_to: any[]
    }[]
  }
}
