"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Users,
  BarChart,
  Clock,
  ArrowRight,
  Settings,
  KanbanSquare,
  SmartphoneIcon as Sprint,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useProject, useProjectContributions } from "@/service/projects"

export default function ProjectDetail({ projectId }: { projectId: string }) {
    const router = useRouter()
    console.log(projectId,  "projectId");
    const { data: project, isLoading: loadingProject } = useProject(projectId)
    const { data: contributions, isLoading: loadingContributions } = useProjectContributions(projectId)
   
    if (loadingProject) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  console.log(project, "project");

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive">Project not found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }


    // Get active sprint if any
    const activeSprint = project.sprints?.find((sprint) => sprint.status === "ACTIVE")
    const activeSprintTasks =
      activeSprint && "tasks" in activeSprint
        ? ((activeSprint as { tasks?: { taskStatus: string }[] }).tasks ?? [])
        : []
    const activeSprintCompleted = activeSprintTasks.filter(
      (task) => task.taskStatus === "COMPLETE" || task.taskStatus === "DONE",
    ).length
    const activeSprintTotal = activeSprintTasks.length
    const activeSprintCompletion =
      activeSprintTotal > 0
        ? Math.round((activeSprintCompleted / activeSprintTotal) * 100)
        : 0

    return (
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || "No description provided"}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${projectId}/board`}>
              <KanbanSquare className="mr-2 h-4 w-4" />
              Board
            </Link>
          </Button>
        </div>
      </div>

      {/* Project stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span>{project.stats.completionPercentage}%</span>
              </div>
              <Progress value={project.stats.completionPercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{project.stats.completedTasks} completed</span>
                <span>{project.stats.totalTasks} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Start Date: </span>
                <span className="ml-1">{format(new Date(project.startDate), "MMM d, yyyy")}</span>
              </div>

              {project.endDate && (
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">End Date: </span>
                  <span className="ml-1">{format(new Date(project.endDate), "MMM d, yyyy")}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status: </span>
                <Badge variant="outline" className="ml-1">
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Members: </span>
                <span className="ml-1">{project.stats.totalMembers}</span>
              </div>

              <div className="flex -space-x-2 mt-2">
                {project.members?.slice(0, 5).map((member) => (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.user?.avatar ?? undefined} />
                    <AvatarFallback>{member.user?.name?.charAt(0) || member.user?.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {project.members && project.members.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href={`/projects/${projectId}/team`}>View Team</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Active Sprint */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sprint</CardTitle>
              <CardDescription>
                {activeSprint ? `${activeSprint.name} - ${activeSprint.goal || "No goal set"}` : "No active sprint"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSprint ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(activeSprint.startDate), "MMM d")} -{" "}
                        {format(new Date(activeSprint.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Badge>{activeSprint.status}</Badge>
                  </div>

                  <Progress value={activeSprintCompletion} className="h-2" />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{activeSprintCompleted} tasks completed</span>
                    <span>{activeSprintTotal} total tasks</span>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={`/projects/${projectId}/sprints/${activeSprint.id}`}>
                      View Sprint <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sprint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Sprint</h3>
                  <p className="text-muted-foreground mb-4">Start a sprint to organize and track your tasks</p>
                  <Button asChild>
                    <Link href={`/projects/${projectId}/sprints/new`}>Create Sprint</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">John Doe</span> completed task{" "}
                      <span className="font-medium">Update documentation</span>
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Jane Smith</span> created a new task{" "}
                      <span className="font-medium">Fix login bug</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Robert Johnson</span> started Sprint{" "}
                      <span className="font-medium">Sprint 3</span>
                    </p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card> */}
        </TabsContent>

        <TabsContent value="sprints" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sprints</h2>
            <Button asChild>
              <Link href={`/projects/${projectId}/sprints/new`}>Create Sprint</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {project.sprints && project.sprints.length > 0 ? (
              project.sprints.map((sprint) => (
                <Card key={sprint.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{sprint.name}</CardTitle>
                        <CardDescription>{sprint.goal || "No goal set"}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          sprint.status === "ACTIVE"
                            ? "default"
                            : sprint.status === "COMPLETED"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {sprint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(sprint.startDate), "MMM d")} -{" "}
                            {format(new Date(sprint.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${projectId}/sprints/${sprint.id}`}>View Sprint</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <Sprint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Sprints Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first sprint to start organizing your work</p>
                    <Button asChild>
                      <Link href={`/projects/${projectId}/sprints/new`}>Create Sprint</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Contributions</h2>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/report`}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
          </div>

          {loadingContributions ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : contributions && contributions.length > 0 ? (
            <div className="space-y-4">
              {contributions.map((member) => (
                <Card key={member.userId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar ?? undefined} />
                          <AvatarFallback>{member.name?.charAt(0) || member.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {member.tasksCompleted}/{member.tasksAssigned} Tasks
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Weight: {member.completedWeight}/{member.totalWeight}
                          </p>
                        </div>

                        <div className="w-32">
                          <Progress value={member.completionPercentage} className="h-2" />
                          <p className="text-xs text-right mt-1">{member.completionPercentage}% Complete</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Team members need to complete tasks to show contributions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
