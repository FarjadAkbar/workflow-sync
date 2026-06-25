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

    // Check if user has access to the project
    const hasAccess =
      (await prismadb.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id,
        },
      })) ||
      (await prismadb.project.findFirst({
        where: {
          id: projectId,
          createdById: user.id,
        },
      }))

    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized to view this project" }, { status: 403 })
    }

    // Get member contributions directly with Prisma
    const contributions = await prismadb.projectMember.findMany({
      where: {
        projectId: projectId
      },
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
    })

    // Get task counts for each member
    const memberContributions = await Promise.all(
      contributions.map(async (member) => {
        const taskCounts = await prismadb.tasks.groupBy({
          by: ['taskStatus'],
          where: {
            assignees: {
              some: {
                userId: member.userId
              }
            },
            sprint: {
              projectId: projectId
            }
          },
          _count: {
            taskStatus: true
          }
        })

        const totalTasks = taskCounts.reduce((sum, count) => sum + count._count.taskStatus, 0)
        const completedTasks = taskCounts
          .filter(count => count.taskStatus === 'DONE')
          .reduce((sum, count) => sum + count._count.taskStatus, 0)

        return {
          id: member.id,
          userId: member.userId,
          user: member.user,
          role: member.role,
          joinedAt: member.joinedAt,
          stats: {
            totalTasks,
            completedTasks,
            completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          }
        }
      })
    )

    return NextResponse.json({ contributions: memberContributions })
  } catch (error) {
    console.error("Error fetching project contributions:", error)
    return NextResponse.json({ error: "Failed to fetch project contributions" }, { status: 500 })
  }
}

