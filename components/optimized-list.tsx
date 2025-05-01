"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  getItemKey: (item: T) => string | number
  className?: string
  itemClassName?: string
}

export function OptimizedList<T>({ items, renderItem, getItemKey, className, itemClassName }: OptimizedListProps<T>) {
  // Track which items are in the viewport
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  // Create an IntersectionObserver to track visible items
  useEffect(() => {
    if (!listRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "-1", 10)
          if (index >= 0) {
            setVisibleIndices((prev) => {
              const newSet = new Set(prev)
              if (entry.isIntersecting) {
                newSet.add(index)
              } else {
                newSet.delete(index)
              }
              return newSet
            })
          }
        })
      },
      {
        root: null,
        rootMargin: "200px", // Load items slightly before they come into view
        threshold: 0.1,
      },
    )

    // Observe all list items
    const listItems = listRef.current.querySelectorAll("[data-index]")
    listItems.forEach((item) => {
      observer.observe(item)
    })

    return () => {
      observer.disconnect()
    }
  }, [items.length])

  return (
    <div ref={listRef} className={className}>
      {items.map((item, index) => (
        <div
          key={getItemKey(item)}
          data-index={index}
          className={itemClassName}
          style={{
            // Use content-visibility for items not in view
            contentVisibility: visibleIndices.has(index) ? "visible" : "auto",
            // Reserve space for the item to prevent layout shifts
            containIntrinsicSize: "0 200px", // Approximate height
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

// Usage example with virtualization for very long lists
export function VirtualizedList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  itemHeight = 200, // Approximate height of each item
  overscan = 5, // Number of items to render outside of viewport
}: OptimizedListProps<T> & { itemHeight?: number; overscan?: number }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Update visible range based on scroll position
  useEffect(() => {
    if (!containerRef.current) return

    const updateVisibleRange = () => {
      const container = containerRef.current
      if (!container) return

      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight

      // Calculate which items should be visible
      const containerTop = container.offsetTop
      const relativeScrollTop = Math.max(0, scrollTop - containerTop)

      const start = Math.max(0, Math.floor(relativeScrollTop / itemHeight) - overscan)
      const end = Math.min(items.length, Math.ceil((relativeScrollTop + viewportHeight) / itemHeight) + overscan)

      setVisibleRange({ start, end })
    }

    updateVisibleRange()
    window.addEventListener("scroll", updateVisibleRange)
    window.addEventListener("resize", updateVisibleRange)

    return () => {
      window.removeEventListener("scroll", updateVisibleRange)
      window.removeEventListener("resize", updateVisibleRange)
    }
  }, [items.length, itemHeight, overscan])

  // Calculate total height to maintain scroll position
  const totalHeight = items.length * itemHeight

  // Only render items in the visible range
  const visibleItems = items.slice(visibleRange.start, visibleRange.end)

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", height: `${totalHeight}px` }}>
      {visibleItems.map((item, index) => {
        const actualIndex = visibleRange.start + index
        return (
          <div
            key={getItemKey(item)}
            className={itemClassName}
            style={{
              position: "absolute",
              top: `${actualIndex * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`,
            }}
          >
            {renderItem(item, actualIndex)}
          </div>
        )
      })}
    </div>
  )
}
