import type { Metadata } from "next";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import { Plus, Filter, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Leads | Dolce CRM",
  description: "Track leads through your sales pipeline.",
};

type Lead = {
  company: string;
  contact: string;
  value: string;
  owner: string;
  priority?: "high" | "medium" | "low";
};

type Column = {
  stage: string;
  accent: string;
  leads: Lead[];
};

const columns: Column[] = [
  {
    stage: "New",
    accent: "bg-slate-400",
    leads: [
      { company: "Brightwave Labs", contact: "Amara Okafor", value: "$12k", owner: "SR", priority: "high" },
      { company: "Cedar & Co", contact: "Tomas Vidal", value: "$6.5k", owner: "LB" },
      { company: "Halcyon Studio", contact: "Mei Lin", value: "$9k", owner: "SR", priority: "medium" },
    ],
  },
  {
    stage: "Qualified",
    accent: "bg-indigo-400",
    leads: [
      { company: "Northpeak Retail", contact: "Diego Marquez", value: "$22k", owner: "DM", priority: "high" },
      { company: "Lumen Health", contact: "Priya Nair", value: "$14.2k", owner: "LB", priority: "medium" },
    ],
  },
  {
    stage: "Proposal",
    accent: "bg-indigo-500",
    leads: [
      { company: "Orbit Logistics", contact: "Sofia Rossi", value: "$31k", owner: "SR", priority: "high" },
      { company: "Maple Foods", contact: "Liam Bennett", value: "$8.8k", owner: "DM" },
    ],
  },
  {
    stage: "Negotiation",
    accent: "bg-indigo-600",
    leads: [
      { company: "Atlas Manufacturing", contact: "Hassan Ali", value: "$47k", owner: "SR", priority: "high" },
    ],
  },
  {
    stage: "Won",
    accent: "bg-emerald-500",
    leads: [
      { company: "Vista Media", contact: "Elena Petrova", value: "$18k", owner: "LB" },
      { company: "Pine Valley Spa", contact: "Noah Carter", value: "$5.4k", owner: "DM" },
    ],
  },
];

const priorityStyles: Record<NonNullable<Lead["priority"]>, string> = {
  high: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default async function LeadsPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Leads
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag deals through the pipeline as they progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:translate-y-px dark:focus:ring-offset-slate-900"
          >
            <Plus className="h-4 w-4" />
            New lead
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const total = col.leads.length;
          return (
            <div key={col.stage} className="flex w-72 shrink-0 flex-col">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.accent}`} />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {col.stage}
                  </span>
                  <span className="tabular-nums rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {total}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 rounded-xl bg-slate-100/60 p-3 dark:bg-slate-900/40">
                {col.leads.map((lead) => (
                  <article
                    key={lead.company}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3.5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <p className="text-sm font-medium leading-tight">{lead.company}</p>
                      </div>
                      {lead.priority && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${priorityStyles[lead.priority]}`}
                        >
                          {lead.priority}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 pl-6 text-xs text-slate-500 dark:text-slate-400">{lead.contact}</p>
                    <div className="mt-3 flex items-center justify-between pl-6">
                      <span className="tabular-nums text-sm font-semibold text-slate-900 dark:text-white">
                        {lead.value}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {lead.owner}
                      </span>
                    </div>
                  </article>
                ))}

                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add lead
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
