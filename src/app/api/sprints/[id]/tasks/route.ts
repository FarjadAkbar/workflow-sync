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
    const sprintId = id

    // Get sprint with project info to check access
    const sprint = await prismadb.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: {
          select: {
            id: true,
            members: {
              where: { userId: user.id },
              select: { id: true }
            }
          }
        }
      }
    })

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Check if user has access to the project
    const hasAccess = 
      sprint.project.members.length > 0 ||
      (await prismadb.project.findFirst({
        where: {
          id: sprint.projectId,
          createdById: user.id,
        },
      }))

    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized to view this sprint" }, { status: 403 })
    }

    // Get tasks with optimized includes
    const tasks = await prismadb.tasks.findMany({
      where: { sprintId },
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        taskStatus: true,
        createdAt: true,
        updatedAt: true,
        dueDateAt: true,
        position: true,
        weight: true,
        // Optimized: Limit assignees and select minimal user data
        assignees: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          take: 5 // Prevent over-fetching assignees
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        checklists: {
          select: {
            id: true,
            title: true,
            completed: true,
            createdAt: true,
            completedBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        documents: {
          select: {
            document: {
              select: {
                id: true,
                document_name: true,
                document_file_url: true,
                document_file_mimeType: true,
                size: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            assigned_user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10 // Limit comments
        },
        task_feedback: {
          select: {
            id: true,
            rating: true,
            feedback: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        assigned_section: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    })

    return NextResponse.json({ data: tasks, success: true })
  } catch (error) {
    console.error("Error fetching sprint tasks:", error)
    return NextResponse.json({ error: "Failed to fetch sprint tasks" }, { status: 500 })
  }
}