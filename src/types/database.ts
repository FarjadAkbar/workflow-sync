// Database model types (generated from Prisma)

import { Prisma } from "@prisma/client"

export type Project = Prisma.ProjectGetPayload<{
  include: {
    members: true
    sprints: true
    boards: true
  }
}>

export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: {
    members: {
      include: {
        user: true
      }
    }
  }
}>

export type Task = Prisma.TasksGetPayload<{
  include: {
    assignees: true
    sprint: true
    comments: true
    documents: true
  }
}>

export type TaskWithDetails = Prisma.TasksGetPayload<{
  include: {
    assignees: {
      include: {
        user: true
      }
    }
    sprint: true
    comments: {
      include: {
        assigned_user: true
      }
    }
    documents: {
      include: {
        document: true
      }
    }
    checklists: true
    subtasks: true
  }
}>

export type DbUser = Prisma.UsersGetPayload<{
  include: {
    memberOfProjects: true
    assignedTasks: true
    taskComments: true
  }
}>

export type Sprint = Prisma.SprintGetPayload<{
  include: {
    project: true
    tasks: true
  }
}>

export type ChatRoom = Prisma.ChatRoomGetPayload<{
  include: {
    messages: {
      include: {
        sender: true
      }
    }
    participants: {
      include: {
        user: true
      }
    }
  }
}>

export type ChatMessage = Prisma.ChatMessageGetPayload<{
  include: {
    sender: true
    room: true
  }
}>

export type CalendarEvent = Prisma.CalendarEventGetPayload<{
  include: {
    creator: true
    attendees: {
      include: {
        user: true
      }
    }
  }
}>

export type Document = Prisma.DocumentsGetPayload<{
  include: {
    created_by: true
    sharedWith: true
    tasks: true
  }
}>

export type Ticket = Prisma.TicketGetPayload<{
  include: {
    createdBy: true
    assignedTo: true
  }
}>

export type Note = Prisma.NotesGetPayload<{
  include: {
    author: true
  }
}>
