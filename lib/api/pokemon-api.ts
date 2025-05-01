// Cache for storing fetched Pokémon data
const pokemonCache: Record<string, any> = {}

// Batch multiple requests together
export class RequestBatcher {
  private queue: Map<
    string,
    {
      resolve: (value: any) => void
      reject: (reason: any) => void
    }[]
  > = new Map()
  private timeout: NodeJS.Timeout | null = null
  private batchTime = 50 // ms to wait before processing batch

  constructor(private fetchFn: (urls: string[]) => Promise<any[]>) {}

  request(url: string): Promise<any> {
    // Return from cache if available
    if (pokemonCache[url]) {
      return Promise.resolve(pokemonCache[url])
    }

    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.queue.has(url)) {
        this.queue.set(url, [])
      }
      this.queue.get(url)!.push({ resolve, reject })

      // Set timeout to process batch
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), this.batchTime)
      }
    })
  }

  private async processBatch() {
    this.timeout = null
    const urls = Array.from(this.queue.keys())
    if (urls.length === 0) return

    const currentQueue = new Map(this.queue)
    this.queue.clear()

    try {
      // Fetch all URLs in a single batch
      const results = await this.fetchFn(urls)

      // Match results to URLs and resolve promises
      results.forEach((result, i) => {
        const url = urls[i]
        pokemonCache[url] = result // Cache the result

        const handlers = currentQueue.get(url) || []
        handlers.forEach(({ resolve }) => resolve(result))
      })
    } catch (error) {
      // Reject all promises in the batch
      urls.forEach((url) => {
        const handlers = currentQueue.get(url) || []
        handlers.forEach(({ reject }) => reject(error))
      })
    }
  }
}

// Create a batcher for Pokémon API requests
const pokemonBatcher = new RequestBatcher(async (urls: string[]) => {
  console.log(`Batching ${urls.length} Pokémon API requests`)

  // Use Promise.all but with a more sophisticated approach
  return Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`API request failed: ${url}`)
      }
      return response.json()
    }),
  )
})

// API functions that use the batcher
export const pokemonApi = {
  // Get a Pokémon by ID with batching
  getPokemonById: (id: string) => {
    return pokemonBatcher.request(`https://pokeapi.co/api/v2/pokemon/${id}`)
  },

  // Get a Pokémon by name with batching
  getPokemonByName: (name: string) => {
    return pokemonBatcher.request(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
  },

  // Get Pokémon species data with batching
  getPokemonSpecies: (id: string) => {
    return pokemonBatcher.request(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  },

  // Get evolution chain data with batching
  getEvolutionChain: (url: string) => {
    return pokemonBatcher.request(url)
  },

  // Get a list of Pokémon with pagination
  getPokemonList: async (limit = 20, offset = 0) => {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`

    // This specific endpoint doesn't benefit from batching as much
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed: ${url}`)
    }

    return response.json()
  },

  // Get Pokémon type data
  getTypeData: (typeName: string) => {
    return pokemonBatcher.request(`https://pokeapi.co/api/v2/type/${typeName}`)
  },

  // Get all available Pokémon types
  getAllTypes: async () => {
    const url = `https://pokeapi.co/api/v2/type`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed: ${url}`)
    }
    return response.json()
  },

  // Get Pokémon ability data
  getAbilityData: (abilityName: string) => {
    return pokemonBatcher.request(`https://pokeapi.co/api/v2/ability/${abilityName}`)
  },

  // Clear the cache (useful for testing or when data might be stale)
  clearCache: () => {
    Object.keys(pokemonCache).forEach((key) => {
      delete pokemonCache[key]
    })
  },
}
