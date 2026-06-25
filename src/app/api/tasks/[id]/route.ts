import { NextResponse } from "next/server"
import { getUserBasic } from "@/lib/get-user-optimized"
import { prismadb } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = id

    // Get task with all details using direct Prisma query
    const task = await prismadb.tasks.findFirst({
      where: {
        id: taskId,
        OR: [
          { createdBy: user.id },
          { assignees: { some: { userId: user.id } } },
          { 
            sprint: {
              project: {
                members: { some: { userId: user.id } }
              }
            }
          }
        ]
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        sprint: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        assigned_section: {
          include: {
            board: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        subtasks: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        checklists: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            completedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        comments: {
          include: {
            assigned_user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        documents: {
          include: {
            document: {
              select: {
                id: true,
                document_name: true,
                document_file_url: true,
                document_file_mimeType: true,
                size: true,
                created_by: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            taskStatus: true
          }
        },
        childTasks: {
          select: {
            id: true,
            title: true,
            taskStatus: true,
            priority: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ data: task, success: true })
  } catch (error) {
    console.error("Error fetching task details:", error)
    return NextResponse.json({ error: "Failed to fetch task details" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = id
    const body = await req.json()

    // Get task to check access
    const existingTask = await prismadb.tasks.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          select: { userId: true },
        },
        sprint: {
          include: {
            project: {
              include: {
                members: {
                  where: { userId: user.id },
                  select: { id: true, userId: true, role: true },
                },
              },
            },
          },
        },
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const project = existingTask.sprint?.project

    // Check if user has permission to update the task
    const hasPermission =
      existingTask.assignees.some((assignee) => assignee.userId === user.id) ||
      existingTask.createdBy === user.id ||
      (project?.members.some(
        (member) =>
          member.userId === user.id && ["OWNER", "MANAGER"].includes(member.role),
      ) ??
        false) ||
      project?.createdById === user.id

    if (!hasPermission) {
      return NextResponse.json({ error: "Not authorized to update this task" }, { status: 403 })
    }

    // Update task
    const updateData: any = {}
    if (body.title) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.priority) updateData.priority = body.priority
    if (body.taskStatus) updateData.taskStatus = body.taskStatus
    if (body.dueDateAt) updateData.dueDateAt = new Date(body.dueDateAt)
    if (body.weight !== undefined) updateData.weight = body.weight
    if (body.position !== undefined) updateData.position = body.position

    // If task is being completed, set completedAt
    if (body.taskStatus === 'COMPLETE' && existingTask.taskStatus !== 'COMPLETE') {
      updateData.completedAt = new Date()
    } else if (body.taskStatus !== 'COMPLETE' && existingTask.taskStatus === 'COMPLETE') {
      updateData.completedAt = null
    }

    const updatedTask = await prismadb.tasks.update({
      where: { id: taskId },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        taskStatus: true,
        updatedAt: true,
        completedAt: true,
      }
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = id

    // Get task to check access
    const existingTask = await prismadb.tasks.findUnique({
      where: { id: taskId },
      include: {
        sprint: {
          include: {
            project: {
              include: {
                members: {
                  where: { userId: user.id },
                  select: { id: true, userId: true, role: true },
                },
              },
            },
          },
        },
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const project = existingTask.sprint?.project

    // Check if user has permission to delete the task
    const hasPermission =
      existingTask.createdBy === user.id ||
      (project?.members.some(
        (member) =>
          member.userId === user.id && ["OWNER", "MANAGER"].includes(member.role),
      ) ??
        false) ||
      project?.createdById === user.id

    if (!hasPermission) {
      return NextResponse.json({ error: "Not authorized to delete this task" }, { status: 403 })
    }

    // Delete task
    await prismadb.tasks.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}