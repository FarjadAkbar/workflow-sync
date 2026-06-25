import { NextResponse } from "next/server"
import { getUser } from "@/lib/get-user"
import { prismadb } from "@/lib/prisma"
import { ProjectRole } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const user = await getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: projectId, userId: memberId } = await params
    const body = await req.json()

    // Check if user has permission to update members
    const actorMembership = await prismadb.projectMember.findFirst({
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

    if (!actorMembership && !isCreator) {
      return NextResponse.json({ error: "Not authorized to update members in this project" }, { status: 403 })
    }

    const actorIsOwner = actorMembership?.role === "OWNER" || !!isCreator

    // Check if trying to update an owner (only owners can update owners)
    const targetMember = await prismadb.projectMember.findFirst({
      where: {
        projectId,
        userId: memberId,
      },
    })

    if (targetMember?.role === "OWNER" && !(actorIsOwner || user.id === memberId)) {
      return NextResponse.json({ error: "Only owners can update other owners" }, { status: 403 })
    }

    // Update member
    const member = await prismadb.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: {
        role: body.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Error updating project member:", error)
    return NextResponse.json({ error: "Failed to update project member" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const user = await getUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: projectId, userId: memberId } = await params

    // Check if user has permission to remove members
    const actorMembership = await prismadb.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
        role: { in: [ProjectRole.OWNER, ProjectRole.MANAGER] },
      },
    })
    const isCreator = await prismadb.project.findFirst({
      where: {
        id: projectId,
        createdById: user.id,
      },
    })

    if (!actorMembership && !isCreator) {
      return NextResponse.json({ error: "Not authorized to remove members from this project" }, { status: 403 })
    }

    const actorIsOwner = actorMembership?.role === ProjectRole.OWNER || !!isCreator

    // Check if trying to remove an owner (only owners can remove owners)
    const targetMember = await prismadb.projectMember.findFirst({
      where: {
        projectId,
        userId: memberId,
      },
    })

    if (targetMember?.role === ProjectRole.OWNER && !(actorIsOwner || user.id === memberId)) {
      return NextResponse.json({ error: "Only owners can remove other owners" }, { status: 403 })
    }

    // Remove member
    await prismadb.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing project member:", error)
    return NextResponse.json({ error: "Failed to remove project member" }, { status: 500 })
  }
}

