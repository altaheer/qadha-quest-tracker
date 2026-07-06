import { auth, defineMcp } from "@lovable.dev/mcp-js";
import logPrayer from "./tools/log-prayer";
import getPrayerDay from "./tools/get-prayer-day";
import getQadhaSummary from "./tools/get-qadha-summary";
import adjustQadha from "./tools/adjust-qadha";
import listHabits from "./tools/list-habits";
import logHabit from "./tools/log-habit";
import getInsightsSummary from "./tools/get-insights-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ibadah-mcp",
  title: "Ibadah Tracker",
  version: "0.1.0",
  instructions:
    "Tools for the user's Ibadah tracker: log and read fard prayers, manage the qadha (missed prayer) backlog, and record habit completions. All actions run as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    logPrayer,
    getPrayerDay,
    getQadhaSummary,
    adjustQadha,
    listHabits,
    logHabit,
    getInsightsSummary,
  ],
});
