"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, StarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useAddTaskFeedback } from "@/service/tasks"
import { toast } from "@/hooks/use-toast"

interface TaskFeedbackProps {
  taskId: string
  feedback: any[]
}

export function TaskFeedback({ taskId, feedback = [] }: TaskFeedbackProps) {
  const [newFeedback, setNewFeedback] = useState("")
  const [rating, setRating] = useState(0)
  const [isPrivate, setIsPrivate] = useState(false)

  const { mutate: addFeedback, isPending } = useAddTaskFeedback()

  const handleAddFeedback = () => {
    if (!newFeedback.trim() || rating === 0) return

    addFeedback(
      {
        taskId,
        userId: "current-user-id", // This would be replaced with the actual user ID
        feedback: newFeedback,
        rating,
        isPrivate,
      },
      {
        onSuccess: () => {
          setNewFeedback("")
          setRating(0)
          setIsPrivate(false)
          toast({
            title: "Feedback added",
            description: "Your feedback has been added successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Failed to add feedback",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 border rounded-md p-4">
        <h3 className="text-sm font-medium">Add Feedback</h3>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
              {star <= rating ? (
                <StarIcon className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              ) : (
                <Star className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Add your feedback..."
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          rows={3}
        />

        <div className="flex items-center space-x-2">
          <Checkbox id="private-feedback" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(!!checked)} />
          <label
            htmlFor="private-feedback"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Make feedback private (only visible to admins)
          </label>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleAddFeedback} disabled={isPending || !newFeedback.trim() || rating === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No feedback yet. Be the first to provide feedback.
          </p>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.user?.avatar ?? undefined} />
                    <AvatarFallback>{item.user?.name?.charAt(0) || item.user?.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {item.user?.name || item.user?.email}
                      {item.user?.role === "ADMIN" && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm mt-3">{item.feedback}</p>

              {item.isPrivate && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                  <span className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
                    Private feedback
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

