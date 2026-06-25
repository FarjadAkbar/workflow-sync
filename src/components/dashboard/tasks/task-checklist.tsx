"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAddChecklistItem, useCompleteChecklistItem } from "@/service/tasks"
import { toast } from "@/hooks/use-toast"
import { ChecklistItemType } from "@/service/tasks/type"

interface TaskChecklistProps {
  taskId: string
  checklist: ChecklistItemType[]
}

export function TaskChecklist({ taskId, checklist = [] }: TaskChecklistProps) {
  const [newItemTitle, setNewItemTitle] = useState("")

  const { mutate: addChecklistItem, isPending: isAdding } = useAddChecklistItem()
  const { mutate: completeChecklistItem, isPending: isCompleting } = useCompleteChecklistItem()

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return
    const payload = {
      taskId,
      title: newItemTitle,
    };
    
    addChecklistItem(payload,
      {
        onSuccess: () => {
          setNewItemTitle("")
          toast({
            title: "Checklist item added",
            description: "The checklist item has been added successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to add checklist item",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleToggleComplete = (itemId: string, completed: boolean) => {
    completeChecklistItem(
      {
        checklistItemId: itemId,
        completed: !completed,
      },
      {
        onSuccess: () => {
          toast({
            title: !completed ? "Item completed" : "Item reopened",
            description: !completed
              ? "The checklist item has been marked as complete"
              : "The checklist item has been reopened",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to update checklist item",
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
          placeholder="Add a new checklist item..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddItem()
            }
          }}
        />
        <Button onClick={handleAddItem} disabled={isAdding || !newItemTitle.trim()}>
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {checklist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checklist items yet. Add one to track progress.
          </p>
        ) : (
          checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-2 p-2 rounded-md ${
                item.completed ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggleComplete(item.id, item.completed)}
                disabled={isCompleting}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.createdBy?.avatar ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {item.createdBy?.name?.charAt(0) || item.createdBy?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d")}</span>
                  </div>
                  {item.completed && item.completedAt && (
                    <div className="flex items-center gap-1">
                      {item.completedBy && (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={item.completedBy?.avatar ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {item.completedBy?.name?.charAt(0) || item.completedBy?.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Completed {format(new Date(item.completedAt), "MMM d")}
                      </span>
                    </div>
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

