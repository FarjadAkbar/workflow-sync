import type { Tasks, SubTask, ChecklistItem, Sprint, TaskFeedback, TasksComments, Sections } from "@prisma/client"
import { UserType } from "../users/type";
import { TaskAssignee } from "@/types/type";

export type TaskType = Tasks & {
  assignees: TaskAssignee[];
  sprint: Sprint | null;
  assigned_section: Sections | null;
  task_feedback: TaskFeedback[];
  subtasks: SubTaskType[];
  comments: TaskCommentType[];
  checklists: ChecklistItemType[];
  documents: TaskAttachment[];
}

export type TaskAttachment = {
  document: {
    size: number;
    document_name: string;
    document_file_url: string;
    document_file_mimeType: string;
  };
  taskId: string;
  documentId: string
}

export type CreateTaskPayloadType = {
  title: string
  section?: string
  sprintId?: string
  assignees?: string[]
  tags?: string[]
  parentTaskId?: string
}

export type UpdateTaskPayloadType = Partial<CreateTaskPayloadType> & {
  id: string,
  priority?: string;
}

export type SubTaskPayloadType = {
  taskId: string
  title: string
  description?: string
}

export type ChecklistItemPayloadType = {
  taskId: string
  title: string
}

export type TaskCommentPayloadType = {
  taskId: string
  comment: string
}

export type TaskFeedbackPayloadType = {
  taskId: string;
  userId: string;
  feedback: string
  rating: number
  isPrivate?: boolean
}


export type MoveTaskPayloadType = {
  taskId: string
  sectionId: string
  position: number
  oldSection?: string
  sprintId?: string | null
}

export type TaskCommentType = TasksComments & {
  assigned_user: UserType
}

export type SubTaskType = SubTask & {
  createdBy: UserType
}

export type ChecklistItemType = ChecklistItem & {
  completed: boolean
  createdBy: UserType
  completedBy: UserType | null
}