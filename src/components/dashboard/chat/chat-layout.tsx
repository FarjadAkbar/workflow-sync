"use client"

import { useState } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { User } from "next-auth";
import { CallProvider } from "@/context/call-context";
import { useChatSocket } from "@/service/chats";
import { SocketUser } from "@/types/type";

function toSocketUser(user: User): SocketUser {
  return {
    id: user.id ?? "",
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    avatar: user.image ?? undefined,
  };
}

export function ChatLayout({ user }: { user: User }) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const socketUser = toSocketUser(user);
  const { socket } = useChatSocket(user, activeRoomId || undefined);
  
  return (
    <CallProvider user={socketUser} socket={socket}>
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar activeRoomId={activeRoomId} onRoomSelect={setActiveRoomId} />
      <ChatWindow roomId={activeRoomId} user={user} key={activeRoomId} />
    </div>
    </CallProvider>
  )
}

