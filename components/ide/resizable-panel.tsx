"use client"

import React from "react"

import { useCallback, useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  direction: "horizontal" | "vertical"
  children: [React.ReactNode, React.ReactNode]
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  panelClassName?: string
}

export function ResizablePanel({
  direction,
  children,
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className,
  panelClassName,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let newSize: number

      if (direction === "horizontal") {
        newSize = ((e.clientX - rect.left) / rect.width) * 100
      } else {
        newSize = ((e.clientY - rect.top) / rect.height) * 100
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      setSize(newSize)
    },
    [isDragging, direction, minSize, maxSize]
  )

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction])

  const isHorizontal = direction === "horizontal"

  return (
    <div
      ref={containerRef}
      className={cn("flex", isHorizontal ? "flex-row" : "flex-col", className)}
    >
      <div
        className={cn("overflow-hidden", panelClassName)}
        style={{
          [isHorizontal ? "width" : "height"]: `${size}%`,
          flexShrink: 0,
        }}
      >
        {children[0]}
      </div>
      <div
        className={cn(
          "shrink-0 bg-border hover:bg-primary/50 transition-colors",
          isHorizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
          isDragging && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />
      <div className={cn("flex-1 overflow-hidden min-w-0 min-h-0", panelClassName)}>
        {children[1]}
      </div>
    </div>
  )
}
