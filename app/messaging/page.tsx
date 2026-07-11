import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
export const metadata: Metadata = { title: "Messaging & Billing History - Bare Studios OS" };
const rows = [["Push notification history","214 sent","$0"],["SMS billing history","842 texts","$18.40"],["Email billing history","1,204 emails","$0"],["Text messaging billing history","2 campaigns","$18.40"],["Connect messages","37 conversations","Inbox"],["Purchased products","12 orders","$640"]];
export default async function MessagingPage(){await requireSession();return <PageShell eyebrow="Messaging" title="Messaging and billing history." intro="Track customer messages, campaigns, notification usage, billing history, and purchased products." wide><div className="overflow-hidden rounded-xl border border-border bg-surface">{rows.map(([name,count,cost],i)=><div key={name} className={`grid gap-2 bg-white p-4 text-sm md:grid-cols-3 ${i>0?'border-t border-border':''}`}><strong>{name}</strong><span>{count}</span><span>{cost}</span></div>)}</div></PageShell>}
