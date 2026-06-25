import { prismadb } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prismadb),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        // console.log(credentials, "credentials");
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email or password is missing");
        }

        const user = await prismadb.users.findFirst({
          where: {
            email: credentials.email,
          },
        });

        //clear white space from password
        const trimmedPassword = credentials.password.trim();

        if (!user || !user?.password) {
          throw new Error("User not found, please register first");
        }

        const isCorrectPassword = await bcrypt.compare(
          trimmedPassword,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Password is incorrect");
        }

        //console.log(user, "user");
        return user;
      },
    }),
  ],
  callbacks: {
    //TODO: fix this any
    async session({ token, session }: any) {
      const user = await prismadb.users.findFirst({
        where: {
          email: token.email,
        },
      });
      if (!user) {
        throw new Error("User not found, please register first");
      }
      await prismadb.users.update({
        where: {
          id: user.id,
        },
        data: {
          lastLoginAt: new Date(),
        },
      });
      //User allready exist in localDB, put user data in session
      session.user.id = user.id;
      session.user.name = user.name;
      session.user.email = user.email;
      session.user.avatar = user.avatar;
      session.user.role = user.role;
      
      
      session.user.userStatus = user.userStatus;
      session.user.lastLoginAt = user.lastLoginAt;

      //console.log(session, "session");
      return session;
    },
  },
};
