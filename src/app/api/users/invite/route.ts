import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateRandomPassword } from "@/lib/utils";
import { hash } from "bcryptjs";
import InviteUserEmail from "@/emails/InviteUser";
import { render } from "@react-email/render";
import sendEmail from "@/lib/sendmail";
import { ActiveStatus } from "@prisma/client";
import { InvitePayloadType } from "@/service/users/type";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  try {
    const body: InvitePayloadType = await req.json();
    const { firstName, lastName, email, role } = body;

    const name = `${firstName} ${lastName}`;
    const password = generateRandomPassword();

    let message = `You have been invited to ${process.env.NEXT_PUBLIC_APP_NAME} \n\n Your username is: ${email} \n\n Your password is: ${password} \n\n Please login to ${process.env.NEXT_PUBLIC_APP_URL} \n\n Thank you \n\n ${process.env.NEXT_PUBLIC_APP_NAME}`;

    //Check if user already exists in local database
    const checkexisting = await prismadb.users.findFirst({
      where: {
        email: email,
      },
    });
    //console.log(checkexisting, "checkexisting");

    //If user already exists, return error else create user and send email
    if (checkexisting) {
      return NextResponse.json(
        { error: "User already exist, reset password instead!" },
        {
          status: 200,
        }
      );
    } else {
      try {
        const user = await prismadb.users.create({
          data: {
            first_name: firstName,
            last_name: lastName,
            name,
            avatar: "",
            email,
            role: role,
            userStatus: ActiveStatus.ACTIVE,
            password: await hash(password, 12),
          },
        });

        if (!user) {
          return new NextResponse("User not created", { status: 500 });
        }

        // Add availability for all days except Sunday
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const availabilityPromises = days.map((day) => {
          return prismadb.availability.create({
            data: {
              day: day,
              startTime: "08:00",
              endTime: "18:00",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        });

        const project = await prismadb.project.findFirst();
        if(project){
          prismadb.projectMember.create({
            data: {
              projectId: project?.id,
              userId: user.id,
              role: "MEMBER",
            },
          });
        }

        await Promise.all(availabilityPromises);
        const emailHtml = render(
          InviteUserEmail({
            invitedByUsername: session.user?.name! || "admin",
            username: user?.name!,
            invitedUserPassword: password,
          })
        );

        sendEmail({
          from:
            process.env.NEXT_PUBLIC_APP_NAME +
            " <" +
            process.env.EMAIL_FROM +
            ">",
          to: user.email,
          subject: `You have been invited to ${process.env.NEXT_PUBLIC_APP_NAME} `,
          text: message,
          html: await emailHtml,
        });

        return NextResponse.json({ message: "User Created", user: user }, { status: 201 });
      } catch (err) {
        console.log(err);
return NextResponse.json({ message: "Error creating user", err }, { status: 500 });
      }
    }
  } catch (error) {
    console.log("[USERACTIVATE_POST]", error);
    return NextResponse.json({ message: "Error creating user", error }, { status: 500 });
  }
}
