import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const pass = process.env.DASHBOARD_PASSWORD;

  return NextResponse.json({
    SUPABASE_URL: url ? `SET (${url.slice(0, 30)}...)` : "MISSING",
    SUPABASE_ANON_KEY: key ? `SET (length: ${key.length})` : "MISSING",
    DASHBOARD_PASSWORD: pass ? `SET (length: ${pass.length})` : "MISSING",
  });
}
