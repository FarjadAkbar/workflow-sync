import { NextResponse } from "next/server"
import { getUserBasic } from "@/lib/get-user-optimized"
import { prismadb } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // OPTIMIZED: Use lightweight user check
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    
    // Build filters object
    const filters = {
      search: searchParams.get("q") || "",
      priority: searchParams.get("priority") || "",
      status: searchParams.get("status") || "",
      assignedToMe: searchParams.get("assignedToMe") === "true",
      createdByMe: searchParams.get("createdByMe") === "true",
      sprintId: searchParams.get("sprintId") || "",
      projectId: searchParams.get("projectId") || ""
    }

    // Build where clause for filtering
    const where: any = {
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
    }

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    if (filters.priority) {
      where.priority = filters.priority
    }
    if (filters.status) {
      where.taskStatus = filters.status
    }
    if (filters.sprintId) {
      where.sprintId = filters.sprintId
    }
    if (filters.projectId) {
      where.sprint = { projectId: filters.projectId }
    }
    if (filters.assignedToMe) {
      where.assignees = { some: { userId: user.id } }
    }
    if (filters.createdByMe) {
      where.createdBy = user.id
    }

    // Get tasks with optimized includes
    const tasks = await prismadb.tasks.findMany({
      where,
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
        },
        assigned_section: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            subtasks: true,
            checklists: true,
            comments: true,
            documents: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ data: tasks, success: true })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.sprintId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // OPTIMIZED: Use transaction for atomic operations
    const result = await prismadb.$transaction(async (tx) => {
      // Create task
      const task = await tx.tasks.create({
        data: {
          title: body.title,
          content: body.content || "",
          priority: body.priority || "MEDIUM",
          taskStatus: body.taskStatus || "TODO",
          sprintId: body.sprintId,
          createdBy: user.id,
          section: body.section || null,
          dueDateAt: body.dueDateAt ? new Date(body.dueDateAt) : null,
        },
        // OPTIMIZED: Select only necessary data for response
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          taskStatus: true,
          createdAt: true,
          sprintId: true
        }
      })

      // Add assignees if provided
      if (body.assignees && Array.isArray(body.assignees)) {
        const assigneePromises = body.assignees.map((assigneeId: string) =>
          tx.taskAssignee.create({
            data: {
              taskId: task.id,
              userId: assigneeId,
            },
          })
        )
        await Promise.all(assigneePromises)
      }

      return task
    })

    return NextResponse.json({ data: result, success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
