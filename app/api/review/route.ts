/**
 * POST /api/review — capture a client review into a "Reviews" tab so reviews
 * from Google, the website, and old booking sites can live in one place.
 * The page at /reviews reads this tab via gviz.
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";

const HEADERS = ["Date", "Name", "Rating", "Source", "Review"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const ratingNum = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
  const source = (body.source ?? "Website").trim();
  const review = (body.review ?? "").trim();

  if (!review || !ratingNum) {
    return NextResponse.json({ error: "Add a rating and a few words." }, { status: 400 });
  }

  const sheet = await appendSheetRow("Reviews", HEADERS, [
    new Date().toISOString().slice(0, 10), name || "Anonymous", String(ratingNum), source, review,
  ]);

  if (!sheet.ok) {
    return NextResponse.json({ error: "Couldn't save your review — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
