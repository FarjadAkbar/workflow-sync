"use client"

import { memo, useMemo, useCallback } from "react"
import { useSearchTasks, useSectionTasks, useMoveTask } from "@/service/tasks/hooks"
import { TaskType } from "@/service/tasks/type"

interface TaskBoardProps {
  boardId: string
  sprintId?: string
}

// CORRECTED: Memoized TaskCard component to prevent unnecessary re-renders
const TaskCard = memo(({ task, onMove }: { task: TaskType; onMove: (taskId: string, newSection: string) => void }) => {
  const handleMove = useCallback((newSection: string) => {
    onMove(task.id, newSection)
  }, [task.id, onMove])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <h3 className="font-medium text-gray-900">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{task.content}</p>
      
      <div className="flex items-center justify-between mt-3">
        <span className={`px-2 py-1 text-xs rounded-full ${
          task.priority === "HIGH" ? "bg-red-100 text-red-800" :
          task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
          "bg-green-100 text-green-800"
        }`}>
          {task.priority}
        </span>
        
        <div className="flex -space-x-2">
          {task.assignees?.slice(0, 3).map((assignee) => (
            <img
              key={assignee.user.id}
              src={assignee.user.avatar ?? "/images/nouser.png"}
              alt={assignee.user.name ?? assignee.user.email}
              className="w-6 h-6 rounded-full border-2 border-white"
            />
          ))}
          {(task.assignees?.length || 0) > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">+{(task.assignees?.length || 0) - 3}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

TaskCard.displayName = "TaskCard"

// CORRECTED: Memoized Section component
const TaskSection = memo(({ 
  section, 
  tasks, 
  onMoveTask 
}: { 
  section: { id: string; name: string }
  tasks: TaskType[]
  onMoveTask: (taskId: string, newSection: string) => void
}) => {
  // Memoize filtered tasks to prevent re-computation
  const sectionTasks = useMemo(() => 
    tasks.filter(task => task.assigned_section?.id === section.id),
    [tasks, section.id]
  )

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">{section.name}</h2>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
          {sectionTasks.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {sectionTasks.map(task => (
          <TaskCard key={task.id} task={task} onMove={onMoveTask} />
        ))}
      </div>
    </div>
  )
})

TaskSection.displayName = "TaskSection"

// CORRECTED: Main TaskBoard component with proper memoization
export const TaskBoard = memo(({ boardId, sprintId }: TaskBoardProps) => {
  const { mutate: moveTask } = useMoveTask()
  
  // Use optimized hooks with better caching
  const { data: tasksData, isLoading: loadingTasks } = useSearchTasks("", { 
    sprintId,
    projectId: !sprintId ? boardId : undefined 
  })
  const tasks: TaskType[] = tasksData ?? []

  // Memoize sections to prevent re-computation
  const sections = useMemo(() => {
    const uniqueSections = new Map()
    
    tasks.forEach(task => {
      if (task.assigned_section) {
        uniqueSections.set(task.assigned_section.id, task.assigned_section)
      }
    })
    
    return Array.from(uniqueSections.values())
  }, [tasks])

  // Memoize move handler to prevent re-renders
  const handleMoveTask = useCallback((taskId: string, newSectionId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.assigned_section) {
      moveTask({
        taskId,
        sectionId: newSectionId,
        position: task.position ?? 0,
        oldSection: task.assigned_section.id,
        sprintId: task.sprintId,
      })
    }
  }, [tasks, moveTask])

  if (loadingTasks) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map(j => (
                <div key={j} className="bg-white p-4 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sections.map(section => (
        <TaskSection
          key={section.id}
          section={section}
          tasks={tasks}
          onMoveTask={handleMoveTask}
        />
      ))}
    </div>
  )
})

TaskBoard.displayName = "TaskBoard"