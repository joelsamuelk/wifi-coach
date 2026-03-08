import { NextResponse } from "next/server";

// Returns a ~5MB binary payload for throughput testing
export async function GET() {
  const SIZE = 5 * 1024 * 1024; // 5 MB
  const data = new Uint8Array(SIZE);
  // Fill with random-ish data to prevent compression
  for (let i = 0; i < SIZE; i++) {
    data[i] = (i * 7 + 13) & 0xff;
  }
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(SIZE),
      "Cache-Control": "no-store",
    },
  });
}
