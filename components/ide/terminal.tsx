"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Terminal as TerminalIcon, X, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TerminalLine {
  id: string
  type: "input" | "output" | "error" | "info"
  content: string
  timestamp: Date
}

interface TerminalProps {
  onMinimize?: () => void
  className?: string
}

const COMMANDS: Record<string, (args: string[]) => string | string[]> = {
  help: () => [
    "Available commands:",
    "  help          - Show this help message",
    "  clear         - Clear the terminal",
    "  latex         - LaTeX compiler commands (simulated)",
    "  echo <text>   - Echo text back",
    "  date          - Show current date",
    "  whoami        - Show current user",
    "  pwd           - Print working directory",
    "  ls            - List files in current directory",
    "  cat <file>    - Display file contents",
    "  version       - Show LaTeX.js version",
  ],
  clear: () => "__CLEAR__",
  echo: (args) => args.join(" ") || "",
  date: () => new Date().toLocaleString(),
  whoami: () => "developer",
  pwd: () => "/home/developer/latex-project",
  ls: () => [
    "main.tex    preamble.tex    bibliography.bib",
    "chapters/   figures/        output/",
  ],
  cat: (args) => {
    if (!args[0]) return "cat: missing file operand"
    if (args[0] === "main.tex") {
      return [
        '\\documentclass{article}',
        '\\begin{document}',
        'Hello, World!',
        '\\end{document}',
      ]
    }
    return `cat: ${args[0]}: No such file or directory`
  },
  latex: (args) => {
    if (!args[0]) return "Usage: latex <command> [options]"
    switch (args[0]) {
      case "compile":
        return [
          "Compiling main.tex...",
          "LaTeX.js: Processing document",
          "Output: document.html",
        ]
      case "packages":
        return [
          "Loaded packages:",
          "  - amsmath",
          "  - amssymb",
          "  - graphicx",
          "  - hyperref",
        ]
      default:
        return `latex: '${args[0]}' is not a latex command`
    }
  },
  version: () => "LaTeX.js (OpenPrism IDE)",
}

export function Terminal({ onMinimize, className }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "welcome",
      type: "info",
      content: "Welcome to OpenPrism Terminal",
      timestamp: new Date(),
    },
    {
      id: "hint",
      type: "info",
      content: 'Type "help" for available commands',
      timestamp: new Date(),
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeCommand = useCallback((input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    // Add input line
    const inputLine: TerminalLine = {
      id: `input-${Date.now()}`,
      type: "input",
      content: trimmed,
      timestamp: new Date(),
    }

    // Parse command
    const [cmd, ...args] = trimmed.split(" ")
    const handler = COMMANDS[cmd.toLowerCase()]

    if (handler) {
      const result = handler(args)
      
      if (result === "__CLEAR__") {
        setLines([])
        return
      }

      const outputLines = Array.isArray(result) ? result : [result]
      const newLines: TerminalLine[] = outputLines.map((content, i) => ({
        id: `output-${Date.now()}-${i}`,
        type: "output" as const,
        content,
        timestamp: new Date(),
      }))

      setLines((prev) => [...prev, inputLine, ...newLines])
    } else {
      setLines((prev) => [
        ...prev,
        inputLine,
        {
          id: `error-${Date.now()}`,
          type: "error",
          content: `Command not found: ${cmd}. Type "help" for available commands.`,
          timestamp: new Date(),
        },
      ])
    }

    // Add to history
    setHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(currentInput)
      setCurrentInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(history[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(history[newIndex])
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple tab completion
      const commands = Object.keys(COMMANDS)
      const match = commands.find((c) => c.startsWith(currentInput.toLowerCase()))
      if (match) {
        setCurrentInput(match)
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className={cn("h-full flex flex-col bg-terminal-bg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-panel-header border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">Terminal</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3 w-3" />
          </Button>
          {onMinimize && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm cursor-text"
        onClick={handleContainerClick}
      >
        {lines.map((line) => (
          <div key={line.id} className="leading-6">
            {line.type === "input" ? (
              <div className="flex">
                <span className="text-green-400">$</span>
                <span className="text-foreground ml-2">{line.content}</span>
              </div>
            ) : line.type === "error" ? (
              <span className="text-red-400">{line.content}</span>
            ) : line.type === "info" ? (
              <span className="text-blue-400">{line.content}</span>
            ) : (
              <span className="text-muted-foreground">{line.content}</span>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center leading-6">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 ml-2 bg-transparent outline-none text-foreground caret-foreground"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
