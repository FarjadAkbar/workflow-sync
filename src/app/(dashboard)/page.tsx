import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/get-user";
import {
  Contact,
  CircleDollarSign,
  Rocket,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Dolce CRM",
  description: "Pipeline, sprints and team activity at a glance.",
};

type Stat = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

const stats: Stat[] = [
  { label: "Open leads", value: "63", delta: "+8 this week", trend: "up", icon: Contact },
  { label: "Pipeline value", value: "$284k", delta: "+12.4%", trend: "up", icon: CircleDollarSign },
  { label: "Active sprints", value: "4", delta: "1 closing Fri", trend: "up", icon: Rocket },
  { label: "Tasks due today", value: "17", delta: "-3 vs yesterday", trend: "down", icon: CheckSquare },
];

const pipeline = [
  { stage: "New", count: 24, value: "$96k", pct: 100, tone: "bg-indigo-500" },
  { stage: "Qualified", count: 18, value: "$78k", pct: 75, tone: "bg-indigo-500" },
  { stage: "Proposal", count: 12, value: "$61k", pct: 50, tone: "bg-indigo-500" },
  { stage: "Negotiation", count: 6, value: "$34k", pct: 26, tone: "bg-indigo-500" },
  { stage: "Won", count: 3, value: "$15k", pct: 13, tone: "bg-emerald-500" },
];

const sprints = [
  { name: "Billing revamp", project: "Platform", done: 28, total: 34 },
  { name: "Mobile onboarding", project: "Growth", done: 11, total: 26 },
  { name: "CRM import tool", project: "Data", done: 19, total: 22 },
];

const conversations = [
  { who: "Amara Okafor", company: "Brightwave Labs", msg: "Can we move the demo to Thursday?", when: "12m" },
  { who: "Diego Marquez", company: "Northpeak Retail", msg: "Sent over the signed proposal.", when: "1h" },
  { who: "Priya Nair", company: "Lumen Health", msg: "Question about seat pricing.", when: "3h" },
];

const activity = [
  { who: "Sofia Rossi", action: "moved Northpeak Retail to Negotiation", when: "24m" },
  { who: "Liam Bennett", action: "closed task Fix invoice export", when: "1h" },
  { who: "You", action: "added 4 leads from the webinar list", when: "2h" },
  { who: "Amara Okafor", action: "booked a call for the Billing revamp sprint", when: "5h" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function Dashboard() {
  const data = await getUser();

  if (!data) {
    return <div className="text-center text-slate-600 dark:text-slate-300">No user data.</div>;
  }

  const firstName = (data.first_name || data.name || "there").split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here is what is moving across your pipeline and sprints today.
          </p>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:translate-y-px dark:focus:ring-offset-slate-900"
        >
          <Plus className="h-4 w-4" />
          New lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const up = stat.trend === "up";
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <Icon className="h-5 w-5 text-indigo-500" strokeWidth={2} />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p
                className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                  up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {stat.delta}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pipeline + sprints */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sales pipeline</h3>
            <Link href="/leads" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {pipeline.map((row) => (
              <div key={row.stage}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{row.stage}</span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">
                    {row.count} deals · {row.value}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sprints */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active sprints</h3>
            <Link href="/projects" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Projects
            </Link>
          </div>
          <div className="mt-5 space-y-5">
            {sprints.map((s) => {
              const pct = Math.round((s.done / s.total) * 100);
              return (
                <div key={s.name}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                    <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">{pct}%</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{s.project}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 tabular-nums text-xs text-slate-400 dark:text-slate-500">
                    {s.done}/{s.total} tasks done
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Conversations + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversations */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent conversations</h3>
            <Link href="/chat" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Open inbox
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map((c) => (
              <li key={c.who} className="flex items-start gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {initials(c.who)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.who}</p>
                    <span className="shrink-0 text-xs text-slate-400">{c.when}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.company}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-300">{c.msg}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Activity */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Team activity</h3>
          <ul className="mt-4 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                  {i < activity.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-white">{a.who}</span>{" "}
                    {a.action}
                  </p>
                  <p className="text-xs text-slate-400">{a.when} ago</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
