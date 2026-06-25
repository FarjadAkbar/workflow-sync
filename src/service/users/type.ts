import { ActiveStatus, RoleEnum } from "@prisma/client";

export type UserType = {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
  role?: RoleEnum;
  userStatus?: ActiveStatus;
  first_name?: string;
  last_name?: string;
  lastLoginAt?: Date; 
};

export type UsersResponseType = {
  message: string;
  users: UserType[];
};

export type UpdateStatusPayloadType = {
  id: string;
  status: ActiveStatus;
};

export type InvitePayloadType = {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleEnum;
}