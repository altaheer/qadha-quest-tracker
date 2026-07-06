import { defineTool } from "@lovable.dev/mcp-js";
import { requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "list_habits",
  title: "List habits",
  description: "List the user's active habits with today's completion count and daily target.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const supabase = supabaseForUser(ctx);
    const user_id = ctx.getUserId();
    const today = new Date().toISOString().slice(0, 10);

    const { data: habits, error } = await supabase
      .from("habits")
      .select("id,name,target_per_day,points")
      .eq("user_id", user_id)
      .eq("archived", false);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const ids = (habits ?? []).map((h) => h.id);
    let logs: { habit_id: string; count: number }[] = [];
    if (ids.length) {
      const { data } = await supabase
        .from("habit_logs")
        .select("habit_id,count")
        .eq("user_id", user_id)
        .eq("date", today)
        .in("habit_id", ids);
      logs = data ?? [];
    }
    const doneById = new Map(logs.map((l) => [l.habit_id, l.count]));
    const rows = (habits ?? []).map((h) => ({
      id: h.id,
      name: h.name,
      target: h.target_per_day,
      done_today: doneById.get(h.id) ?? 0,
      points: h.points,
    }));
    const lines = rows.length
      ? rows.map((r) => `${r.name}: ${r.done_today}/${r.target}`).join("\n")
      : "No habits yet.";
    return { content: [{ type: "text", text: lines }], structuredContent: { habits: rows } };
  },
});
