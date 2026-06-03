import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-dashboard-password");
  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
