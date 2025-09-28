import { NextRequest, NextResponse } from "next/server";
import { readUserFile, writeUserFile } from "@/lib/server/userStorage";
import { UserRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AwaitableParams = { params: { username: string } } | { params: Promise<{ username: string }> };

export async function GET(_req: NextRequest, ctx: AwaitableParams) {
  const { params } = ctx;
  const { username } = await params;
  const record = await readUserFile(username);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(record, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest, ctx: AwaitableParams) {
  const { params } = ctx;
  try {
    const { username } = await params;
    const payload = await request.json();
    // minimal validation
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const record = payload as UserRecord;
    await writeUserFile(username, record);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
