import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRAYERS, requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "get_prayer_day",
  title: "Get prayers for a day",
  description: "Return the status of all five fard prayers for a given date (defaults to today).",
  inputSchema: {
    date: z.string().describe("ISO date YYYY-MM-DD. Defaults to today.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const d = date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseForUser(ctx)
      .from("prayer_logs")
      .select("prayer,status,logged_at")
      .eq("user_id", ctx.getUserId())
      .eq("date", d);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const byPrayer = Object.fromEntries(PRAYERS.map((p) => [p, "none" as string]));
    for (const row of data ?? []) byPrayer[row.prayer] = row.status;
    const summary = PRAYERS.map((p) => `${p}: ${byPrayer[p]}`).join(", ");
    return {
      content: [{ type: "text", text: `${d} — ${summary}` }],
      structuredContent: { date: d, prayers: byPrayer },
    };
  },
});
