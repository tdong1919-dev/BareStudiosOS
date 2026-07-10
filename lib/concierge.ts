import { appendSheetRow } from "@/lib/sheets";

export const CONCIERGE_HEADERS = [
  "Created",
  "Channel",
  "Direction",
  "Client Name",
  "Contact",
  "Message",
  "Intent",
  "Status",
  "Assigned To",
  "Source",
  "Transcript URL",
  "Call ID",
];

export type ConciergeMessage = {
  channel: string;
  direction: string;
  clientName: string;
  contact: string;
  message: string;
  intent: string;
  status: string;
  assignedTo: string;
  source: string;
  transcriptUrl?: string;
  callId?: string;
};

export async function logConciergeMessage(message: ConciergeMessage) {
  return appendSheetRow("ConciergeInbox", CONCIERGE_HEADERS, [
    new Date().toISOString(),
    message.channel,
    message.direction,
    message.clientName,
    message.contact,
    message.message,
    message.intent,
    message.status,
    message.assignedTo,
    message.source,
    message.transcriptUrl || "",
    message.callId || "",
  ]);
}

export function conciergeConfigured() {
  return Boolean(process.env.RETELL_API_KEY && process.env.RETELL_AGENT_ID);
}
