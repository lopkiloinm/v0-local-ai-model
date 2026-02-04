"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ZoomIn, ZoomOut, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PDFPreviewProps {
  latexContent: string
  className?: string
}

// Load latex.js from CDN
function loadLatexJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).latexjs) {
      resolve((window as any).latexjs)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/latex.js@0.12.6/dist/latex.min.js"
    script.async = true
    script.onload = () => {
      if ((window as any).latexjs) {
        resolve((window as any).latexjs)
      } else {
        reject(new Error("latex.js loaded but not available on window"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load latex.js from CDN"))
    document.head.appendChild(script)
  })
}

export function PDFPreview({ latexContent, className }: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compileTime, setCompileTime] = useState<number | null>(null)
  const compileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastContentRef = useRef<string>("")
  const latexjsRef = useRef<any>(null)

  // Load latex.js on mount
  useEffect(() => {
    loadLatexJS()
      .then((latexjs) => {
        latexjsRef.current = latexjs
        setIsLoading(false)
        console.log("[v0] latex.js loaded successfully")
      })
      .catch((err) => {
        console.error("[v0] Failed to load latex.js:", err)
        setError("Failed to load LaTeX engine")
        setIsLoading(false)
      })
  }, [])

  const compile = useCallback(async (content: string, force = false) => {
    if (!iframeRef.current || !latexjsRef.current) return
    if (!force && content === lastContentRef.current) return
    
    setIsCompiling(true)
    setError(null)
    const startTime = performance.now()

    try {
      const latexjs = latexjsRef.current
      
      // Parse and generate HTML
      const generator = latexjs.parse(content, { generator: new latexjs.HtmlGenerator({ hyphenate: false }) })
      const doc = generator.htmlDocument()
      
      // Serialize to string
      const serializer = new XMLSerializer()
      let htmlString = serializer.serializeToString(doc)
      
      // Inject zoom styling and latex.js CSS
      const zoomStyle = `<style>
        body { 
          transform: scale(${zoom / 100}); 
          transform-origin: top left; 
          width: ${10000 / zoom}%;
          margin: 0;
          padding: 20px;
          font-family: "Computer Modern Serif", serif;
        }
      </style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/latex.js@0.12.6/dist/css/base.css">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/latex.js@0.12.6/dist/css/article.css">`
      htmlString = htmlString.replace('</head>', `${zoomStyle}</head>`)
      
      // Write to iframe
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlString)
        iframeDoc.close()
      }

      // Only update lastContentRef on successful compile
      lastContentRef.current = content
      setCompileTime(Math.round(performance.now() - startTime))
      setError(null)
    } catch (err) {
      console.error("[v0] LaTeX compilation error:", err)
      const message = err instanceof Error ? err.message : "Compilation failed"
      setError(message)
    } finally {
      setIsCompiling(false)
    }
  }, [zoom])

  // Debounced compilation on content change
  useEffect(() => {
    if (isLoading) return
    
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current)
    }

    compileTimeoutRef.current = setTimeout(() => {
      // Force recompile if there was an error
      compile(latexContent, error !== null)
    }, 600)

    return () => {
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current)
      }
    }
  }, [latexContent, compile, isLoading, error])

  // Recompile on zoom change
  useEffect(() => {
    if (isLoading) return
    if (lastContentRef.current) {
      compile(latexContent, true) // Force recompile
    }
  }, [zoom, latexContent, compile, isLoading])

  const handleDownloadTex = () => {
    const blob = new Blob([latexContent], { type: "text/x-tex" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "document.tex"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRecompile = () => {
    compile(latexContent, true)
  }

  return (
    <div className={cn("h-full flex flex-col bg-muted/30", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-panel-header border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preview
          </span>
          {(isCompiling || isLoading) && (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          )}
          {!isCompiling && !isLoading && compileTime !== null && (
            <span className="text-xs text-muted-foreground">{compileTime}ms</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRecompile}
            disabled={isCompiling || isLoading}
            title="Recompile"
          >
            <RefreshCw className={cn("h-4 w-4", isCompiling && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDownloadTex}
            title="Download .tex"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-neutral-200 dark:bg-neutral-800">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading LaTeX engine...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">Compilation Error</p>
            <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-md max-w-lg overflow-auto whitespace-pre-wrap">
              {error}
            </pre>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRecompile}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTex}>
                Download .tex
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex justify-center">
            <div className="bg-white shadow-lg max-w-[8.5in] w-full">
              <iframe
                ref={iframeRef}
                className="w-full min-h-[11in] border-0"
                title="LaTeX Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
