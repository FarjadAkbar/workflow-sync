"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { SocketUser, SocketInstance } from "@/types/type"

type CallType = "audio" | "video"

interface CallState {
  isIncoming: boolean
  isOutgoing: boolean
  isActive: boolean
  isGroup: boolean
  callType: CallType
  roomId: string | null
  participants: SocketUser[]
  caller: SocketUser | null
}

interface CallContextType {
  callState: CallState
  startCall: (roomId: string, participants: SocketUser[], callType: CallType, isGroup: boolean) => void
  answerCall: () => void
  rejectCall: () => void
  endCall: () => void
  incomingCall: (caller: SocketUser, roomId: string, callType: CallType, isGroup: boolean, participants: SocketUser[]) => void
}

const initialCallState: CallState = {
  isIncoming: false,
  isOutgoing: false,
  isActive: false,
  isGroup: false,
  callType: "audio",
  roomId: null,
  participants: [],
  caller: null,
}

const CallContext = createContext<CallContextType | undefined>(undefined)

export function CallProvider({ children, user, socket }: { children: React.ReactNode; user: SocketUser; socket: SocketInstance | null }) {
  const [callState, setCallState] = useState<CallState>(initialCallState)
  const { toast } = useToast()
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({})

  // Clean up function for media streams and connections
  const cleanupCall = () => {
    // Stop all tracks in the local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close())
    peerConnectionsRef.current = {}
  }

  // Reset call state
  const resetCallState = () => {
    setCallState(initialCallState)
  }

  // Handle starting a call
  const startCall = async (roomId: string, participants: SocketUser[], callType: CallType, isGroup: boolean) => {
    try {
      // Request media based on call type
      const constraints = {
        audio: true,
        video: callType === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      // Update call state
      setCallState({
        isIncoming: false,
        isOutgoing: true,
        isActive: false,
        isGroup,
        callType,
        roomId,
        participants,
        caller: null,
      })

      // Emit call event to server
      socket?.emit("call:start", {
        roomId,
        participants: participants.map((p) => p.id),
        callType,
        isGroup,
        caller: user,
      })

      // Show toast notification
      toast({
        title: "Calling...",
        description: isGroup ? "Starting group call" : `Calling ${participants[0]?.name}`,
      })
    } catch (error) {
      console.error("Error starting call:", error)
      toast({
        title: "Call Failed",
        description: "Could not access camera or microphone",
        variant: "destructive",
      })
      resetCallState()
    }
  }

  // Handle incoming call
  const incomingCall = (caller: SocketUser, roomId: string, callType: CallType, isGroup: boolean, participants: SocketUser[]) => {
    setCallState({
      isIncoming: true,
      isOutgoing: false,
      isActive: false,
      isGroup,
      callType,
      roomId,
      participants,
      caller,
    })
  }

  // Handle answering a call
  const answerCall = async () => {
    try {
      // Request media based on call type
      const constraints = {
        audio: true,
        video: callState.callType === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      // Update call state
      setCallState((prev) => ({
        ...prev,
        isIncoming: false,
        isActive: true,
      }))

      // Emit answer event to server
      socket?.emit("call:answer", {
        roomId: callState.roomId,
        answerer: user,
      })
    } catch (error) {
      console.error("Error answering call:", error)
      toast({
        title: "Call Failed",
        description: "Could not access camera or microphone",
        variant: "destructive",
      })
      resetCallState()
    }
  }

  // Handle rejecting a call
  const rejectCall = () => {
    // Emit reject event to server
    if (callState.roomId) {
      socket?.emit("call:reject", {
        roomId: callState.roomId,
        rejecter: user,
      })
    }

    // Clean up and reset state
    cleanupCall()
    resetCallState()
  }

  // Handle ending a call
  const endCall = () => {
    // Emit end event to server
    if (callState.roomId) {
      socket?.emit("call:end", {
        roomId: callState.roomId,
        ender: user,
      })
    }

    // Clean up and reset state
    cleanupCall()
    resetCallState()
  }

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Handle incoming call
    socket.on("call:incoming", (data: { caller: SocketUser; roomId: string; callType: CallType; isGroup: boolean; participants: SocketUser[] }) => {
      incomingCall(data.caller, data.roomId, data.callType, data.isGroup, data.participants)
    })

    // Handle call accepted
    socket.on("call:accepted", (data: { answerer: SocketUser }) => {
      setCallState((prev) => ({
        ...prev,
        isOutgoing: false,
        isActive: true,
      }))
    })

    // Handle call rejected
    socket.on("call:rejected", (data: { rejecter: SocketUser }) => {
      toast({
        title: "Call Rejected",
        description: `${data.rejecter.name} rejected the call`,
      })
      cleanupCall()
      resetCallState()
    })

    // Handle call ended
    socket.on("call:ended", (data: { ender: SocketUser }) => {
      toast({
        title: "Call Ended",
        description: `${data.ender.name} ended the call`,
      })
      cleanupCall()
      resetCallState()
    })

    // Clean up event listeners
    return () => {
      socket.off("call:incoming")
      socket.off("call:accepted")
      socket.off("call:rejected")
      socket.off("call:ended")
    }
  }, [socket, user])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupCall()
    }
  }, [])

  return (
    <CallContext.Provider
      value={{
        callState,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        incomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const context = useContext(CallContext)
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider")
  }
  return context
}
