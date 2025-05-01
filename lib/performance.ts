// Performance monitoring utilities

// Check if the Performance API is available
const isPerformanceSupported = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.performance !== "undefined" &&
    typeof window.performance.mark === "function" &&
    typeof window.performance.measure === "function"
  )
}

// Create a performance mark
export function markStart(markName: string) {
  if (isPerformanceSupported()) {
    performance.mark(`${markName}_start`)
  }
}

// End a performance mark and create a measure
export function markEnd(markName: string) {
  if (isPerformanceSupported()) {
    performance.mark(`${markName}_end`)
    performance.measure(markName, `${markName}_start`, `${markName}_end`)

    // Optional: Log the measurement
    if (process.env.NODE_ENV === "development") {
      const entries = performance.getEntriesByName(markName)
      if (entries.length > 0) {
        console.log(`⚡️ ${markName}: ${entries[0].duration.toFixed(2)}ms`)
      }
    }
  }
}

// Clear all performance marks and measures
export function clearMarks() {
  if (isPerformanceSupported()) {
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// Track a specific user interaction
export function trackInteraction(name: string, fn: (...args: any[]) => any) {
  return (...args: any[]) => {
    markStart(`interaction_${name}`)
    const result = fn(...args)

    // Handle both synchronous and Promise-based functions
    if (result instanceof Promise) {
      return result.finally(() => {
        markEnd(`interaction_${name}`)
      })
    } else {
      markEnd(`interaction_${name}`)
      return result
    }
  }
}

// Report performance metrics to an analytics service
export function reportPerformanceMetrics() {
  if (!isPerformanceSupported()) return

  // Get all performance measures
  const measures = performance.getEntriesByType("measure")

  // Group measures by name
  const metricsByName = measures.reduce(
    (acc, measure) => {
      const { name, duration } = measure
      if (!acc[name]) {
        acc[name] = []
      }
      acc[name].push(duration)
      return acc
    },
    {} as Record<string, number[]>,
  )

  // Calculate average duration for each metric
  const averageMetrics = Object.entries(metricsByName).map(([name, durations]) => {
    const total = durations.reduce((sum, duration) => sum + duration, 0)
    const average = total / durations.length
    return { name, average }
  })

  // Here you would send these metrics to your analytics service
  console.log("Performance metrics:", averageMetrics)

  // Example of sending to an analytics endpoint
  // fetch('/api/analytics/performance', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ metrics: averageMetrics })
  // })

  // Clear measures after reporting
  performance.clearMeasures()
}
