import { NextResponse } from "next/server";
import { deleteR2ObjectByKey } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, video_storage_key")
    .eq("status", "ended")
    .lte("delete_after", new Date().toISOString());

  for (const event of events ?? []) {
    await deleteR2ObjectByKey(event.video_storage_key);
    await supabase
      .from("events")
      .update({
        status: "deleted",
        video_url: null,
        video_storage_key: null,
        is_playing: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);
  }

  return NextResponse.json({ cleaned: events?.length ?? 0 });
}
