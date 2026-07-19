
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS habits_user_slug_idx ON public.habits(user_id, slug) WHERE slug IS NOT NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qadha_counts;

ALTER TABLE public.prayer_logs REPLICA IDENTITY FULL;
ALTER TABLE public.habit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.qadha_counts REPLICA IDENTITY FULL;
