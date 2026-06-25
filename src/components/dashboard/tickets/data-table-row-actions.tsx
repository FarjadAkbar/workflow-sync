"use client";

import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AlertModal from "@/components/modals/alert-modal";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

import { Pencil, Trash } from "lucide-react";
import { ActiveStatus } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { TicketType } from "@/service/tickets/type";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditTicket } from "./edit-ticket";
import { useDeleteTicketMutation } from "@/service/tickets";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { mutate, isPending } = useDeleteTicketMutation();
  const data = row.original as TicketType;
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const ticketId = data.id;

  const onDelete = async () => {
    mutate(ticketId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Ticket deleted successfully",
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <Sheet open={editOpen} onOpenChange={() => setEditOpen(false)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit your ticket data</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <EditTicket initialData={data} />
        </SheetContent>
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 w-4 h-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
