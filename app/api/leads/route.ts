import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, message, type, source } = body;
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("Master").insert({
      name,
      email,
      phone: phone ?? null,
      message: message ?? null,
      type: type ?? "general",
      source: source ?? "bigmoneyrealty.com",
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead insert error:", err);
    return NextResponse.json({ error: "Failed to save lead." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-dashboard-password");
  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Supabase not yet configured — return empty leads so dashboard still opens
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ leads: [], notice: "Supabase not configured." });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Master")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ leads: data });
  } catch (err) {
    console.error("Lead fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch leads." }, { status: 500 });
  }
}
