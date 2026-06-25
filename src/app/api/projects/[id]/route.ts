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
    const projectId = id

    console.log("Fetching project with ID:", projectId, "for user:", user.id)

    // Get project with sprints and tasks using direct Prisma query
    const project = await prismadb.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
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
        sprints: {
          include: {
            tasks: {
              include: {
                assignees: {
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
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            },
            _count: {
              select: {
                tasks: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            members: true,
            sprints: {
              where: {
                status: "ACTIVE"
              }
            }
          }
        }
      }
    })

    console.log("Project query result:", project ? "Found project" : "Project not found")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Transform data to include computed stats
    const projectWithStats = {
      ...project,
      stats: {
        totalMembers: project.members?.length || 0,
        activeSprints: project.sprints?.filter(sprint => sprint.status === "ACTIVE").length || 0,
        totalTasks: project.sprints?.reduce((acc, sprint) => acc + (sprint._count?.tasks || 0), 0) || 0,
        completionPercentage: 0 // Will be calculated based on task status in the future
      }
    }

    return NextResponse.json({ data: projectWithStats, success: true })
  } catch (error) {
    console.error("Error fetching project:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    const projectId = id
    const body = await req.json()

    // Check if user has permission to update the project
    const membership = await prismadb.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
        role: { in: ["OWNER", "MANAGER"] },
      },
    })

    const isCreator = await prismadb.project.findFirst({
      where: {
        id: projectId,
        createdById: user.id,
      },
    })

    if (!membership && !isCreator) {
      return NextResponse.json({ error: "Not authorized to update this project" }, { status: 403 })
    }

    // Update project
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    if (body.status) updateData.status = body.status

    const project = await prismadb.project.update({
      where: { id: projectId },
      data: updateData,
    })

    return NextResponse.json({ data: project, success: true })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    const projectId = id

    // Check if user has permission to delete the project
    const membership = await prismadb.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
        role: "OWNER",
      },
    })

    const isCreator = await prismadb.project.findFirst({
      where: {
        id: projectId,
        createdById: user.id,
      },
    })

    if (!membership && !isCreator) {
      return NextResponse.json({ error: "Not authorized to delete this project" }, { status: 403 })
    }

    // Delete project (cascade will delete members, sprints, etc.)
    await prismadb.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

