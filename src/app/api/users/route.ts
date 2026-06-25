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
    const search = searchParams.get("search") || ""

    // Build where clause for search
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users with optimized fields
    const users = await prismadb.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        image: true,
        role: true,
        userStatus: true,
        first_name: true,
        last_name: true,
        created_at: true,
        lastLoginAt: true,
        _count: {
          select: {
            createdProjects: true,
            memberOfProjects: true,
            assignedTasks: true,
            createdTasks: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
