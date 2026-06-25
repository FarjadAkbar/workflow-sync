import React from "react";
import { InviteForm } from "@/components/dashboard/users/invite-form";
import { Separator } from "@/components/ui/separator";
import Container from "../../../components/ui/container";
import UsersList from "@/components/dashboard/users/users-list";

const AdminUsersPage = async () => {
  return (
    <Container
      title="Users administration"
      description={"Here you can manage users"}
    >
      <div className="flex flex-col gap-4">
        <h4 className=" text-lg sm:text-xl font-semibold">
          Invite new user 
        </h4>
        <InviteForm />
      </div>
      {/* <Separator />
      <div>
        <SendMailToAll />
      </div> */}
      <Separator />
      <UsersList />
    </Container>
  );
};

export default AdminUsersPage;
