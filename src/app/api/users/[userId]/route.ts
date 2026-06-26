import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prismadb } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UpdateStatusPayloadType } from "@/service/users/type";
import { ApiError } from "@/types/type";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  if (!params.id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const id = params.id;

  try {
    const user = await prismadb.users.findMany({
      where: {
        id: id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[USER_GET]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await Promise.all([
      prismadb.taskAssignee.deleteMany({ where: { userId: id } }),
      prismadb.projectMember.deleteMany({ where: { userId: id } }),
      prismadb.chatRoom.deleteMany({ where: { createdBy: id } }),
      prismadb.chatParticipant.deleteMany({ where: { userId: id } }),
      prismadb.chatMessage.deleteMany({ where: { senderId: id } }),
      prismadb.availability.deleteMany({ where: { userId: id } }),
      prismadb.fileShare.deleteMany({ where: { sharedWithId: id } }),
    ]);
    
    // Delete user after related records are removed
    const user = await prismadb.users.delete({ where: { id } });
    
    return NextResponse.json({ message: "User Deleted", user: user }, { status: 200 });
  } catch (error: unknown) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : "An unknown error occurred",
      statusCode: 500,
    };
    return NextResponse.json({ message: apiError.message }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  if (!params.id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const id = params.id;
  try {
    const body: UpdateStatusPayloadType = await req.json();
    const user = await prismadb.users.update({
      where: {
        id: id,
      },
      data: {
        userStatus: body.status
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[USER_PATCH]", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
