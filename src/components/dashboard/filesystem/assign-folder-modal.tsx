"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useGetUsersQuery } from "@/service/users"
import SuspenseLoading from "@/components/loadings/suspense"
import { useAssignFolderMutation } from "@/service/files"

interface AssignFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: string
  folderName: string
}

export function AssignFolderModal({
  open,
  onOpenChange,
  folderId,
  folderName,
}: AssignFolderModalProps) {
  console.log(folderId, "folderId");
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [openCombobox, setOpenCombobox] = useState(false)

  const { data, isLoading } = useGetUsersQuery({ search: "" })
  const { mutate: assignFolderToUser, isPending } = useAssignFolderMutation()

  const handleAssign = async () => {
    if (!selectedUser) {
      toast({
        title: "No user selected",
        description: "Please select a user to assign this folder to.",
      })
      return
    }

    try {
      assignFolderToUser({
        userId: selectedUser,
        folderId,
      })
      toast({
        title: "Folder assigned",
        description: `Folder "${folderName}" has been assigned to ${selectedUserName}.`,
      })
      onOpenChange(false)
      setSelectedUser(null)
      setSelectedUserName("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign folder. Please try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Folder</DialogTitle>
          <DialogDescription>
            Assign folder "{folderName}" to a user. This will give them access to this folder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedUser ? selectedUserName : "Select user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {isLoading ? (
                        <SuspenseLoading />
                      ) : (
                        data?.users?.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={(value) => {
                              setSelectedUser(value === selectedUser ? null : value)
                              setSelectedUserName(user.name ?? "")
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedUser === user.id ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUser || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

