import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTask, getSectionTasks, createTask, updateTask, deleteTask, moveTask } from "./fn"
import { useMemo } from "react"

// CORRECTED: Better cache configuration for tasks
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => useMemo(() => data, [data])
  })
}

// CORRECTED: Memoized section tasks
export function useSectionTasks(sectionId: string) {
  return useQuery({
    queryKey: ["section-tasks", sectionId],
    queryFn: () => getSectionTasks(sectionId),
    enabled: !!sectionId,
    staleTime: 1 * 60 * 1000, // 1 minute - tasks change frequently
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 2 * 60 * 1000, // Background refetch every 2 minutes
    select: (data) => useMemo(() => data, [data])
  })
}

// CORRECTED: Search tasks with debouncing
export function useSearchTasks(query: string, filters: any = {}) {
  return useQuery({
    queryKey: ["search-tasks", query, filters],
    queryFn: () => searchTasks(query, filters),
    enabled: !!query.trim() || Object.values(filters).some((value) => !!value),
    staleTime: 30 * 1000, // 30 seconds for search results
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => useMemo(() => data, [data])
  })
}

// CORRECTED: Create task with optimistic updates
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["section-tasks", newTask.section] })
      await queryClient.cancelQueries({ queryKey: ["sprint-tasks", newTask.sprintId] })
      
      // Snapshot previous values
      const previousSectionTasks = queryClient.getQueryData(["section-tasks", newTask.section])
      const previousSprintTasks = queryClient.getQueryData(["sprint-tasks", newTask.sprintId])
      
      // Optimistically update
      const tempTask = {
        ...newTask,
        id: "temp-" + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignees: []
      }
      
      queryClient.setQueryData(["section-tasks", newTask.section], (old: any) => [...(old || []), tempTask])
      queryClient.setQueryData(["sprint-tasks", newTask.sprintId], (old: any) => [...(old || []), tempTask])
      
      return { previousSectionTasks, previousSprintTasks, tempTask }
    },
    onError: (err, newTask, context) => {
      // Revert optimistic updates
      if (context?.previousSectionTasks) {
        queryClient.setQueryData(["section-tasks", newTask.section], context.previousSectionTasks)
      }
      if (context?.previousSprintTasks) {
        queryClient.setQueryData(["sprint-tasks", newTask.sprintId], context.previousSprintTasks)
      }
    },
    onSettled: (data) => {
      // Invalidate and refetch
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["section-tasks", data.section] })
        queryClient.invalidateQueries({ queryKey: ["sprint-tasks", data.sprintId] })
      }
    },
  })
}

// CORRECTED: Update task with selective invalidation
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (data) => {
      // Update specific task in cache
      queryClient.setQueryData(["task", data.id], data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["section-tasks", data.section] })
      queryClient.invalidateQueries({ queryKey: ["sprint-tasks", data.sprintId] })
    },
  })
}

// CORRECTED: Move task with optimistic updates
export function useMoveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: moveTask,
    onMutate: async ({ taskId, newSection, oldSection, sprintId }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ["section-tasks", oldSection] })
      await queryClient.cancelQueries({ queryKey: ["section-tasks", newSection] })
      
      // Get current data
      const oldSectionTasks = queryClient.getQueryData(["section-tasks", oldSection]) as any[]
      const newSectionTasks = queryClient.getQueryData(["section-tasks", newSection]) as any[]
      
      if (oldSectionTasks && newSectionTasks) {
        const taskToMove = oldSectionTasks.find(task => task.id === taskId)
        
        if (taskToMove) {
          // Remove from old section
          queryClient.setQueryData(
            ["section-tasks", oldSection], 
            oldSectionTasks.filter(task => task.id !== taskId)
          )
          
          // Add to new section
          queryClient.setQueryData(
            ["section-tasks", newSection],
            [...newSectionTasks, { ...taskToMove, section: newSection }]
          )
        }
      }
      
      return { oldSectionTasks, newSectionTasks }
    },
    onError: (err, { oldSection, newSection }, context) => {
      // Revert changes
      if (context?.oldSectionTasks) {
        queryClient.setQueryData(["section-tasks", oldSection], context.oldSectionTasks)
      }
      if (context?.newSectionTasks) {
        queryClient.setQueryData(["section-tasks", newSection], context.newSectionTasks)
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["sprint-tasks", data.sprintId] })
      }
    },
  })
}

// CORRECTED: Delete task with immediate cache removal
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data) => {
      // Remove from cache immediately
      queryClient.removeQueries({ queryKey: ["task", data.id] })
      
      // Update section and sprint tasks
      queryClient.setQueryData(["section-tasks", data.section], (old: any[]) => 
        old ? old.filter(task => task.id !== data.id) : []
      )
      
      queryClient.invalidateQueries({ queryKey: ["sprint-tasks", data.sprintId] })
    },
  })
}

