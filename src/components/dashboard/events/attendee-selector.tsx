"use client"

import { useState } from "react"
import { X, Plus, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGetUsersQuery } from "@/service/users"

// Mock data for users - replace with actual API call
// const mockUsers = [
//   { id: "1", name: "John Doe", email: "john@example.com", avatar: "" },
//   { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "" },
//   { id: "3", name: "Bob Johnson", email: "bob@example.com", avatar: "" },
//   { id: "4", name: "Alice Williams", email: "alice@example.com", avatar: "" },
//   { id: "5", name: "Charlie Brown", email: "charlie@example.com", avatar: "" },
// ]

interface Attendee {
  email: string
  name?: string
  optional?: boolean
}

interface AttendeeProps {
  value: Attendee[]
  onChange: (value: Attendee[]) => void
}

export function AttendeeSelector({ value, onChange }: AttendeeProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customEmail, setCustomEmail] = useState("")

  const { data, isLoading, isError } = useGetUsersQuery({ search })
  console.log("user data", data)

  if (isLoading) return <p>Loading users...</p>
  if (isError) return <p>Failed to load users.</p>

  const users = data?.users || []

  const handleAddUser = (user: { name: string | null; email: string }) => {
    if (!value.some((attendee) => attendee.email === user.email)) {
      onChange([...value, { email: user.email, name: user.name ?? undefined }])
    }
  }

  const handleAddCustomEmail = () => {
    if (
      customEmail &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail) &&
      !value.some((attendee) => attendee.email === customEmail)
    ) {
      onChange([...value, { email: customEmail }])
      setCustomEmail("")
    }
  }

  const handleRemoveAttendee = (email: string) => {
    onChange(value.filter((attendee) => attendee.email !== email))
  }

  const handleToggleOptional = (email: string) => {
    onChange(
      value.map((attendee) => (attendee.email === email ? { ...attendee, optional: !attendee.optional } : attendee)),
    )
  }

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((attendee) => (
          <Badge key={attendee.email} variant="secondary" className="flex items-center gap-1 pl-1">
            <Avatar className="h-5 w-5">
              <AvatarFallback>{attendee.name?.[0] || attendee.email[0]}</AvatarFallback>
            </Avatar>
            <span>{attendee.name || attendee.email}</span>
            {attendee.optional && <span className="text-xs text-muted-foreground">(optional)</span>}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => handleRemoveAttendee(attendee.email)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add Attendee
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
            <Command>
              <CommandInput placeholder="Search people..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground">No users found</p>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Add by email:</p>
                      <div className="flex gap-2">
                        <Input
                          size={1}
                          placeholder="email@example.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={handleAddCustomEmail}
                          disabled={!customEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <ScrollArea className="h-[200px]">
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          handleAddUser(user)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2 p-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback>{user.name?.[0] ?? user.email[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name ?? user.email}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <Check
                          className={`ml-auto h-4 w-4 ${value.some((a) => a.email === user.email) ? "opacity-100" : "opacity-0"
                            }`}
                        />
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
                <div className="p-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Add by email:</p>
                  <div className="flex gap-2">
                    <Input
                      size={1}
                      placeholder="email@example.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={handleAddCustomEmail}
                      disabled={!customEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {value.length > 0 && (
        <div className="mt-2 border rounded-md p-2">
          <p className="text-xs font-medium mb-2">Attendee Options</p>
          <div className="space-y-2">
            {value.map((attendee) => (
              <div key={attendee.email} className="flex items-center gap-2">
                <Checkbox
                  id={`optional-${attendee.email}`}
                  checked={attendee.optional}
                  onCheckedChange={() => handleToggleOptional(attendee.email)}
                />
                <label
                  htmlFor={`optional-${attendee.email}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{attendee.name || attendee.email}</span>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

