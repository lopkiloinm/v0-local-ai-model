"use client"

import React, { memo, useMemo } from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X, Circle } from "lucide-react"

interface LaTeXEditorProps {
  content: string
  onChange: (content: string) => void
  fileName: string
  onClose?: () => void
  isDirty?: boolean
}

// LaTeX syntax highlighting tokens
const LATEX_COMMANDS = [
  "documentclass", "usepackage", "begin", "end", "newcommand", "renewcommand",
  "section", "subsection", "subsubsection", "chapter", "part",
  "textbf", "textit", "emph", "underline", "texttt", "textrm", "textsf",
  "includegraphics", "input", "include", "bibliography", "bibliographystyle",
  "label", "ref", "cite", "footnote", "caption",
  "item", "hline", "cline", "multicolumn", "multirow",
  "frac", "sqrt", "sum", "prod", "int", "lim", "infty",
  "alpha", "beta", "gamma", "delta", "epsilon", "theta", "lambda", "mu", "pi", "sigma", "omega",
  "sin", "cos", "tan", "log", "ln", "exp",
  "left", "right", "big", "Big", "bigg", "Bigg",
  "hspace", "vspace", "newline", "newpage", "clearpage",
  "centering", "raggedright", "raggedleft",
  "maketitle", "tableofcontents", "listoffigures", "listoftables",
  "title", "author", "date"
]

const LATEX_ENVIRONMENTS = [
  "document", "equation", "align", "gather", "multline",
  "figure", "table", "tabular", "array",
  "itemize", "enumerate", "description",
  "abstract", "quote", "quotation", "verbatim",
  "center", "flushleft", "flushright",
  "minipage", "picture", "tikzpicture"
]

interface Token {
  type: "command" | "environment" | "comment" | "math" | "bracket" | "text"
  value: string
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Comments
    if (line[i] === "%" && (i === 0 || line[i - 1] !== "\\")) {
      tokens.push({ type: "comment", value: line.slice(i) })
      break
    }

    // Math mode (inline)
    if (line[i] === "$" && line[i + 1] !== "$") {
      let j = i + 1
      while (j < line.length && (line[j] !== "$" || line[j - 1] === "\\")) j++
      tokens.push({ type: "math", value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Math mode (display)
    if (line[i] === "$" && line[i + 1] === "$") {
      let j = i + 2
      while (j < line.length - 1 && !(line[j] === "$" && line[j + 1] === "$")) j++
      tokens.push({ type: "math", value: line.slice(i, j + 2) })
      i = j + 2
      continue
    }

    // LaTeX commands
    if (line[i] === "\\") {
      let j = i + 1
      while (j < line.length && /[a-zA-Z*]/.test(line[j])) j++
      const cmd = line.slice(i + 1, j)
      
      if (LATEX_ENVIRONMENTS.includes(cmd)) {
        tokens.push({ type: "environment", value: line.slice(i, j) })
      } else {
        tokens.push({ type: "command", value: line.slice(i, j) })
      }
      i = j
      continue
    }

    // Brackets
    if ("{[]()}".includes(line[i])) {
      tokens.push({ type: "bracket", value: line[i] })
      i++
      continue
    }

    // Regular text
    let j = i
    while (
      j < line.length &&
      line[j] !== "\\" &&
      line[j] !== "$" &&
      line[j] !== "%" &&
      !"{[]()}".includes(line[j])
    ) {
      j++
    }
    if (j > i) {
      tokens.push({ type: "text", value: line.slice(i, j) })
      i = j
    } else {
      tokens.push({ type: "text", value: line[i] })
      i++
    }
  }

  return tokens
}

const HighlightedLine = memo(function HighlightedLine({ line }: { line: string }) {
  const tokens = tokenizeLine(line)

  return (
    <>
      {tokens.map((token, i) => {
        const className = cn({
          "text-blue-400": token.type === "command",
          "text-purple-400": token.type === "environment",
          "text-gray-500 italic": token.type === "comment",
          "text-pink-400": token.type === "math",
          "text-yellow-300": token.type === "bracket",
          "text-foreground": token.type === "text",
        })
        return (
          <span key={i} className={className}>
            {token.value}
          </span>
        )
      })}
    </>
  )
})

export function LaTeXEditor({ content, onChange, fileName, onClose, isDirty }: LaTeXEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [cursorLine, setCursorLine] = useState(0)

  const lines = useMemo(() => content.split("\n"), [content])
  
  // Calculate width based on longest line using ch units (character width in monospace)
  // This is more stable and predictable than pixel measurements
  const contentWidthCh = useMemo(() => {
    if (lines.length === 0) return 80 // Default minimum
    
    const longestLine = lines.reduce((max, line) => line.length > max.length ? line : max, lines[0])
    // Use ch units: 1ch = width of '0' in monospace font
    // Add generous padding (10ch on each side) to ensure all text is selectable
    return Math.max(longestLine.length + 20, 80)
  }, [lines])

  const updateCursorLine = useCallback(() => {
    if (textareaRef.current) {
      const pos = textareaRef.current.selectionStart
      const textBeforeCursor = content.slice(0, pos)
      const lineNumber = textBeforeCursor.split("\n").length - 1
      setCursorLine(lineNumber)
    }
  }, [content])

  useEffect(() => {
    updateCursorLine()
  }, [content, updateCursorLine])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newContent = content.slice(0, start) + "  " + content.slice(end)
      onChange(newContent)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  return (
    <div className="h-full flex flex-col bg-editor-bg" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Tab bar */}
      <div className="flex items-center bg-panel-header border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-editor-bg border-r border-border text-sm">
          <span className="text-primary font-medium">T</span>
          <span className="text-foreground">{fileName}</span>
          {isDirty ? (
            <Circle className="h-2 w-2 fill-current text-muted-foreground" />
          ) : null}
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-accent rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Editor area - fixed viewable width with horizontal scrolling */}
      <div 
        ref={editorContainerRef} 
        style={{ 
          flex: '1 1 0%',
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          position: 'relative',
          display: 'block'
        }}
      >
        {/* Content panel - expands horizontally beyond viewable window */}
        <div 
          className="flex" 
          style={{ 
            minHeight: `${lines.length * 24 + 16}px`, 
            width: 'max-content', 
            minWidth: '100%',
            position: 'relative'
          }}
        >
          {/* Line numbers gutter */}
          <div className="sticky left-0 flex-shrink-0 w-12 bg-editor-bg z-10 text-editor-line-number text-right text-sm font-mono select-none py-2 border-r border-border">
            {lines.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "px-2 h-6 leading-6",
                  i === cursorLine && "bg-editor-line-active text-foreground"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code area - expands to fit content width */}
          <div className="relative bg-editor-bg" style={{ width: `${contentWidthCh}ch`, minWidth: 'calc(100% - 3rem)' }}>
            {/* Syntax highlighted overlay */}
            <div
              className="absolute inset-0 pointer-events-none font-mono text-sm whitespace-pre p-2 z-0"
              style={{ width: `${contentWidthCh}ch`, minWidth: '100%' }}
              aria-hidden="true"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 leading-6",
                    i === cursorLine && "bg-editor-line-active"
                  )}
                >
                  <HighlightedLine line={line || " "} />
                </div>
              ))}
            </div>

            {/* Actual textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCursorLine}
              onClick={updateCursorLine}
              className="relative z-10 block font-mono text-sm leading-6 p-2 bg-transparent text-transparent caret-foreground resize-none outline-none whitespace-pre"
              style={{ 
                width: `${contentWidthCh}ch`,
                minWidth: '100%',
                overflow: 'hidden',
                color: 'transparent'
              }}
              spellCheck={false}
              wrap="off"
              rows={lines.length}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
