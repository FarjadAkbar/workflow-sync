"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, BarChart, Plus, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { CreateProjectDialog } from "./create-project-dialog"
import { useProjects } from "@/service/projects"

export function ProjectList() {
  const { data: projects, isLoading, isError } = useProjects()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive">Failed to load projects</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Project Card */}
        <Card
          className="overflow-hidden border-dashed hover:border-primary/50 cursor-pointer transition-colors"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent className="pt-6 flex flex-col items-center justify-center h-[250px]">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Create New Project</h3>
            <p className="text-muted-foreground text-center">Start a new project and invite team members</p>
          </CardContent>
        </Card>

        {/* Project Cards */}
        {projects?.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <Badge
                    variant={
                      project.status === "ACTIVE"
                        ? "default"
                        : project.status === "COMPLETED"
                          ? "success"
                          : project.status === "PLANNING"
                            ? "secondary"
                            : project.status === "ON_HOLD"
                              ? "outline"
                              : "destructive"
                    }
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(project.startDate), "MMM d, yyyy")}
                      {project.endDate && ` - ${format(new Date(project.endDate), "MMM d, yyyy")}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.stats.completionPercentage}%</span>
                    </div>
                    <Progress value={project.stats.completionPercentage} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{project.stats.totalMembers} members</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{project.stats.totalTasks} tasks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-2">
                <div className="flex justify-between items-center w-full">
                  <div className="flex -space-x-2">
                    {/* This would show member avatars */}
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    {project.stats.totalMembers > 2 && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                        +{project.stats.totalMembers - 2}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}

