import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Consume the body to measure upload
  const body = await request.arrayBuffer();
  return NextResponse.json({
    ok: true,
    bytes: body.byteLength,
    ts: Date.now(),
  });
}
