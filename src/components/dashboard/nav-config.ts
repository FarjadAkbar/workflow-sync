import {
  LayoutDashboard,
  Contact,
  FolderKanban,
  Users,
  Ticket,
  MessagesSquare,
  CalendarDays,
  FolderOpen,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Calendar", href: "/event", icon: CalendarDays },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Leads", href: "/leads", icon: Contact },
      { name: "Team", href: "/users", icon: Users },
      { name: "Tickets", href: "/tickets", icon: Ticket },
    ],
  },
  {
    label: "Communication",
    items: [
      { name: "Conversations", href: "/chat", icon: MessagesSquare },
      { name: "Files", href: "/files", icon: FolderOpen },
      { name: "Notes", href: "/databases", icon: StickyNote },
    ],
  },
];
