import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import ComplaintForm from "@/components/agents/ComplaintForm";

export const metadata: Metadata = {
  title: "Speak to a manager — Bare Studios OS",
  description: "File a concern directly with salon management — the owner is alerted immediately and follows up until it's resolved.",
};

export default function SpeakToManagerPage() {
  return (
    <PageShell
      eyebrow="Client care"
      title="Speak to a manager."
      intro="Had an issue with your visit? Tell us here and it goes straight to the owner or manager — no waiting on hold, no front-desk runaround. They're alerted right away and again after 24 hours until it's resolved."
      note="Your message is logged as a ticket so nothing falls through the cracks."
    >
      <ComplaintForm />
    </PageShell>
  );
}
