/** GET /api/wallet/balance?salon=&client= — current wallet balance. */
import { NextRequest, NextResponse } from "next/server";
import { walletBalance } from "@/lib/wallet";

export async function GET(request: NextRequest) {
  const salon = (request.nextUrl.searchParams.get("salon") || "").trim();
  const client = (request.nextUrl.searchParams.get("client") || "").trim();
  if (!salon || !client) {
    return NextResponse.json({ error: "salon and client are required" }, { status: 400 });
  }
  const balance = await walletBalance(salon, client);
  return NextResponse.json({ ok: true, balance });
}
