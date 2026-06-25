'use server'

import { MemberContributionType, ProjectWithDetailsType, ProjectWithStatsType } from "@/service/projects/type"

// Get project with basic stats
export async function getProjectWithStats(projectId: string): Promise<ProjectWithStatsType | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch project')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

// Get project with detailed information
export async function getProjectWithDetails(projectId: string): Promise<ProjectWithDetailsType | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch project')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching project details:', error)
    return null
  }
}

// Get member contributions for a project
export async function getMemberContribution(projectId: string): Promise<MemberContributionType[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/contributions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch contributions')
    }
    
    return result.contributions
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return []
  }
}

// Generate project report
export async function generateProjectReport(projectId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/report`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate report')
    }
    
    return result.report
  } catch (error) {
    console.error('Error generating report:', error)
    throw new Error('Failed to generate project report')
  }
}

// Get tasks for a sprint with details
export async function getSprintTasks(sprintId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sprints/${sprintId}/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch sprint tasks')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching sprint tasks:', error)
    return []
  }
}

// Get task details
export async function getTaskDetails(taskId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/${taskId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch task details')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching task details:', error)
    return null
  }
}

