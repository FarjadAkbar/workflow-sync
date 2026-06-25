import { NextResponse } from "next/server"
import { getUser } from "@/lib/get-user"
import { prismadb } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
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

    // Get sprints
    const sprints = await prismadb.sprint.findMany({
      where: { projectId },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json({ data: sprints, success: true })
  } catch (error) {
    console.error("Error fetching sprints:", error)
    return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const projectId = id

    const body = await req.json()

    // Check if user has permission to create sprints
    const hasPermission =
      (await prismadb.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id,
          role: { in: ["OWNER", "MANAGER"] },
        },
      })) ||
      (await prismadb.project.findFirst({
        where: {
          id: projectId,
          createdById: user.id,
        },
      }))

    if (!hasPermission) {
      return NextResponse.json({ error: "Not authorized to create sprints in this project" }, { status: 403 })
    }

    // Validate required fields
    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "Name, start date, and end date are required" }, { status: 400 })
    }

    // Create sprint
    const sprint = await prismadb.sprint.create({
      data: {
        name: body.name,
        goal: body.goal,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status || "PLANNING",
        projectId,
        createdById: user.id,
      },
    })

    return NextResponse.json({ data: sprint, success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating sprint:", error)
    return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 })
  }
}

