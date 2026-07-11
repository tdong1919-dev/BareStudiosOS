import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import { AGENT_PROMPTS } from "@/lib/agent-prompts";

export const metadata: Metadata = { title: "Assistant Settings - Bare Studios OS" };

const labels: Record<keyof typeof AGENT_PROMPTS, string> = {
  financial: "Financial Assistant",
  inventory: "Inventory Assistant",
  intelligence: "Industry Intelligence",
  reviews: "Reviews Assistant",
  concierge: "Receptionist / Concierge",
  retention: "Retention Assistant",
  brandBrain: "Brand Brain",
  socialScheduler: "Social Smart Scheduler",
};

export default async function AssistantSettingsPage() {
  await requireSession();

  return (
    <PageShell
      eyebrow="Assistants"
      title="Assistant settings."
      intro="Review the shared job boundaries, approval rules, business memory, structured outputs, and master prompts that keep every assistant aligned."
      wide
    >
      <div className="grid gap-5">
        {(Object.keys(AGENT_PROMPTS) as Array<keyof typeof AGENT_PROMPTS>).map((key) => (
          <section key={key} className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-2xl">{labels[key]}</h2>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">Master prompt ready</span>
            </div>
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-md border border-border bg-white p-4 text-xs leading-6 text-text-secondary whitespace-pre-wrap">
              {AGENT_PROMPTS[key]}
            </pre>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
