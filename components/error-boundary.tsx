"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    })

    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An error occurred in the application. We apologize for the inconvenience.
          </p>
          <div className="space-y-4">
            <Button onClick={() => (window.location.href = "/")} className="mr-4">
              Go to Home
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
              Try Again
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-8 p-4 bg-muted rounded-md text-left overflow-auto max-w-full">
              <h3 className="font-bold mb-2">Error Details:</h3>
              <p className="text-sm mb-2">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="text-xs overflow-auto p-2 bg-background rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
