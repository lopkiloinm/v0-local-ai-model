"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  checkWebGPUSupport,
  isModelLoaded,
  isModelLoading,
  isDownloading,
  setProgressCallback,
  isV0Preview,
  generateChatResponse,
  type DownloadStats,
} from "@/lib/webgpu-model"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface AIChatProps {
  editorContent: string
  onInsertCode: (code: string) => void
}

export function AIChat({ editorContent, onInsertCode }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to OpenPrism's private AI assistant. I run entirely on your device using WebGPU - your prompts and documents are never uploaded anywhere. Ask me about LaTeX formatting, equations, tables, or document structure.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [modelStatus, setModelStatus] = useState<"checking" | "unsupported" | "not-loaded" | "downloading" | "loading" | "ready" | "v0-preview">("checking")
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadStats, setDownloadStats] = useState<DownloadStats>({ downloadedBytes: 0, totalBytes: 0, speedBytesPerSecond: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check WebGPU support and model status
  useEffect(() => {
    const checkStatus = () => {
      if (typeof window === "undefined") return

      // Check if running in v0 preview
      if (isV0Preview()) {
        setModelStatus("v0-preview")
        return
      }

      if (!checkWebGPUSupport()) {
        setModelStatus("unsupported")
        return
      }

      if (isModelLoaded()) {
        setModelStatus("ready")
      } else if (isModelLoading()) {
        if (isDownloading()) {
          setModelStatus("downloading")
        } else {
          setModelStatus("loading")
        }
      } else {
        setModelStatus("not-loaded")
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  // Track download progress
  useEffect(() => {
    setProgressCallback((progress, stats) => {
      setDownloadProgress(progress)
      if (stats) {
        setDownloadStats(stats)
      }
    })
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadModel = useCallback(async () => {
    if (modelStatus === "unsupported") return
    
    setModelStatus("downloading")
    try {
      const { scheduleBackgroundDownload } = await import("@/lib/webgpu-model")
      scheduleBackgroundDownload(0)
    } catch {
      setModelStatus("not-loaded")
    }
  }, [modelStatus])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    try {
      let response = ""
      
      // Use the local model if ready, otherwise fall back to hardcoded responses
      if (modelStatus === "ready" && isModelLoaded()) {
        // Use the actual WebGPU model
        response = await generateChatResponse(userMessage.content, editorContent)
      } else {
        // Fallback responses when model isn't loaded
        const query = userMessage.content.toLowerCase()

        if (query.includes("help") || query.includes("what can you do")) {
          response = `I can help you with:

1. **Document formatting** - sections, lists, tables
2. **Text styling** - bold, italic, emphasis
3. **Code examples** - LaTeX syntax snippets
4. **Writing suggestions** - structure and style

Load the AI model for more advanced assistance!`
        } else if (query.includes("table")) {
          response = `Here's how to create a table:

\`\`\`latex
\\begin{tabular}{|c|c|c|}
\\hline
Header 1 & Header 2 & Header 3 \\\\
\\hline
Cell 1 & Cell 2 & Cell 3 \\\\
\\hline
\\end{tabular}
\`\`\``
        } else if (query.includes("heading") || query.includes("section")) {
          response = `Sections in LaTeX:

\`\`\`latex
\\section{Main Section}
\\subsection{Subsection}
\\subsubsection{Sub-subsection}
\`\`\``
        } else if (query.includes("list")) {
          response = `Lists in LaTeX:

\`\`\`latex
\\begin{itemize}
  \\item Bullet item
  \\item Another item
\\end{itemize}

\\begin{enumerate}
  \\item Numbered
  \\item Items
\\end{enumerate}
\`\`\``
        } else if (query.includes("bold") || query.includes("italic") || query.includes("format")) {
          response = `Text formatting in LaTeX:

\`\`\`latex
\\textbf{Bold text}
\\textit{Italic text}
\\emph{Emphasized text}
\\underline{Underlined text}
\\texttt{Monospace text}
\`\`\``
        } else {
          response = `I'm running in basic mode. Load the AI model for full conversational assistance.

I can help with common LaTeX questions - try asking about tables, sections, lists, or formatting.`
        }
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error generating a response. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user"
    const isSystem = message.role === "system"

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 p-4",
          isUser && "bg-accent/30",
          isSystem && "bg-primary/5 border-l-2 border-primary"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : isSystem ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">
            {isUser ? "You" : isSystem ? "System" : "AI Assistant"}
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
            {message.content.split("```").map((part, i) => {
              if (i % 2 === 1) {
                // Code block
                const [lang, ...code] = part.split("\n")
                return (
                  <div key={i} className="my-2 rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-1 text-xs text-muted-foreground flex justify-between items-center">
                      <span>{lang || "typst"}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => onInsertCode(code.join("\n"))}
                      >
                        Insert
                      </Button>
                    </div>
                    <pre className="bg-editor-bg p-3 text-xs overflow-x-auto">
                      <code>{code.join("\n")}</code>
                    </pre>
                  </div>
                )
              }
              // Regular text with inline code
              return part.split("`").map((segment, j) => {
                if (j % 2 === 1) {
                  return (
                    <code
                      key={`${i}-${j}`}
                      className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                    >
                      {segment}
                    </code>
                  )
                }
                // Process bold text
                return segment.split("**").map((boldPart, k) => {
                  if (k % 2 === 1) {
                    return <strong key={`${i}-${j}-${k}`}>{boldPart}</strong>
                  }
                  return <span key={`${i}-${j}-${k}`}>{boldPart}</span>
                })
              })
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-panel-header">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Local AI</span>
        </div>
        <div className="flex items-center gap-2">
          {modelStatus === "unsupported" && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>WebGPU not supported</span>
            </div>
          )}
          {modelStatus === "not-loaded" && (
            <Button variant="outline" size="sm" onClick={loadModel} className="h-7 text-xs bg-transparent">
              <Download className="h-3 w-3 mr-1" />
              Load Model
            </Button>
          )}
          {modelStatus === "downloading" && (
            <div className="flex flex-col gap-1.5 w-44">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {(downloadStats.downloadedBytes / (1000 * 1000)).toFixed(0)}/{(downloadStats.totalBytes / (1000 * 1000)).toFixed(0)} MB
                </span>
                <span className="text-primary">
                  {downloadStats.speedBytesPerSecond > 0 
                    ? `${(downloadStats.speedBytesPerSecond / (1000 * 1000)).toFixed(1)} MB/s`
                    : "-- MB/s"}
                </span>
              </div>
            </div>
          )}
          {modelStatus === "loading" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          {modelStatus === "ready" && (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Ready</span>
            </div>
          )}
          {modelStatus === "v0-preview" && (
            <span className="text-xs text-muted-foreground">Deploy to enable</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        {messages.map(renderMessage)}
        {isGenerating && (
          <div className="flex gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything - it stays on your device..."
            className="flex-1 min-h-[60px] max-h-[120px] p-3 bg-input border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
