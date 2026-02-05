"use client"

import { useState, useCallback } from "react"
import { FileExplorer, type FileNode } from "./file-explorer"
import { LaTeXEditor } from "./latex-editor"
import { PDFPreview } from "./pdf-preview"
import { AIChat } from "./ai-chat"
import { Terminal } from "./terminal"
import { ResizablePanel } from "./resizable-panel"
import { Settings, PanelLeftClose, PanelLeft, PanelBottomClose, PanelBottom, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DEFAULT_LATEX_CONTENT = `\\documentclass{article}
\\usepackage{hyperref}

\\title{Welcome to OpenPrism}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

A \\textbf{private}, \\textbf{open-source} scientific writing workspace. Unlike cloud-based alternatives, your documents never leave your browser.

\\subsection{Why OpenPrism?}

\\begin{itemize}
  \\item \\textbf{100\\% Local} -- Your research stays on your device
  \\item \\textbf{No Data Collection} -- We can't see your work, ever
  \\item \\textbf{Open Source} -- Audit the code yourself
  \\item \\textbf{AI Powered} -- Local WebGPU models, no cloud APIs
\\end{itemize}

\\section{Mathematical Examples}

OpenPrism supports full LaTeX math rendering using KaTeX. Here are some examples:

\\subsection{Inline Math}

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ for the equation $ax^2 + bx + c = 0$.

The Fourier transform: $f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2 \\pi i \\xi x} \\, d\\xi$

\\subsection{Display Math}

The Euler-Lagrange equation:
$$
\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}} = \\frac{\\partial L}{\\partial q}
$$

The Schrödinger equation:
$$
i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r}, t) = \\hat{H}\\Psi(\\mathbf{r}, t)
$$

\\subsection{Complex Equations}

Matrix multiplication:
$$
\\mathbf{C} = \\mathbf{A} \\times \\mathbf{B} = \\begin{pmatrix}
a_{11} & a_{12} \\\\
a_{21} & a_{22}
\\end{pmatrix}
\\begin{pmatrix}
b_{11} & b_{12} \\\\
b_{21} & b_{22}
\\end{pmatrix}
$$

Summation and integration:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}, \\quad \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = e^x
$$

Piecewise functions:
$$
f(n) = \\begin{cases} \\frac{n}{2}, & \\text{if } n\\text{ is even} \\\\ 3n+1, & \\text{if } n\\text{ is odd} \\end{cases}
$$

\\section{Feature Comparison}

\\begin{description}
  \\item[Privacy] OpenPrism: $\\checkmark$ \\quad Cloud Alternatives: $\\times$
  \\item[Local Processing] OpenPrism: $\\checkmark$ \\quad Cloud Alternatives: $\\times$
  \\item[Offline Support] OpenPrism: $\\checkmark$ \\quad Cloud Alternatives: $\\times$
\\end{description}

\\section{Text Formatting}

\\subsection{Fonts and Emphasis}

\\textit{You can also \\emph{emphasize} text if it is set in italics,} \\textsf{in a \\emph{sans-serif} font,} \\texttt{or in \\emph{typewriter} style.}

\\subsection{Special Characters}

Special characters must be escaped: \\$ \\& \\% \\# \\_ \\{ \\} \\~{} \\^{} \\textbackslash

Greek letters: $\\alpha, \\beta, \\gamma, \\delta, \\theta, \\lambda, \\mu, \\pi, \\sigma, \\omega$

\\section{Environments}

\\subsection{Lists}

Nested lists work perfectly:

\\begin{enumerate}
  \\item First item
  \\begin{itemize}
    \\item Nested item
    \\item Another nested item
  \\end{itemize}
  \\item Second item
  \\begin{description}
    \\item[Term] Definition
    \\item[Another Term] Another definition
  \\end{description}
\\end{enumerate}

\\subsection{Quotes}

\\begin{quote}
On average, no line should be longer than 66 characters.
\\end{quote}

\\section{Getting Started}

Edit this document and watch the preview update in real-time. Everything compiles locally in your browser.

\\subsection{Document Structure}

\\begin{enumerate}
  \\item Introduction
  \\item Methods
  \\item Results
  \\item Discussion
\\end{enumerate}

\\section{Local AI Assistant}

The AI panel runs \\emph{entirely in your browser} using WebGPU:
\\begin{itemize}
  \\item No API keys needed
  \\item No cloud processing
  \\item Your prompts stay private
\\end{itemize}

\\end{document}`



const INITIAL_FILES: FileNode[] = [
  {
    id: "root",
    name: "latex-project",
    type: "folder",
    children: [
      {
        id: "main",
        name: "main.tex",
        type: "file",
        content: DEFAULT_LATEX_CONTENT,
      },
      {
        id: "chapters",
        name: "chapters",
        type: "folder",
        children: [
          {
            id: "chapter1",
            name: "chapter1.tex",
            type: "file",
            content: `\\section{Introduction}

This is the first chapter of our document.

\\subsection{Background}

Some background information goes here.

\\subsection{Motivation}

Why this work is important.
`,
          },
          {
            id: "chapter2",
            name: "chapter2.tex",
            type: "file",
            content: `\\section{Methods}

This chapter describes our methodology.

\\subsection{Data Collection}

How we collected data.

\\subsection{Analysis}

How we analyzed the data.
`,
          },
        ],
      },
      {
        id: "preamble",
        name: "preamble.tex",
        type: "file",
        content: `% Custom preamble
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\geometry{margin=1in}

% Custom commands
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\N}{\\mathbb{N}}
\\newcommand{\\Z}{\\mathbb{Z}}
`,
      },
      {
        id: "bibliography",
        name: "bibliography.bib",
        type: "file",
        content: `@article{example2024,
  author = {Author, Example},
  title = {An Example Article},
  journal = {Journal of Examples},
  year = {2024},
  volume = {1},
  pages = {1-10},
}
`,
      },
    ],
  },
]

function findFileById(files: FileNode[], id: string): FileNode | null {
  for (const file of files) {
    if (file.id === id) return file
    if (file.children) {
      const found = findFileById(file.children, id)
      if (found) return found
    }
  }
  return null
}

function updateFileContent(
  files: FileNode[],
  id: string,
  content: string
): FileNode[] {
  return files.map((file) => {
    if (file.id === id) {
      return { ...file, content }
    }
    if (file.children) {
      return { ...file, children: updateFileContent(file.children, id, content) }
    }
    return file
  })
}

function addFileToTree(
  files: FileNode[],
  parentId: string | null,
  newFile: FileNode
): FileNode[] {
  if (parentId === null) {
    // Add to root
    return [...files, newFile]
  }

  return files.map((file) => {
    if (file.id === parentId && file.type === "folder") {
      return {
        ...file,
        children: [...(file.children || []), newFile],
      }
    }
    if (file.children) {
      return { ...file, children: addFileToTree(file.children, parentId, newFile) }
    }
    return file
  })
}

function removeFileFromTree(files: FileNode[], id: string): FileNode[] {
  return files
    .filter((file) => file.id !== id)
    .map((file) => {
      if (file.children) {
        return { ...file, children: removeFileFromTree(file.children, id) }
      }
      return file
    })
}

export function IDELayout() {
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES)
  const [selectedFileId, setSelectedFileId] = useState<string | null>("main")
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set())
  const [showSidebar, setShowSidebar] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(true)

  const selectedFile = selectedFileId ? findFileById(files, selectedFileId) : null

  const handleContentChange = useCallback(
    (content: string) => {
      if (!selectedFileId) return
      setFiles((prev) => updateFileContent(prev, selectedFileId, content))
      setDirtyFiles((prev) => new Set(prev).add(selectedFileId))
    },
    [selectedFileId]
  )

  const handleCreateFile = useCallback(
    (parentId: string | null, type: "file" | "folder") => {
      const name = type === "file" ? "untitled.tex" : "new-folder"
      const newFile: FileNode = {
        id: `${type}-${Date.now()}`,
        name,
        type,
        content: type === "file" ? "" : undefined,
        children: type === "folder" ? [] : undefined,
      }
      setFiles((prev) => addFileToTree(prev, parentId || "root", newFile))
    },
    []
  )

  const handleDeleteFile = useCallback(
    (id: string) => {
      setFiles((prev) => removeFileFromTree(prev, id))
      if (selectedFileId === id) {
        setSelectedFileId(null)
      }
    },
    [selectedFileId]
  )

  const handleRenameFile = useCallback((id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          return { ...file, name: newName }
        }
        if (file.children) {
          return {
            ...file,
            children: file.children.map((child) =>
              child.id === id ? { ...child, name: newName } : child
            ),
          }
        }
        return file
      })
    )
  }, [])

  const handleInsertCode = useCallback(
    (code: string) => {
      if (!selectedFile?.content) return
      const newContent = selectedFile.content + "\n\n" + code
      handleContentChange(newContent)
    },
    [selectedFile, handleContentChange]
  )

  const editorContent = selectedFile?.content || ""

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Title bar */}
      <div className="h-10 flex items-center justify-between px-4 bg-panel-header border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <span className="font-semibold text-sm">OpenPrism</span>
          </div>
          <span className="text-muted-foreground text-xs">Your data stays yours</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowTerminal(!showTerminal)}
            title={showTerminal ? "Hide terminal" : "Show terminal"}
          >
            {showTerminal ? (
              <PanelBottomClose className="h-4 w-4" />
            ) : (
              <PanelBottom className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowAIPanel(!showAIPanel)}
            title={showAIPanel ? "Hide AI panel" : "Show AI panel"}
          >
            {showAIPanel ? (
              <X className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar + Main panels */}
        <ResizablePanel
          direction="vertical"
          defaultSize={showTerminal ? 75 : 100}
          minSize={showTerminal ? 40 : 100}
          maxSize={showTerminal ? 90 : 100}
          className="flex-1"
        >
          {/* Top section: Sidebar + Editor + Preview + AI */}
          <div className="h-full flex">
            {/* Sidebar */}
            {showSidebar && (
              <div className="w-60 border-r border-border shrink-0">
                <FileExplorer
                  files={files}
                  selectedFile={selectedFileId}
                  onSelectFile={setSelectedFileId}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                />
              </div>
            )}

            {/* Editor + Preview + AI */}
            <div className="flex-1 flex min-w-0">
              {/* Editor + Preview */}
              <ResizablePanel
                direction="horizontal"
                defaultSize={50}
                minSize={20}
                maxSize={80}
                className={showAIPanel ? "flex-1" : "flex-1"}
              >
                {/* LaTeX Editor */}
                {selectedFile && selectedFile.type === "file" ? (
                  <LaTeXEditor
                    content={selectedFile.content || ""}
                    onChange={handleContentChange}
                    fileName={selectedFile.name}
                    isDirty={dirtyFiles.has(selectedFile.id)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-editor-bg text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">No file selected</p>
                      <p className="text-sm">Select a file from the explorer to start writing</p>
                    </div>
                  </div>
                )}

                {/* PDF Preview */}
                <PDFPreview latexContent={editorContent} />
              </ResizablePanel>

              {/* AI Panel */}
              {showAIPanel && (
                <div className="w-80 border-l border-border shrink-0">
                  <AIChat
                    editorContent={editorContent}
                    onInsertCode={handleInsertCode}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terminal */}
          {showTerminal ? (
            <Terminal onMinimize={() => setShowTerminal(false)} />
          ) : (
            <div className="h-0" />
          )}
        </ResizablePanel>
      </div>
    </div>
  )
}
