import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRAYERS, PRAYER_STATUSES, requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "log_prayer",
  title: "Log a prayer",
  description:
    "Record the status of one of the five daily fard prayers for a given date. Status 'jamaah' = prayed in congregation, 'ontime' = prayed on time alone, 'late' = prayed after the window, 'missed' = did not pray, 'none' = clear the entry.",
  inputSchema: {
    date: z.string().describe("ISO date YYYY-MM-DD. Defaults to today if omitted.").optional(),
    prayer: z.enum(PRAYERS),
    status: z.enum(PRAYER_STATUSES),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ date, prayer, status }, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const supabase = supabaseForUser(ctx);
    const d = date ?? new Date().toISOString().slice(0, 10);
    const user_id = ctx.getUserId();

    if (status === "none") {
      const { error } = await supabase
        .from("prayer_logs")
        .delete()
        .match({ user_id, date: d, prayer });
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return { content: [{ type: "text", text: `Cleared ${prayer} on ${d}.` }] };
    }

    const { data, error } = await supabase
      .from("prayer_logs")
      .upsert(
        { user_id, date: d, prayer, status, updated_at: new Date().toISOString() },
        { onConflict: "user_id,date,prayer" },
      )
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${prayer} = ${status} on ${d}.` }],
      structuredContent: { entry: data },
    };
  },
});
