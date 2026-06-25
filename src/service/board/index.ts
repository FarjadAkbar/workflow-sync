

// hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBoards,
  fetchBoard,
  fetchSections,
  createBoard,
  updateBoard,
  deleteBoard,
  createSection,
  updateSection,
  deleteSection,
} from "./fn";
import type { BoardPayloadType, SectionPayloadType } from "./type";

export const useBoards = (projectId: string | null) =>
  useQuery({
    queryKey: ["boards", projectId],
    queryFn: () => (projectId ? fetchBoards(projectId) : []),
    enabled: !!projectId,
  });

export const useBoard = (boardId: string | null) =>
  useQuery({
    queryKey: ["board", boardId],
    queryFn: () => (boardId ? fetchBoard(boardId) : null),
    enabled: !!boardId,
  });

export const useSections = (boardId: string | null) =>
  useQuery({
    queryKey: ["sections", boardId],
    queryFn: () => (boardId ? fetchSections(boardId) : []),
    enabled: !!boardId,
  });

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["boards", variables.projectId] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: Partial<BoardPayloadType> }) =>
      updateBoard(boardId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board", data.id] });
      queryClient.invalidateQueries({ queryKey: ["boards", data.projectId] });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: (_, { projectId }: { boardId: string; projectId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["boards", projectId] });
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: SectionPayloadType }) =>
      createSection(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", variables.boardId] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: Partial<SectionPayloadType> }) =>
      updateSection(sectionId, data),
    onSuccess: (section) => {
      queryClient.invalidateQueries({ queryKey: ["sections", section.boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", section.boardId] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: (_, { boardId }: { sectionId: string; boardId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["sections", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
};
