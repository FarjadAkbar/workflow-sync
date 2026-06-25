"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAddSubtask, useCompleteSubtask } from "@/service/tasks"
import { SubTaskType } from "@/service/tasks/type"

interface TaskSubtasksProps {
  taskId: string
  subtasks: SubTaskType[]
}

export function TaskSubtasks({ taskId, subtasks = [] }: TaskSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const { mutate: addSubtask, isPending: isAdding } = useAddSubtask()
  const { mutate: completeSubtask, isPending: isCompleting } = useCompleteSubtask()

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    const payload = {
      taskId,
      title: newSubtaskTitle,
    };
    addSubtask(payload,
      {
        onSuccess: () => {
          setNewSubtaskTitle("")
          toast({
            title: "Subtask added",
            description: "The subtask has been added successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to add subtask",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleToggleComplete = (subtaskId: string, completed: boolean) => {
    completeSubtask(
      {
        subtaskId,
        completed: !completed,
      },
      {
        onSuccess: () => {
          toast({
            title: !completed ? "Subtask completed" : "Subtask reopened",
            description: !completed ? "The subtask has been marked as complete" : "The subtask has been reopened",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to update subtask",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddSubtask()
            }
          }}
        />
        <Button onClick={handleAddSubtask} disabled={isAdding || !newSubtaskTitle.trim()}>
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {subtasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No subtasks yet. Add one to break down this task.
          </p>
        ) : (
          subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-start gap-2 p-2 rounded-md ${
                subtask.completed ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleComplete(subtask.id, subtask.completed)}
                disabled={isCompleting}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                  {subtask.title}
                </p>
                {subtask.description && <p className="text-xs text-muted-foreground mt-1">{subtask.description}</p>}
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={subtask.createdBy?.avatar ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {subtask.createdBy?.name?.charAt(0) || subtask.createdBy?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(subtask.createdAt), "MMM d")}
                    </span>
                  </div>
                  {subtask.completed && subtask.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      Completed {format(new Date(subtask.completedAt), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

