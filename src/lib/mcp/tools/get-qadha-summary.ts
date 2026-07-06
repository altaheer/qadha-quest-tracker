import { defineTool } from "@lovable.dev/mcp-js";
import { requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "get_qadha_summary",
  title: "Get qadha (missed prayer) backlog",
  description: "Return the remaining count of missed prayers per prayer type, and the total.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const { data, error } = await supabaseForUser(ctx)
      .from("qadha_counts")
      .select("prayer,remaining")
      .eq("user_id", ctx.getUserId());
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const byPrayer: Record<string, number> = {};
    let total = 0;
    for (const row of data ?? []) {
      byPrayer[row.prayer] = row.remaining;
      total += row.remaining;
    }
    const lines = Object.entries(byPrayer).map(([p, n]) => `${p}: ${n}`).join(", ");
    return {
      content: [{ type: "text", text: `Qadha remaining — ${lines || "none logged"} (total ${total}).` }],
      structuredContent: { total, remaining: byPrayer },
    };
  },
});
