"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetChatRoomsQuery } from "@/service/chats"
import { formatDistanceToNow } from "date-fns"

interface ChatRoomsListProps {
  search: string
  activeRoomId: string | null
  onRoomSelect: (roomId: string) => void
}

export function ChatRoomsList({ search, activeRoomId, onRoomSelect }: ChatRoomsListProps) {
  const { data, isLoading, isError } = useGetChatRoomsQuery({ keyword: search })
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

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Failed to load chats</p>
      </div>
    )
  }

  if (data?.rooms.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No chats found</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {data?.rooms.map((room) => {
        const isActive = activeRoomId === room.id
        const lastMessage = room.lastMessage

        return (
          <div
            key={room.id}
            className={`flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors bg-white ${isActive ? "bg-muted" : ""
              }`}
            onClick={() => onRoomSelect(room.id)}
          >
            {room.isGroup ? (
              <Avatar className="h-10 w-10">
                <AvatarFallback>{room.name?.substring(0, 2) || "GR"}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarImage src={room.participants[0]?.avatar ?? undefined} />
                <AvatarFallback className="h-10 w-10" style={{ backgroundColor: stringToColor(room.participants[0]?.name || room.participants[0]?.email) }}>
                  {room.participants[0]?.name?.substring(0, 2) || room.participants[0]?.email?.substring(0, 2) || "DM"}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm truncate">{room.name}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {room.updatedAt ? formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true }) : ""}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {lastMessage ? (
                    <>
                      <span className="font-medium">{lastMessage.sender.name}: </span>
                      {lastMessage.content}
                    </>
                  ) : (
                    "No messages yet"
                  )}
                </p>

                {room.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 px-1.5 h-5 min-w-5 flex items-center justify-center">
                    {room.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

