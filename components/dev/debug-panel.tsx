"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X, ChevronUp, ChevronDown, RefreshCw } from "lucide-react"

// Only include in development mode
const DevPanel =
  process.env.NODE_ENV === "development"
    ? ({ children }: { children: React.ReactNode }) => {
        const [isOpen, setIsOpen] = useState(false)
        const [isMinimized, setIsMinimized] = useState(false)

        // Load state from localStorage
        useEffect(() => {
          const savedState = localStorage.getItem("devPanelState")
          if (savedState) {
            const { isOpen: savedIsOpen, isMinimized: savedIsMinimized } = JSON.parse(savedState)
            setIsOpen(savedIsOpen)
            setIsMinimized(savedIsMinimized)
          }
        }, [])

        // Save state to localStorage
        useEffect(() => {
          localStorage.setItem("devPanelState", JSON.stringify({ isOpen, isMinimized }))
        }, [isOpen, isMinimized])

        if (!isOpen) {
          return (
            <Button className="fixed bottom-4 right-4 z-50" onClick={() => setIsOpen(true)} size="sm">
              Open Dev Tools
            </Button>
          )
        }

        return (
          <div
            className={`fixed bottom-0 right-0 z-50 w-full md:w-96 transition-all duration-200 ${
              isMinimized ? "h-10" : "max-h-[80vh]"
            }`}
          >
            <Card className="h-full overflow-hidden border-t shadow-lg">
              <CardHeader className="p-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Developer Tools</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="p-0 overflow-auto max-h-[calc(80vh-40px)]">{children}</CardContent>
              )}
            </Card>
          </div>
        )
      }
    : () => null // No-op in production

// Performance monitoring tab
function PerformanceTab() {
  const [metrics, setMetrics] = useState<PerformanceEntry[]>([])

  useEffect(() => {
    // Get initial metrics
    updateMetrics()

    // Set up observer for new metrics
    const observer = new PerformanceObserver((list) => {
      updateMetrics()
    })

    observer.observe({ entryTypes: ["measure"] })

    return () => {
      observer.disconnect()
    }
  }, [])

  const updateMetrics = () => {
    const measures = performance.getEntriesByType("measure")
    setMetrics([...measures])
  }

  const clearMetrics = () => {
    performance.clearMarks()
    performance.clearMeasures()
    setMetrics([])
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Performance Metrics</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={updateMetrics}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={clearMetrics}>
            Clear
          </Button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No metrics recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index} className="text-sm border p-2 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">{metric.name}</span>
                <span className="text-green-600">{metric.duration.toFixed(2)}ms</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Start: {new Date(metric.startTime).toISOString().substr(11, 12)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Network requests tab
function NetworkTab() {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    // Monkey patch fetch to track requests
    const originalFetch = window.fetch

    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
      const startTime = performance.now()

      const request = {
        url,
        method: init?.method || "GET",
        startTime,
        endTime: 0,
        duration: 0,
        status: 0,
        response: null,
        error: null,
      }

      setRequests((prev) => [request, ...prev].slice(0, 50))

      try {
        const response = await originalFetch(input, init)
        const endTime = performance.now()

        // Update the request with response info
        setRequests((prev) => {
          const index = prev.findIndex((r) => r.url === url && r.startTime === startTime)
          if (index >= 0) {
            const newRequests = [...prev]
            newRequests[index] = {
              ...newRequests[index],
              endTime,
              duration: endTime - startTime,
              status: response.status,
              response: response.clone(), // Clone so we can still use the original
            }
            return newRequests
          }
          return prev
        })

        return response
      } catch (error) {
        const endTime = performance.now()

        // Update the request with error info
        setRequests((prev) => {
          const index = prev.findIndex((r) => r.url === url && r.startTime === startTime)
          if (index >= 0) {
            const newRequests = [...prev]
            newRequests[index] = {
              ...newRequests[index],
              endTime,
              duration: endTime - startTime,
              error: error,
            }
            return newRequests
          }
          return prev
        })

        throw error
      }
    }

    return () => {
      // Restore original fetch
      window.fetch = originalFetch
    }
  }, [])

  const clearRequests = () => {
    setRequests([])
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Network Requests</h3>
        <Button size="sm" variant="outline" onClick={clearRequests}>
          Clear
        </Button>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((request, index) => (
            <div
              key={index}
              className={`text-sm border p-2 rounded-md ${
                request.error
                  ? "border-red-300"
                  : request.status >= 400
                    ? "border-orange-300"
                    : request.status >= 200
                      ? "border-green-300"
                      : "border-blue-300"
              }`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{request.method}</span>
                <span
                  className={`${
                    request.error
                      ? "text-red-600"
                      : request.status >= 400
                        ? "text-orange-600"
                        : request.status >= 200
                          ? "text-green-600"
                          : "text-blue-600"
                  }`}
                >
                  {request.status || "Pending"}
                </span>
              </div>
              <div className="text-xs truncate" title={request.url}>
                {request.url}
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{request.duration.toFixed(2)}ms</span>
                <span>{new Date(request.startTime).toISOString().substr(11, 12)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// State inspector tab
function StateTab() {
  const [stateSnapshots, setStateSnapshots] = useState<any[]>([])

  // Function to add a state snapshot
  const addStateSnapshot = (name: string, state: any) => {
    setStateSnapshots((prev) => [{ name, state, timestamp: Date.now() }, ...prev].slice(0, 20))
  }

  // Expose the function globally for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__debugAddStateSnapshot = addStateSnapshot
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__debugAddStateSnapshot
      }
    }
  }, [])

  const clearSnapshots = () => {
    setStateSnapshots([])
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">State Inspector</h3>
        <Button size="sm" variant="outline" onClick={clearSnapshots}>
          Clear
        </Button>
      </div>

      <div className="mb-4 text-sm">
        <p>
          Call <code>window.__debugAddStateSnapshot('name', stateObject)</code> in your code to add a state snapshot.
        </p>
      </div>

      {stateSnapshots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No state snapshots recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {stateSnapshots.map((snapshot, index) => (
            <div key={index} className="text-sm border p-2 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">{snapshot.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(snapshot.timestamp).toISOString().substr(11, 12)}
                </span>
              </div>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(snapshot.state, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Export the complete DevTools component
export function DevTools() {
  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <DevPanel>
      <Tabs defaultValue="performance">
        <TabsList className="w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
        </TabsList>
        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
        <TabsContent value="network">
          <NetworkTab />
        </TabsContent>
        <TabsContent value="state">
          <StateTab />
        </TabsContent>
      </Tabs>
    </DevPanel>
  )
}
