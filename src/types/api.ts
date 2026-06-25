// API response types and request types

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationType {
  totalCount: number
  pageSize: number
  pageNumber: number
  totalPages: number
}

export interface ErrorResponse {
  success: false
  error: string
  message?: string
  code?: string
}

// Common API request types
export interface CreateProjectRequest {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  sprintId?: string
  assigneeId?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  dueDate?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
}
