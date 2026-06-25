import { Metadata } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { getUser } from "@/lib/get-user";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL! || "http://localhost:3000"
  ),
  title: "Dolce CRM - Leads, Sprints & Team Workspace",
  description: "CRM and task management for leads, pipeline, sprints, tasks, and team conversations.",
  openGraph: {
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "",
      },
    ],
  },
};
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUser();

  if (!data) {
    return <div>No user data.</div>;
  }

  return (
    <AppShell
      name={data.name || ""}
      email={data.email}
      avatar={data.avatar || "/images/avatar.png"}
      role={data.role}
    >
      {children}
    </AppShell>
  );
}
