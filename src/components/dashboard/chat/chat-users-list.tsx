"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreateChatRoomMutation } from "@/service/chats"
import { useGetUsersQuery } from "@/service/users"
import { MessageSquare } from "lucide-react"

interface ChatUsersListProps {
  search: string
  onUserSelect: (userId: string) => void
}

export function ChatUsersList({ search, onUserSelect }: ChatUsersListProps) {
  const { data, isLoading, isError } = useGetUsersQuery({ search })
  const { mutate: createRoom, isPending } = useCreateChatRoomMutation()

  function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ('00' + value.toString(16)).substr(-2)
    }
    return color
  }

  const handleUserClick = (userId: string) => {
    createRoom(
      { participants: [userId] },
      {
        onSuccess: (data) => {
          onUserSelect(data.room.id)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Failed to load users</p>
      </div>
    )
  }

  if (data?.users.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] space-y-1 p-2">
      {data?.users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted transition-colors bg-white"
        >
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback style={{ backgroundColor: stringToColor(user.id), color: "#fff" }}>{user.name?.substring(0, 2) || user.email?.substring(0, 2) || "U"}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-medium text-sm">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => handleUserClick(user.id)}
            disabled={isPending}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </ScrollArea>
  )
}

