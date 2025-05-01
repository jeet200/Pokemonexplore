import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface PokemonStatsProps {
  stats: {
    base_stat: number
    stat: {
      name: string
    }
  }[]
}

export function PokemonStats({ stats }: PokemonStatsProps) {
  // Format stat name for better readability
  const formatStatName = (name: string) => {
    return name
      .replace("special-attack", "Sp. Atk")
      .replace("special-defense", "Sp. Def")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Calculate color based on stat value
  const getStatColor = (value: number) => {
    if (value < 50) return "text-red-500"
    if (value < 80) return "text-yellow-500"
    if (value < 120) return "text-green-500"
    return "text-blue-500"
  }

  // Calculate total stats
  const totalStats = stats.reduce((total, stat) => total + stat.base_stat, 0)

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        const statName = formatStatName(stat.stat.name)
        const percentage = Math.min(100, (stat.base_stat / 255) * 100)
        const statColor = getStatColor(stat.base_stat)

        return (
          <div
            key={stat.stat.name}
            className="grid grid-cols-[100px_1fr] gap-4 items-center"
            // Add ARIA attributes for better screen reader support
            role="group"
            aria-labelledby={`stat-${stat.stat.name}`}
          >
            <div id={`stat-${stat.stat.name}`} className="text-sm font-medium">
              {statName}
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={percentage}
                className="h-2"
                // Add ARIA attributes for accessibility
                aria-valuemin={0}
                aria-valuemax={255}
                aria-valuenow={stat.base_stat}
                aria-valuetext={`${stat.base_stat} out of 255`}
              />
              <div className={cn("text-sm font-medium w-10", statColor)}>{stat.base_stat}</div>
            </div>
          </div>
        )
      })}

      <div
        className="grid grid-cols-[100px_1fr] gap-4 items-center pt-2 border-t"
        role="group"
        aria-labelledby="stat-total"
      >
        <div id="stat-total" className="text-sm font-bold">
          Total
        </div>
        <div className="flex items-center gap-3">
          <Progress
            value={Math.min(100, (totalStats / 600) * 100)}
            className="h-2 bg-muted-foreground/20"
            aria-valuemin={0}
            aria-valuemax={600}
            aria-valuenow={totalStats}
            aria-valuetext={`${totalStats} out of 600`}
          />
          <div className="text-sm font-bold w-10">{totalStats}</div>
        </div>
      </div>
    </div>
  )
}
