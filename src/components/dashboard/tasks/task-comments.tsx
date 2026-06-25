"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAddTaskComment } from "@/service/tasks"
import { toast } from "@/hooks/use-toast"
import { TaskCommentType } from "@/service/tasks/type"

interface TaskCommentsProps {
  taskId: string
  comments: TaskCommentType[]
}

export function TaskComments({ taskId, comments = [] }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("")

  const { mutate: addComment, isPending } = useAddTaskComment()

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const payload = {
      taskId,
      comment: newComment,
    };

    addComment(payload,
      {
        onSuccess: () => {
          setNewComment("")
          toast({
            title: "Comment added",
            description: "Your comment has been added successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to add comment",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={handleAddComment} disabled={isPending || !newComment.trim()}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Comment
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.assigned_user?.avatar ?? undefined} />
                <AvatarFallback>
                  {comment.assigned_user?.name?.charAt(0) || comment.assigned_user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.assigned_user?.name || comment.assigned_user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

