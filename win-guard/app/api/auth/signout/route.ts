import { NextResponse, NextRequest } from "next/server";
import { createServer } from "../../../../lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", req.url));
}


