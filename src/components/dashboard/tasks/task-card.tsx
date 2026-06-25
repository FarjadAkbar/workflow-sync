"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, BarChart, ListChecks, MessageSquare, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskType, TaskCardProps } from "@/types/tasks"
import { TaskAssignee } from "@/types/type"
import { useDeleteTask } from "@/service/tasks"
import { toast } from "@/hooks/use-toast"
import AlertModal from "@/components/modals/alert-modal";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskCard({ task, taskId }: TaskCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteTask = () => {
    console.log("Deleting task with ID:", taskId);
    deleteTask(taskId, {
      onSuccess: () => {
        console.log("Deleting task with ID:", taskId);
        toast({
          title: "Task deleted",
          description: "The task has been deleted",
        });
        setIsDeleteModalOpen(false);
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast({
          title: "Failed to delete task",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  if (taskId !== task.id) {
    console.warn(`taskId prop (${taskId}) does not match task.id (${task.id})`);
  }
  // Determine priority color
  const priorityColor =
    task.priority === "HIGH" ? "text-red-500" : task.priority === "MEDIUM" ? "text-amber-500" : "text-blue-500"

  // Format due date if exists
  const formattedDueDate = task.dueDateAt ? format(new Date(task.dueDateAt), "MMM d") : null

  // Calculate completion stats
  const subtaskCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter((subtask) => subtask.completed)?.length || 0

  const checklistCount = task.checklists?.length || 0
  const completedChecklists = task.checklists?.filter((item) => item.completed)?.length || 0

  const hasSubtasks = subtaskCount > 0
  const hasChecklists = checklistCount > 0
  const hasComments = (task.comments?.length || 0) > 0
  const hasAttachments = (task.documents?.length || 0) > 0

  return (
    <>
      <div
        className="bg-card border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowDetailDialog(true)}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
            <Badge variant="outline" className={`${priorityColor} ml-2 shrink-0`}>
              {task.priority}
            </Badge>
          </div>

          {task.content && <p className="text-xs text-muted-foreground line-clamp-2">{task.content}</p>}

          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex -space-x-2">
              {task.assignees?.slice(0, 3).map((assignee: TaskAssignee) => (
                <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={assignee.user?.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {assignee.user?.name?.charAt(0) || assignee.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees?.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>

            {formattedDueDate && (
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formattedDueDate}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            {hasSubtasks && (
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                <span>
                  {completedSubtasks}/{subtaskCount}
                </span>
              </div>
            )}

            {hasChecklists && (
              <div className="flex items-center">
                <ListChecks className="h-3 w-3 mr-1" />
                <span>
                  {completedChecklists}/{checklistCount}
                </span>
              </div>
            )}

            {task.weight > 1 && (
              <div className="flex items-center">
                <BarChart className="h-3 w-3 mr-1" />
                <span>{task.weight}</span>
              </div>
            )}

            {hasComments && (
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {hasAttachments && (
              <div className="flex items-center">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>{task.documents.length}</span>
              </div>
            )}

            {/* Push the delete button to the right */}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 text-red-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDeleteTask}
        loading={isDeleting}
      />
      {showDetailDialog && (
        <TaskDetailDialog taskId={task.id} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
      )}
    </>
  )
}

