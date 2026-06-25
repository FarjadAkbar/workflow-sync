import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchProjects, createProject, updateProject, deleteProject } from "./fn"
import { useMemo } from "react"

// CORRECTED: Better cache configuration to prevent unnecessary re-renders
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Only refetch if stale
    refetchInterval: 10 * 60 * 1000, // Background refetch every 10 minutes
    refetchIntervalInBackground: true,
    // Use select to prevent re-renders when only computed values change
    select: (data) => useMemo(() => data, [data])
  })
}

// CORRECTED: Memoized project query
export const useProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => useMemo(() => data, [data])
  })
}

// CORRECTED: Better mutation with optimistic updates
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    // Optimistic updates for better UX
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      
      const previousProjects = queryClient.getQueryData(["projects"])
      
      queryClient.setQueryData(["projects"], (old: any) => [
        ...(old || []),
        { ...newProject, id: "temp-" + Date.now(), stats: { totalMembers: 1, activeSprints: 0, totalTasks: 0, completedTasks: 0, completionPercentage: 0 } }
      ])
      
      return { previousProjects }
    },
    onError: (err, newProject, context) => {
      queryClient.setQueryData(["projects"], context?.previousProjects)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// CORRECTED: Selective invalidation to prevent unnecessary re-renders
export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data) => {
      // Only invalidate specific project and projects list
      queryClient.invalidateQueries({ queryKey: ["project", data.id] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (projectId) => {
      // Remove from cache immediately
      queryClient.removeQueries({ queryKey: ["project", projectId] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

