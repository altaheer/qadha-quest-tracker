import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../_supabase";

const QADHA_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"] as const;

export default defineTool({
  name: "adjust_qadha",
  title: "Adjust qadha count",
  description:
    "Increment or decrement the remaining missed-prayer count for one prayer. Positive delta adds to the backlog, negative delta subtracts (e.g. after making up a prayer).",
  inputSchema: {
    prayer: z.enum(QADHA_PRAYERS),
    delta: z.number().int().describe("Signed integer, e.g. -1 to make up one prayer, +5 to add five."),
    reason: z.string().max(200).optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ prayer, delta, reason }, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const supabase = supabaseForUser(ctx);
    const user_id = ctx.getUserId();

    const { data: current } = await supabase
      .from("qadha_counts")
      .select("remaining")
      .eq("user_id", user_id)
      .eq("prayer", prayer)
      .maybeSingle();
    const nextValue = Math.max(0, (current?.remaining ?? 0) + delta);

    const { error: upErr } = await supabase
      .from("qadha_counts")
      .upsert(
        { user_id, prayer, remaining: nextValue, updated_at: new Date().toISOString() },
        { onConflict: "user_id,prayer" },
      );
    if (upErr) return { content: [{ type: "text", text: upErr.message }], isError: true };

    await supabase.from("qadha_events").insert({ user_id, prayer, delta, reason: reason ?? null });

    return {
      content: [{ type: "text", text: `${prayer} qadha: ${current?.remaining ?? 0} → ${nextValue}.` }],
      structuredContent: { prayer, remaining: nextValue, delta },
    };
  },
});
