/** POST /api/store/product — add a retail product to the Products tab. */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { getSession } from "@/lib/auth";

const HEADERS = ["Added", "Salon", "Name", "Price", "Description", "Image", "InitialInventory", "Active"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to manage your store." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const price = Number(body.price) || 0;
  const description = (body.description ?? "").trim();
  const image = (body.image ?? "").trim();
  const initialInventory = Math.max(0, Number(body.initialInventory ?? body.inventory) || 0);

  if (!name || price <= 0) {
    return NextResponse.json({ error: "Product name and a price are required." }, { status: 400 });
  }

  const sheet = await appendSheetRow("Products", HEADERS, [
    new Date().toISOString(), session.salon, name, price.toFixed(2), description, image, initialInventory, "yes",
  ]);
  if (!sheet.ok) {
    return NextResponse.json({ error: "Couldn't save the product — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
