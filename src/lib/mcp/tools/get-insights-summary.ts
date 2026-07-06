import { defineTool } from "@lovable.dev/mcp-js";
import { requireAuth, supabaseForUser } from "../_supabase";

export default defineTool({
  name: "get_insights_summary",
  title: "Get insights summary",
  description:
    "Return a summary of the last 7 days: prayer status counts, habits completed, and total qadha remaining.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const err = requireAuth(ctx);
    if (err) return err;
    const supabase = supabaseForUser(ctx);
    const user_id = ctx.getUserId();
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [{ data: prayers }, { data: habitLogs }, { data: qadha }] = await Promise.all([
      supabase.from("prayer_logs").select("status").eq("user_id", user_id).gte("date", since),
      supabase.from("habit_logs").select("count").eq("user_id", user_id).gte("date", since),
      supabase.from("qadha_counts").select("remaining").eq("user_id", user_id),
    ]);

    const byStatus: Record<string, number> = {};
    for (const p of prayers ?? []) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    const habitCompletions = (habitLogs ?? []).reduce((s, l) => s + (l.count ?? 0), 0);
    const qadhaTotal = (qadha ?? []).reduce((s, r) => s + (r.remaining ?? 0), 0);

    return {
      content: [
        {
          type: "text",
          text: `Last 7 days — prayers: ${JSON.stringify(byStatus)}, habit completions: ${habitCompletions}, qadha remaining: ${qadhaTotal}.`,
        },
      ],
      structuredContent: {
        window_days: 7,
        prayers_by_status: byStatus,
        habit_completions: habitCompletions,
        qadha_remaining_total: qadhaTotal,
      },
    };
  },
});
