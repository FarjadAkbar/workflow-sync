import { NextResponse } from "next/server"
import { getUserBasic } from "@/lib/get-user-optimized"
import { prismadb } from "@/lib/prisma"
import { ProjectRole } from "@prisma/client"

export async function GET(req: Request) {
  try {
    // OPTIMIZED: Use lightweight user check
    const user = await getUserBasic()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get projects with stats in a single query
    const projects = await prismadb.project.findMany({
      where: {
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
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                tasks: true
              }
            }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to include computed stats
    const projectsWithStats = projects.map(project => ({
      ...project,
      stats: {
        totalMembers: project._count.members,
        activeSprints: project._count.sprints,
        totalTasks: project.sprints.reduce((acc, sprint) => acc + sprint._count.tasks, 0),
        completionPercentage: 0 // Will be calculated based on task status in the future
      }
    }))

    return NextResponse.json({ data: projectsWithStats, success: true })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
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
    if (!body.name || !body.startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // OPTIMIZED: Use transaction for atomic operations
    const result = await prismadb.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
        data: {
          name: body.name,
          description: body.description,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          status: body.status || "PLANNING",
          createdById: user.id,
        },
      })

      // Add creator as owner
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: user.id,
          role: "OWNER",
        },
      })

      // Add additional members if provided
      if (body.members && Array.isArray(body.members)) {
        const memberPromises = body.members
          .filter((member: { userId: string; role: string }) => member.userId !== user.id)
          .map((member: { userId: string; role: string }) => 
            tx.projectMember.create({
              data: {
                projectId: project.id,
                userId: member.userId,
                role: member.role as ProjectRole || ProjectRole.MEMBER,
              },
            })
          )
        
        await Promise.all(memberPromises)
      }

      return project
    })

    return NextResponse.json({ data: result, success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
