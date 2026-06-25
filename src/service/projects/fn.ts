
import axios from "axios";
import type { Project, ProjectMember } from "@prisma/client";
import { CreateProjectPayloadType, ProjectWithStatsType, ProjectType } from "./type";
import API from "@/lib/axios-client";

// Fetch all projects
export const fetchProjects = async (): Promise<ProjectWithStatsType[]> => {
  const response = await API.get<{ data: ProjectWithStatsType[]; success: boolean }>("/projects");
  return response.data.data;
};

// Fetch a single project
export const fetchProject = async (projectId: string): Promise<ProjectType> => {
  const response = await API.get<{ data: ProjectType; success: boolean }>(`/projects/${projectId}`);
  return response.data.data;
};

// Create a new project
export const createProject = async (data: CreateProjectPayloadType): Promise<Project> => {
  const response = await API.post<{ data: Project; success: boolean }>("/projects", data);
  return response.data.data;
};

// Update a project
export const updateProject = async ({ projectId, data }: { projectId: string; data: Partial<CreateProjectPayloadType> }): Promise<Project> => {
  const response = await API.put<{ data: Project; success: boolean }>(`/projects/${projectId}`, data);
  return response.data.data;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<string> => {
  await API.delete(`/projects/${projectId}`);
  return projectId;
};

// Fetch project members
export const fetchProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await API.get<{ members: ProjectMember[] }>(`/projects/${projectId}/members`);
  return response.data.members;
};

// Add a member to a project
export const addProjectMember = async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }): Promise<ProjectMember> => {
  const response = await API.post<{ member: ProjectMember }>(`/projects/${projectId}/members`, { userId, role });
  return response.data.member;
};

// Remove a member from a project
export const removeProjectMember = async ({ projectId, userId }: { projectId: string; userId: string }): Promise<{ projectId: string; userId: string }> => {
  await API.delete(`/projects/${projectId}/members/${userId}`);
  return { projectId, userId };
};

// Fetch project contributions
export const fetchProjectContributions = async (projectId: string): Promise<any[]> => {
  const response = await API.get<{ contributions: any[] }>(`/projects/${projectId}/contributions`);
  return response.data.contributions;
};

// Generate project report
export const generateProjectReport = async (projectId: string): Promise<any> => {
  const response = await API.get<{ report: any }>(`/projects/${projectId}/report`);
  return response.data.report;
};
