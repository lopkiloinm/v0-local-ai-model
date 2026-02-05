"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ZoomIn, ZoomOut, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PDFPreviewProps {
  latexContent: string
  className?: string
}

export function PDFPreview({ latexContent, className }: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compileTime, setCompileTime] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastContentRef = useRef<string>("")
  const latexjsRef = useRef<any>(null)

  // Load latex.js on mount
  useEffect(() => {
    async function loadLatexJS() {
      try {
        // Import latex.js - it exports parse and HtmlGenerator
        const latexjs = await import("latex.js")
        // latex.js exports: parse, HtmlGenerator, Generator, etc.
        latexjsRef.current = latexjs
        setIsLoading(false)
        console.log("[OpenPrism] latex.js loaded successfully", Object.keys(latexjs))
      } catch (err) {
        console.error("[OpenPrism] Failed to load latex.js:", err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(`Failed to load LaTeX engine: ${errorMessage}. Check browser console for details.`)
        setIsLoading(false)
      }
    }
    
    // Only load if not already loaded (prevents re-loading on Fast Refresh)
    if (!latexjsRef.current) {
      loadLatexJS()
    } else {
      console.log("[OpenPrism] latex.js already loaded, skipping reload")
      setIsLoading(false)
    }
  }, [])

  const compile = useCallback(async (content: string, force = false) => {
    // Auto-recover from missing refs (e.g., after Fast Refresh)
    if (!latexjsRef.current) {
      console.warn("[OpenPrism] latexjs ref lost, reloading...")
      setIsLoading(true)
      try {
        const latexjs = await import("latex.js")
        latexjsRef.current = latexjs
        setIsLoading(false)
        console.log("[OpenPrism] Reloaded latex.js successfully")
        // Continue with compilation after reload
      } catch (err) {
        console.error("[OpenPrism] Failed to reload latex.js:", err)
        setIsLoading(false)
        setError("LaTeX engine not available. Please try again.")
        return
      }
    }
    
    if (!iframeRef.current) {
      console.warn("[OpenPrism] iframe ref not available - iframe may not be mounted yet")
      setError("Preview iframe not ready. The iframe may still be mounting. Please wait a moment and try again.")
      setIsCompiling(false)
      return
    }
    
    // Always compile if force=true (retry button), or if content changed
    const contentChanged = content !== lastContentRef.current
    if (!force && !contentChanged) {
      console.log("[OpenPrism] Skipping compilation: content unchanged and not forced")
      return
    }
    
    console.log("[OpenPrism] Starting compilation", { force, contentChanged, contentLength: content.length })
    
    setIsCompiling(true)
    setError(null)
    const startTime = performance.now()
    
    // Clear iframe content before starting (important for retries after errors)
    const iframe = iframeRef.current
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          iframeDoc.open()
          iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>')
          iframeDoc.close()
        }
      } catch (e) {
        // Ignore errors when clearing iframe - it might not be accessible
        console.warn("[OpenPrism] Could not clear iframe:", e)
      }
    }

    try {
      const latexjs = latexjsRef.current
      
      if (!latexjs) {
        throw new Error("LaTeX engine not loaded. Please wait for initialization.")
      }

      // latex.js usage
      // latex.js exports: parse, HtmlGenerator, Generator
      // According to docs: parse returns the generator, then call htmlDocument() on it
      const { parse, HtmlGenerator } = latexjs
      
      if (!parse || typeof parse !== 'function') {
        throw new Error("latex.js parse function not found")
      }
      
      if (!HtmlGenerator || typeof HtmlGenerator !== 'function') {
        throw new Error("latex.js HtmlGenerator not found")
      }

      // Create a fresh generator instance for each compilation
      // This ensures clean state even after errors
      // According to latex.js docs, reset() should be called before creating a second document
      // But creating a new instance is safer and ensures complete clean state
      const generator = new HtmlGenerator({
        hyphenate: true,
      })
      
      // Reset the generator to ensure clean state (though we're using a new instance)
      // This is extra safety in case generator state persists somehow
      if (typeof generator.reset === 'function') {
        generator.reset()
      }

      // Parse LaTeX - parse() returns the generator itself
      // If parsing fails, it will throw a SyntaxError
      let resultGenerator
      try {
        console.log("[OpenPrism] Parsing LaTeX content...")
        resultGenerator = parse(content, { generator })
        console.log("[OpenPrism] LaTeX parsed successfully")
      } catch (parseError: any) {
        // latex.js throws SyntaxError for parse errors
        console.error("[OpenPrism] Parse error:", parseError)
        if (parseError && parseError.name === 'SyntaxError') {
          throw new Error(`LaTeX syntax error: ${parseError.message || 'Invalid LaTeX syntax'}`)
        }
        throw parseError
      }
      
      // Get the HTML document from the generator
      // Use CDN baseURL for assets (CSS, JS, fonts)
      // Note: Iframe sandbox may block external CDN resources on Vercel
      // The sandbox attribute restricts iframe from loading external resources
      const baseURL = "https://cdn.jsdelivr.net/npm/latex.js@0.12.6/dist/"
      const htmlDocument = resultGenerator.htmlDocument(baseURL)
      
      // Apply zoom transform to the document
      const body = htmlDocument.body
      if (body) {
        body.style.transform = `scale(${zoom / 100})`
        body.style.transformOrigin = 'top left'
        body.style.width = `${100 / (zoom / 100)}%`
      }

      // Serialize the complete HTML document
      const htmlString = htmlDocument.documentElement.outerHTML
      
      // Write to iframe
      // Clear any previous content first to ensure clean state
      const iframe = iframeRef.current
      if (!iframe) {
        throw new Error("Preview iframe not available")
      }
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error("Cannot access iframe document")
      }
      
      // Clear previous content and write new content
      iframeDoc.open()
      iframeDoc.write(htmlString)
      iframeDoc.close()

      // Only update lastContentRef on successful compilation
      // This allows retries to work even if content hasn't changed
      lastContentRef.current = content
      setCompileTime(Math.round(performance.now() - startTime))
      setError(null)
      console.log("[OpenPrism] Compilation successful")
    } catch (err) {
      console.error("[OpenPrism] LaTeX compilation error:", err)
      const message = err instanceof Error ? err.message : "Compilation failed"
      setError(message)
      // IMPORTANT: Don't update lastContentRef on error
      // This ensures retry will work even if content appears the same
      console.log("[OpenPrism] Compilation failed, lastContentRef not updated to allow retry")
    } finally {
      setIsCompiling(false)
    }
  }, [zoom])

  // Manual compilation only - no automatic compilation
  // Compilation will only happen when user clicks the compile button

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
    console.log("[OpenPrism] Retry button clicked, forcing recompile")
    console.log("[OpenPrism] Refs check:", {
      iframe: !!iframeRef.current,
      latexjs: !!latexjsRef.current,
      contentLength: latexContent.length
    })
    // Always force recompile when retry is clicked
    // Clear error state first to ensure clean retry
    setError(null)
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
        ) : null}
        {/* Always render iframe (even when error) so ref is always available */}
        <div className="p-4 flex justify-center" style={{ display: error ? 'none' : 'flex' }}>
          <div className="bg-white shadow-lg max-w-[8.5in] w-full">
            <iframe
              ref={iframeRef}
              className="w-full min-h-[11in] border-0"
              title="LaTeX Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
