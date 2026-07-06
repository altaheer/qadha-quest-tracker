import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "log_habit",
  title: "Log habit completion",
  description:
    "Set today's completion count for a habit (by id or exact name). Pass count=0 to clear today's entry.",
  inputSchema: {
    habit_id: z.string().uuid().optional(),
    habit_name: z.string().optional(),
    count: z.number().int().min(0),
    date: z.string().describe("ISO date YYYY-MM-DD. Defaults to today.").optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ habit_id, habit_name, count, date }, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    if (!habit_id && !habit_name) {
      return { content: [{ type: "text", text: "Provide habit_id or habit_name." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const user_id = ctx.getUserId();
    const d = date ?? new Date().toISOString().slice(0, 10);

    let resolvedId = habit_id;
    if (!resolvedId) {
      const { data } = await supabase
        .from("habits")
        .select("id")
        .eq("user_id", user_id)
        .ilike("name", habit_name!)
        .maybeSingle();
      if (!data) {
        return { content: [{ type: "text", text: `No habit named "${habit_name}".` }], isError: true };
      }
      resolvedId = data.id;
    }

    const { error } = await supabase
      .from("habit_logs")
      .upsert(
        { user_id, habit_id: resolvedId, date: d, count, updated_at: new Date().toISOString() },
        { onConflict: "habit_id,date" },
      );
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Habit set to ${count} on ${d}.` }] };
  },
});
