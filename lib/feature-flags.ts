"use client"

import type React from "react"

// Feature flag system for incremental development

import { useState, useCallback, createContext, useContext } from "react"

// Define available features
export type FeatureFlag =
  | "advanced_filtering"
  | "pokemon_comparison"
  | "team_builder"
  | "move_details"
  | "offline_support"
  | "performance_monitoring"

// Default feature flag configuration
const defaultFeatureFlags: Record<FeatureFlag, boolean> = {
  advanced_filtering: true,
  pokemon_comparison: true,
  team_builder: false, // Not implemented yet
  move_details: false, // Not implemented yet
  offline_support: false, // Not implemented yet
  performance_monitoring: process.env.NODE_ENV === "development",
}

// Get feature flags from localStorage or environment
function getFeatureFlags(): Record<FeatureFlag, boolean> {
  if (typeof window === "undefined") {
    return defaultFeatureFlags
  }

  try {
    const storedFlags = localStorage.getItem("featureFlags")
    if (storedFlags) {
      return { ...defaultFeatureFlags, ...JSON.parse(storedFlags) }
    }
  } catch (error) {
    console.error("Error reading feature flags from localStorage:", error)
  }

  return defaultFeatureFlags
}

// Save feature flags to localStorage
function saveFeatureFlags(flags: Record<FeatureFlag, boolean>) {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem("featureFlags", JSON.stringify(flags))
  } catch (error) {
    console.error("Error saving feature flags to localStorage:", error)
  }
}

// Feature flag hook
export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>(getFeatureFlags)

  // Update a single feature flag
  const setFeatureFlag = useCallback((flag: FeatureFlag, enabled: boolean) => {
    setFlags((prev) => {
      const newFlags = { ...prev, [flag]: enabled }
      saveFeatureFlags(newFlags)
      return newFlags
    })
  }, [])

  // Reset all feature flags to defaults
  const resetFeatureFlags = useCallback(() => {
    setFlags(defaultFeatureFlags)
    saveFeatureFlags(defaultFeatureFlags)
  }, [])

  // Check if a feature is enabled
  const isFeatureEnabled = useCallback(
    (flag: FeatureFlag) => {
      return flags[flag] || false
    },
    [flags],
  )

  return {
    flags,
    setFeatureFlag,
    resetFeatureFlags,
    isFeatureEnabled,
  }
}

// Feature flag provider component
export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const featureFlags = useFeatureFlags()

  return <FeatureFlagContext.Provider value={featureFlags}>{children}</FeatureFlagContext.Provider>
}

// Feature flag context
const FeatureFlagContext = createContext<ReturnType<typeof useFeatureFlags> | undefined>(undefined)

// Hook to use feature flags in components
export function useFeature() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error("useFeature must be used within a FeatureFlagProvider")
  }
  return context
}

// Component that conditionally renders based on feature flag
export function Feature({
  flag,
  children,
  fallback = null,
}: {
  flag: FeatureFlag
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isFeatureEnabled } = useFeature()

  if (isFeatureEnabled(flag)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
