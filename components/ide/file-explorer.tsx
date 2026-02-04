"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  content?: string
}

interface FileExplorerProps {
  files: FileNode[]
  selectedFile: string | null
  onSelectFile: (id: string) => void
  onCreateFile: (parentId: string | null, type: "file" | "folder") => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
}

interface FileTreeItemProps {
  node: FileNode
  level: number
  selectedFile: string | null
  onSelectFile: (id: string) => void
  onCreateFile: (parentId: string | null, type: "file" | "folder") => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
  expandedFolders: Set<string>
  toggleFolder: (id: string) => void
}

function FileTreeItem({
  node,
  level,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  expandedFolders,
  toggleFolder,
}: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(node.id)
  const isSelected = selectedFile === node.id
  const isFolder = node.type === "folder"

  const getFileIcon = (name: string) => {
    if (name.endsWith(".tex")) {
      return <span className="text-primary text-xs font-bold">T</span>
    }
    if (name.endsWith(".bib")) {
      return <span className="text-yellow-400 text-xs font-bold">B</span>
    }
    if (name.endsWith(".pdf")) {
      return <span className="text-red-400 text-xs font-bold">P</span>
    }
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent/50 group text-sm",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.id)
          } else {
            onSelectFile(node.id)
          }
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate flex-1">{node.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {isFolder && (
              <>
                <DropdownMenuItem onClick={() => onCreateFile(node.id, "file")}>
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateFile(node.id, "folder")}>
                  New Folder
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => onDeleteFile(node.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              onCreateFile={onCreateFile}
              onDeleteFile={onDeleteFile}
              onRenameFile={() => {}}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root", "chapters"])
  )

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCreateFile(null, "file")}
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {files.map((node) => (
          <FileTreeItem
            key={node.id}
            node={node}
            level={0}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            onCreateFile={onCreateFile}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </div>
    </div>
  )
}
