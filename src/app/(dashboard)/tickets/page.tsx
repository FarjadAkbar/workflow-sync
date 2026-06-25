import { CreateTicketDialog } from "@/components/dashboard/tickets/create-ticket-dialog";
import TicketsList from "@/components/dashboard/tickets/tickets-list";
import Container from "@/components/ui/container";



const TicketsPage = async () => {

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <CreateTicketDialog />
      </div>
      <TicketsList />
    </div>
  );
};

export default TicketsPage;
