"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  // For stale-while-revalidate pattern
  isValidating: boolean
  isStale: boolean
}

interface UseAsyncOptions<T> {
  initialData?: T | null
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  revalidateOnFocus?: boolean
  dedupingInterval?: number // ms to wait before allowing the same request again
}

export function useAsync<T>(asyncFn: () => Promise<T>, deps: any[] = [], options: UseAsyncOptions<T> = {}) {
  const { initialData = null, onSuccess, onError, revalidateOnFocus = false, dedupingInterval = 2000 } = options

  // State for the async operation
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: true,
    isError: false,
    error: null,
    isValidating: false,
    isStale: false,
  })

  // Refs for tracking request state
  const lastRequestTimeRef = useRef<number>(0)
  const isMountedRef = useRef<boolean>(true)

  // Function to execute the async operation
  const execute = useCallback(
    async (isRevalidation = false) => {
      // Deduping - skip if we recently made the same request
      const now = Date.now()
      if (isRevalidation && now - lastRequestTimeRef.current < dedupingInterval) {
        return
      }

      lastRequestTimeRef.current = now

      // If revalidating, mark data as stale but keep showing it
      if (isRevalidation && state.data) {
        setState((prev) => ({
          ...prev,
          isValidating: true,
          isStale: true,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          isError: false,
          error: null,
        }))
      }

      try {
        const result = await asyncFn()

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setState({
            data: result,
            isLoading: false,
            isError: false,
            error: null,
            isValidating: false,
            isStale: false,
          })

          onSuccess?.(result)
        }
      } catch (error) {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isError: true,
            error: error instanceof Error ? error : new Error(String(error)),
            isValidating: false,
          }))

          onError?.(error instanceof Error ? error : new Error(String(error)))
        }
      }
    },
    [asyncFn, state.data, onSuccess, onError, dedupingInterval],
  )

  // Execute the async function when dependencies change
  useEffect(() => {
    execute()
  }, [...deps, execute])

  // Set up revalidation on window focus if enabled
  useEffect(() => {
    if (!revalidateOnFocus) return

    const onFocus = () => {
      execute(true) // true indicates this is a revalidation
    }

    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [revalidateOnFocus, execute])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Return state and a function to manually trigger the operation
  return {
    ...state,
    execute,
    // Helper function to retry after an error
    retry: () => execute(),
  }
}
