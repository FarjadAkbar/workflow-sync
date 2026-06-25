import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getUser } from "@/lib/get-user";

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();

    // Validate required fields
    if (
      !body.fileId ||
      !body.userIds ||
      !Array.isArray(body.userIds) ||
      body.userIds.length === 0
    ) {
      return NextResponse.json(
        { message: "File ID and user IDs are required" },
        { status: 400 }
      );
    }

    // Check if the file exists and belongs to the user
    const file = await prismadb.documents.findFirst({
      where: {
        id: body.fileId,
        created_by_user: userId,
      },
    });

    if (!file) {
      return NextResponse.json(
        { message: "File not found or you don't have permission to share it" },
        { status: 404 }
      );
    }

    // Create file shares for each user
    const shares = await Promise.all(
      body.userIds.map(async (userId: string) => {
        // Check if share already exists
        const existingShare = await prismadb.fileShare.findUnique({
          where: {
            fileId_sharedWithId: {
              fileId: body.fileId,
              sharedWithId: userId,
            },
          },
        });

        if (existingShare) {
          // Update permissions if needed
          if (existingShare.permissions !== body.permissions) {
            return prismadb.fileShare.update({
              where: { id: existingShare.id },
              data: { permissions: body.permissions || "view" },
              include: {
                sharedWith: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            });
          }
          return existingShare;
        }

        // Create new share
        return prismadb.fileShare.create({
          data: {
            fileId: body.fileId,
            sharedById: userId,
            sharedWithId: userId,
            permissions: body.permissions || "view",
          },
          include: {
            sharedWith: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: "File shared successfully",
        shares,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sharing file:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const sharedWithId = searchParams.get("userId");

    if (!fileId || !sharedWithId) {
      return NextResponse.json(
        { message: "File ID and user ID are required" },
        { status: 400 }
      );
    }

    // Check if the file exists and belongs to the user
    const file = await prismadb.documents.findFirst({
      where: {
        id: fileId,
        created_by_user: userId,
      },
    });

    if (!file) {
      return NextResponse.json(
        {
          message:
            "File not found or you don't have permission to manage sharing",
        },
        { status: 404 }
      );
    }

    // Delete the file share
    await prismadb.fileShare.deleteMany({
      where: {
        fileId,
        sharedWithId,
        sharedById: userId,
      },
    });

    return NextResponse.json(
      {
        message: "File share removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing file share:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
