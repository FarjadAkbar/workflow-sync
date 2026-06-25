import { unstable_cache } from 'next/cache'
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation'

/**
 * Optimized getUser function with better caching and selective fields
 * Revalidation time: 30 minutes (reduced from 1 hour)
 * Only fetches necessary user data for better performance
 */
export const getUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in");

  const getCachedUser = unstable_cache(
    async () => {
      return await prismadb.users.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          userStatus: true,
          first_name: true,
          last_name: true,
          image: true,
          created_at: true,
          lastLoginAt: true
        }
      });
    },
    ['auth', session.user.id],
    { revalidate: 1800, tags: ['auth'] } // 30 minutes instead of 1 hour
  );

  const user = await getCachedUser();
  if (!user) throw new Error("User not found");
  return user;
};

/**
 * Lightweight version for authentication-only needs
 * Only fetches essential fields for API route authentication
 */
export const getUserBasic = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const getCachedUserBasic = unstable_cache(
    async () => {
      return await prismadb.users.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          userStatus: true,
          name: true
        }
      });
    },
    ['auth-basic', session.user.id],
    { revalidate: 1800, tags: ['auth'] } // 30 minutes cache
  );

  return await getCachedUserBasic();
};

/**
 * Get user with full profile data including relations
 * Use this when you need complete user information
 */
export const getUserWithRelations = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in");

  const getCachedUserWithRelations = unstable_cache(
    async () => {
      return await prismadb.users.findUnique({
        where: { id: session.user.id },
        include: {
          createdProjects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true
            }
          },
          memberOfProjects: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              },
              role: true
            }
          },
          assignedTasks: {
            select: {
              task: {
                select: {
                  id: true,
                  title: true,
                  taskStatus: true,
                  priority: true
                }
              }
            }
          }
        }
      });
    },
    ['auth-full', session.user.id],
    { revalidate: 1800, tags: ['auth'] }
  );

  const user = await getCachedUserWithRelations();
  if (!user) throw new Error("User not found");
  return user;
};

/**
 * Get user by ID (for admin operations)
 * Use this when you need to fetch other users' data
 */
export const getUserById = async (userId: string) => {
  const getCachedUserById = unstable_cache(
    async () => {
      return await prismadb.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          userStatus: true,
          first_name: true,
          last_name: true,
          image: true,
          created_at: true,
          lastLoginAt: true
        }
      });
    },
    ['user', userId],
    { revalidate: 3600, tags: ['users'] } // 1 hour cache for other users
  );

  return await getCachedUserById();
};
