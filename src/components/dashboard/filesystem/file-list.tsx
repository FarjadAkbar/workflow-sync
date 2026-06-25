"use client"

import { useState, useCallback, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ShareFileDialog } from "@/components/dashboard/filesystem/share-file-dialog"
import { toast } from "@/hooks/use-toast"
import { deleteFile } from "@/actions/filesystem"
import { File, Folder, MoreVertical, Download, Share2, Trash, Edit, User } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { AssignFolderModal } from "./assign-folder-modal"
import { FileSystemItem, FileListProps, ShareFileDialogProps, AssignFolderModalProps } from "@/types/filesystem"

export function FileList({ files, onFolderClick, isAdmin }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAssignFolderModal, setShowAssignFolderModal] = useState(false)

  // Memoize event handlers with useCallback
  const handleFileClick = useCallback(
    (file: FileSystemItem) => {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        onFolderClick(file.id)
      } else if (file.webViewLink) {
        window.open(file.webViewLink, "_blank")
      }
    },
    [onFolderClick],
  )

  const handleDeleteFile = useCallback(async (file: FileSystemItem) => {
    try {
      const result = await deleteFile(file.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `${file.name} has been deleted`,
      })

      // Refresh the file list
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }, [])

  // Memoize utility functions
  const formatFileSize = useCallback((bytes?: number) => {
    if (!bytes) return "Unknown size"

    const units = ["B", "KB", "MB", "GB", "TB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }, [])

  // Memoize the file icon rendering
  const renderFileIcon = useCallback((file: FileSystemItem) => {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      return <Folder className="h-5 w-5 text-blue-500" />
    } else if (file.mimeType.startsWith("image/")) {
      return (
        <div className="h-5 w-5 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
          {file.id ? (
            <Image
              src={`https://drive.google.com/uc?export=download&id=${file.id}` || "/placeholder.svg"}
              alt={file.name}
              width={70}
              height={70}
            />
          ) : (
            <File className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )
    } else {
      return <File className="h-5 w-5 text-gray-400" />
    }
  }, [])

  // Memoize the dropdown menu content
  const renderDropdownMenu = useCallback(
    (file: FileSystemItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {file.webViewLink && (
            <DropdownMenuItem asChild>
              <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Open
              </a>
            </DropdownMenuItem>
          )}

          {(isAdmin || file.permission === "edit") && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implement rename functionality
                  toast({
                    title: "Coming Soon",
                    description: "Rename functionality is coming soon",
                  })
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>

              {file.mimeType === "application/vnd.google-apps.folder" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(file)
                    setShowAssignFolderModal(true)
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Assign Folder
                </DropdownMenuItem>
              )}
            </>
          )}

          {isAdmin && file.dbId && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(file)
                  setShowShareDialog(true)
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFile(file)
                }}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [isAdmin, handleDeleteFile],
  )

  // Memoize the table rows
  const tableRows = useMemo(() => {
    return files.map((file) => (
      <TableRow key={file.id} className="cursor-pointer" onClick={() => handleFileClick(file)}>
        <TableCell>
          <div className="flex items-center gap-2">
            {renderFileIcon(file)}
            <span className="font-medium w-24 overflow-hidden whitespace-nowrap">{file.name}</span>
          </div>
        </TableCell>
        <TableCell>{file.size !== undefined ? formatFileSize(file.size) : "-"}</TableCell>
        <TableCell>{file.modifiedTime ? format(new Date(file.modifiedTime), "MMM d, yyyy") : "-"}</TableCell>
        <TableCell className="text-right">{renderDropdownMenu(file)}</TableCell>
      </TableRow>
    ))
  }, [files, handleFileClick, renderFileIcon, formatFileSize, renderDropdownMenu])

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </div>

      {selectedFile?.dbId && showAssignFolderModal && (
        <AssignFolderModal
          open={showAssignFolderModal}
          onOpenChange={setShowAssignFolderModal}
          folderId={selectedFile.dbId}
          folderName={selectedFile.name}
        />
      )}

      {selectedFile && showShareDialog && (
        <ShareFileDialog file={selectedFile} isOpen={showShareDialog} onClose={() => setShowShareDialog(false)} />
      )}
    </>
  )
}
