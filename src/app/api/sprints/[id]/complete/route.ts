import { NextResponse } from "next/server"
import { getUser } from "@/lib/get-user"
import { prismadb } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    const sprintId = id

    // Get sprint
    const sprint = await prismadb.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: true,
      },
    })

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Check if user has permission to complete the sprint
    const hasPermission =
      (await prismadb.projectMember.findFirst({
        where: {
          projectId: sprint.projectId,
          userId: user.id,
          role: { in: ["OWNER", "MANAGER"] },
        },
      })) ||
      (await prismadb.project.findFirst({
        where: {
          id: sprint.projectId,
          createdById: user.id,
        },
      }))

    if (!hasPermission) {
      return NextResponse.json({ error: "Not authorized to complete this sprint" }, { status: 403 })
    }

    // Check if sprint is in ACTIVE status
    if (sprint.status !== "ACTIVE") {
      return NextResponse.json({ error: "Sprint is not active" }, { status: 400 })
    }

    // Complete sprint
    const updatedSprint = await prismadb.sprint.update({
      where: { id: sprintId },
      data: {
        status: "COMPLETED",
      },
    })

    return NextResponse.json({ sprint: updatedSprint })
  } catch (error) {
    console.error("Error completing sprint:", error)
    return NextResponse.json({ error: "Failed to complete sprint" }, { status: 500 })
  }
}

