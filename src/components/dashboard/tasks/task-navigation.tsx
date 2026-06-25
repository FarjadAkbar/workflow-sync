"use client"

import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, KanbanSquare, ChevronRight } from "lucide-react"
import Link from "next/link"
import { TaskType } from "@/service/tasks/type"

interface TaskNavigationProps {
  task: TaskType
  showBreadcrumbs?: boolean
  showActionButtons?: boolean
  className?: string
}

export function TaskNavigation({ 
  task, 
  showBreadcrumbs = true, 
  showActionButtons = true, 
  className = "" 
}: TaskNavigationProps) {
  const projectId = task.sprint?.projectId
  const projectName = "Project"
  const sprintId = task.sprint?.id
  const sprintName = task.sprint?.name

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumbs && (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/projects/${projectId}`} className="hover:text-foreground">
            {projectName}
          </Link>
          {sprintId && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/projects/${projectId}/sprints/${sprintId}`} className="hover:text-foreground">
                {sprintName}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{task.title}</span>
        </nav>
      )}

      {/* Action Buttons */}
      {showActionButtons && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Project
            </Link>
          </Button>

          {sprintId && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${projectId}/sprints/${sprintId}`}>
                <KanbanSquare className="h-4 w-4 mr-1" />
                Sprint
              </Link>
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/board`}>
              <KanbanSquare className="h-4 w-4 mr-1" />
              Board
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
