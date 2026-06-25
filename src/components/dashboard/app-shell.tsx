"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  name: string;
  email: string;
  avatar: string;
  role?: string;
  children: React.ReactNode;
};

export function AppShell({ name, email, avatar, role, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-900">
      <Sidebar
        name={name}
        email={email}
        avatar={avatar}
        role={role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-[100dvh] flex-col lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
