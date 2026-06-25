"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { TaskDetailDialog } from "./task-detail-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import DeleteConfirmationDialog from "@/components/modals/delete-confitmation"
import { TaskType } from "@/service/tasks/type"

interface TaskTableViewProps {
  boardId: string
  sprintId?: string
}

export function TaskTableView({ boardId, sprintId }: TaskTableViewProps) {
  const router = useRouter()
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    assignedToMe: false,
  })
  const [sortConfig, setSortConfig] = useState({
    key: "updatedAt",
    direction: "desc" as "asc" | "desc",
  })

  // Fetch tasks
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ["board-tasks", boardId, sprintId, searchQuery, filters, sortConfig],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (searchQuery) {
        params.append("q", searchQuery)
      }

      if (filters.priority) {
        params.append("priority", filters.priority)
      }

      if (filters.status) {
        params.append("status", filters.status)
      }

      if (filters.assignedToMe) {
        params.append("assignedToMe", "true")
      }

      if (sprintId) {
        params.append("sprintId", sprintId)
      }

      const response = await axios.get(`/api/tasks/search?${params.toString()}`)
      return response.data
    },
  })

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["task-filters"],
    queryFn: async () => {
      const response = await axios.get("/api/tasks/filters")
      return response.data.filters
    },
  })

  const tasks = tasksData?.tasks || []

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortConfig.key === "title" || sortConfig.key === "priority" || sortConfig.key === "taskStatus") {
      return sortConfig.direction === "asc"
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key])
    } else if (sortConfig.key === "dueDateAt" || sortConfig.key === "updatedAt") {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
    }
    return 0
  })

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    const projectId = tasks.find((task: TaskType) => task.id === taskId)?.sprint?.project?.id
    if (projectId) {
      router.push(`/projects/${projectId}/tasks/${taskId}`)
    }
  }

  // Render priority badge
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>
      case "MEDIUM":
        return <Badge variant="default">Medium</Badge>
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span>Complete</span>
          </div>
        )
      case "IN_PROGRESS":
        return (
          <div className="flex items-center bg-yellow-300">
            <Clock className="h-4 w-4 text-blue-500 mr-1" />
            <span>In Progress</span>
          </div>
        )
      case "REVIEW":
        return (
          <div className="flex items-center">
            <Search className="h-4 w-4 text-yellow-500 mr-1" />
            <span>Review</span>
          </div>
        )
      case "BLOCKED":
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <span>Blocked</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-1" />
            <span>Pending</span>
          </div>
        )
    }
  }

  if (loadingTasks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 w-[200px] sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium">Priority</label>
                      <Select
                        value={filters.priority}
                        onValueChange={(value) => setFilters({ ...filters, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any priority</SelectItem>
                          {filterOptions?.priorities?.map((priority: string) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0) + priority.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any status</SelectItem>
                          {filterOptions?.statuses?.map((status: string) => (
                            <SelectItem key={status} value={status}>
                              {status.replace("_", " ").charAt(0) + status.replace("_", " ").slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assignedToMe"
                        checked={filters.assignedToMe}
                        onCheckedChange={(checked) => setFilters({ ...filters, assignedToMe: !!checked })}
                      />
                      <label
                        htmlFor="assignedToMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Assigned to me
                      </label>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("title")}>
                    <span>Title</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("priority")}>
                    <span>Priority</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("taskStatus")}>
                    <span>Status</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("dueDateAt")}>
                    <span>Due Date</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTasks.map((task) => (
                  <>
                    <TableRow key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{task.title}</span>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{renderPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{renderStatusBadge(task.taskStatus)}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.slice(0, 3).map((assignee: any) => (
                              <Avatar key={assignee.id} className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={assignee.user?.avatar ?? undefined} />
                                <AvatarFallback>
                                  {assignee.user?.name?.charAt(0) || assignee.user?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                          {task.assignees && task.assignees.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.dueDateAt ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{format(new Date(task.dueDateAt), "MMM d, yyyy")}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setShowDetailDialog(true)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => setShowEditDialog(true)}
                            >
                              Edit task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {showDetailDialog && (
                      <TaskDetailDialog taskId={task.id} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
                    )}
                    {showEditDialog && <EditTaskDialog taskId={task.id} open={showEditDialog} onOpenChange={setShowEditDialog} />}
                  </>

                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

