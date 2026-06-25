"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, MoreVertical, UserMinus, Shield, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useAddProjectMember, useProject, useProjectMembers, useRemoveProjectMember } from "@/service/projects"
import type { ProjectMemberWithUserType } from "@/service/projects/type"
import { useGetUsersQuery } from "@/service/users"
import { toast } from "@/hooks/use-toast"

export default function ProjectTeamPage() {
  const params = useParams()
  const router = useRouter()

  if (!params?.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive">Invalid project ID</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const projectId = params.id as string

  const { data: project, isLoading: loadingProject } = useProject(projectId)
  const { data: members, isLoading: loadingMembers } = useProjectMembers(projectId)

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState("MEMBER")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberWithUserType | null>(null)

  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({ search: searchQuery})
  const { mutate: addMember, isPending: isAddingMember } = useAddProjectMember()
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveProjectMember()

  const handleAddMember = () => {
    if (!selectedUserId) return

    addMember(
      {
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          toast({
            title: "Member added",
            description: "The member has been added to the project",
          })
          setShowAddMemberDialog(false)
          setSelectedUserId(null)
          setSelectedRole("MEMBER")
        },
        onError: (error) => {
          toast({
            title: "Failed to add member",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleRemoveMember = () => {
    if (!memberToRemove) return

    removeMember(
      {
        projectId,
        userId: memberToRemove.user.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Member removed",
            description: "The member has been removed from the project",
          })
          setMemberToRemove(null)
        },
        onError: (error) => {
          toast({
            title: "Failed to remove member",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  if (loadingProject || loadingMembers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive">Project not found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name} Team</h1>
          <p className="text-muted-foreground">Manage project team members</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}`}>Back to Project</Link>
          </Button>
          <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a new member to the project team</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md h-60 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-4 space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : usersData?.users && usersData.users.length > 0 ? (
                      <div className="p-2">
                        {usersData.users.map((user) => (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              selectedUserId === user.id ? "bg-primary/10" : "hover:bg-muted"
                            }`}
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                { 
                                  user.avatar && (
                                    <AvatarImage src={user.avatar} />
                                  )
                                }
                                <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            {selectedUserId === user.id && (
                              <Badge variant="outline" className="ml-2">
                                Selected
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={isAddingMember || !selectedUserId}>
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>{members?.length || 0} members in this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members && members.length > 0 ? (
              members.map((member: ProjectMemberWithUserType) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatar ?? undefined} />
                      <AvatarFallback>{member.user?.name?.charAt(0) || member.user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {member.role === "OWNER" && <Shield className="h-3 w-3" />}
                      {member.role === "MANAGER" && <Shield className="h-3 w-3" />}
                      {member.role === "MEMBER" && <User className="h-3 w-3" />}
                      {member.role}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                setMemberToRemove(member)
                              }}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Project
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {memberToRemove?.user?.name || "this member"} from the
                                project? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleRemoveMember}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No team members yet</p>
                <Button className="mt-4" onClick={() => setShowAddMemberDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

