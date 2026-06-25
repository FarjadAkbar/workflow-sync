import { prismadb } from "@/lib/prisma"

// CORRECTED: Get project with sprints and tasks matching actual schema
export async function getProjectWithSprintsAndTasks(projectId: string, userId: string) {
  return await prismadb.project.findUnique({
    where: { 
      id: projectId,
      OR: [
        { createdById: userId },
        { members: { some: { userId } } }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      // Get members with minimal data
      members: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      },
      // Get sprints with task counts
      sprints: {
        select: {
          id: true,
          name: true,
          goal: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          // Get task counts instead of full tasks
          _count: {
            select: {
              tasks: true
            }
          },
          // Get only recent tasks for preview
          tasks: {
            select: {
              id: true,
              title: true,
              taskStatus: true,
              priority: true,
              createdAt: true,
              assignees: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true
                    }
                  }
                },
                take: 3
              }
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 5 // Limit tasks per sprint
          }
        },
        orderBy: {
          startDate: "desc"
        }
      }
    }
  })
}

// CORRECTED: Get sprint with tasks and project info
export async function getSprintWithTasks(sprintId: string, userId: string) {
  return await prismadb.sprint.findUnique({
    where: { 
      id: sprintId,
      project: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ]
      }
    },
    select: {
      id: true,
      name: true,
      goal: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      // Get project info
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          members: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        }
      },
      // Get tasks with essential data
      tasks: {
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          taskStatus: true,
          createdAt: true,
          updatedAt: true,
          dueDateAt: true,
          position: true,
          weight: true,
          completedAt: true,
          // Get assignees with minimal data
          assignees: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            },
            take: 5
          },
          // Get section info
          assigned_section: {
            select: {
              id: true,
              name: true
            }
          },
          // Get comment count instead of full comments
          _count: {
            select: {
              comments: true,
              subtasks: true,
              checklists: true
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      },
      // Get task counts
      _count: {
        select: {
          tasks: true
        }
      }
    }
  })
}

// CORRECTED: Get task with full details but optimized includes
export async function getTaskWithDetails(taskId: string, userId: string) {
  return await prismadb.tasks.findUnique({
    where: { 
      id: taskId,
      OR: [
        { createdBy: userId },
        { assignees: { some: { userId } } },
        { sprint: { project: { members: { some: { userId } } } } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
      priority: true,
      taskStatus: true,
      createdAt: true,
      updatedAt: true,
      dueDateAt: true,
      position: true,
      weight: true,
      completedAt: true,
      // Get assignees
      assignees: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      },
      // Get subtasks with minimal data
      subtasks: {
        select: {
          id: true,
          title: true,
          completed: true,
          priority: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      // Get checklists
      checklists: {
        select: {
          id: true,
          title: true,
          completed: true,
          createdAt: true,
          completedBy: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      // Get documents
      documents: {
        select: {
          document: {
            select: {
              id: true,
              document_name: true,
              size: true,
              document_file_url: true,
              document_file_mimeType: true
            }
          }
        }
      },
      // Get recent comments
      comments: {
        select: {
          id: true,
          comment: true,
          createdAt: true,
          assigned_user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      },
      // Get feedback
      task_feedback: {
        select: {
          id: true,
          rating: true,
          feedback: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      // Get section
      assigned_section: {
        select: {
          id: true,
          name: true
        }
      },
      // Get sprint and project info
      sprint: {
        select: {
          id: true,
          name: true,
          goal: true,
          status: true,
          startDate: true,
          endDate: true,
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true
            }
          }
        }
      }
    }
  })
}

// CORRECTED: Fix N+1 query - Single query with aggregations
export async function getProjectsWithStats(userId: string) {
  return await prismadb.project.findMany({
    where: {
      OR: [
        { createdById: userId }, 
        { members: { some: { userId } } }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      // Use _count for aggregations instead of separate queries
      _count: {
        select: {
          sprints: {
            where: { status: "ACTIVE" }
          },
          members: true
        }
      },
      // Only fetch necessary member data
      members: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        take: 10 // Limit members to prevent over-fetching
      },
      // Get task stats in single query
      sprints: {
        select: {
          id: true,
          name: true,
          status: true,
          _count: {
            select: {
              tasks: true
            }
          }
        },
        take: 5 // Limit sprints
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  })
}

// CORRECTED: Fix over-fetching in tasks query
export async function getTasks(filters: any, userId: string) {
  const where: any = {
    // Access control - user must have access to task
    OR: [
      { createdBy: userId },
      { assignees: { some: { userId } } },
      { sprint: { project: { members: { some: { userId } } } } }
    ]
  }

  // Build filters efficiently
  if (filters.search) {
    where.AND = [
      {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { content: { contains: filters.search, mode: "insensitive" } }
        ]
      }
    ]
  }

  if (filters.priority) where.priority = filters.priority
  if (filters.status) where.taskStatus = filters.status
  if (filters.sprintId) where.sprintId = filters.sprintId
  if (filters.projectId) where.sprint = { projectId: filters.projectId }
  if (filters.assignedToMe) where.assignees = { some: { userId } }
  if (filters.createdByMe) where.createdBy = userId

  return await prismadb.tasks.findMany({
    where,
    // Select only necessary fields to reduce payload
    select: {
      id: true,
      title: true,
      content: true,
      priority: true,
      taskStatus: true,
      createdAt: true,
      updatedAt: true,
      dueDateAt: true,
      // Limit assignees and select minimal user data
      assignees: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        take: 5 // Prevent over-fetching assignees
      },
      // Minimal sprint and project data
      sprint: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      assigned_section: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 50 // Pagination
  })
}

// CORRECTED: Minimal user data fetching
export async function getUsers(search: string = "") {
  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ]
  }

  return await prismadb.users.findMany({
    where,
    // Select only necessary fields
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      userStatus: true,
      created_at: true,
      lastLoginAt: true
    },
    orderBy: {
      created_at: "desc"
    },
    take: 100 // Pagination
  })
}

// CORRECTED: Tickets with minimal data
export async function getTickets(userId: string, search: string = "") {
  const where: any = {
    OR: [
      { createdById: userId },
      { assignedToId: userId }
    ]
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }
    ]
  }

  return await prismadb.ticket.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 50
  })
}

