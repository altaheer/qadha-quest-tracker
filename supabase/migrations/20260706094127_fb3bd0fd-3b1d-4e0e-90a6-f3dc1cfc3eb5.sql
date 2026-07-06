-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'sv',
  day_reset TEXT NOT NULL DEFAULT '00:00',
  show_arabic BOOLEAN NOT NULL DEFAULT true,
  auto_mark_missed BOOLEAN NOT NULL DEFAULT false,
  auto_mark_missed_time TEXT NOT NULL DEFAULT '23:59',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Prayer logs
CREATE TABLE public.prayer_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  prayer TEXT NOT NULL CHECK (prayer IN ('fajr','dhuhr','asr','maghrib','isha')),
  status TEXT NOT NULL CHECK (status IN ('jamaah','ontime','late','missed','none')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, prayer)
);
CREATE INDEX ON public.prayer_logs (user_id, date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_logs TO authenticated;
GRANT ALL ON public.prayer_logs TO service_role;
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prayer logs" ON public.prayer_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Qadha counts
CREATE TABLE public.qadha_counts (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prayer TEXT NOT NULL CHECK (prayer IN ('fajr','dhuhr','asr','maghrib','isha','witr')),
  remaining INTEGER NOT NULL DEFAULT 0 CHECK (remaining >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prayer)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qadha_counts TO authenticated;
GRANT ALL ON public.qadha_counts TO service_role;
ALTER TABLE public.qadha_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own qadha counts" ON public.qadha_counts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Qadha events
CREATE TABLE public.qadha_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prayer TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.qadha_events (user_id, occurred_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qadha_events TO authenticated;
GRANT ALL ON public.qadha_events TO service_role;
ALTER TABLE public.qadha_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own qadha events" ON public.qadha_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habits
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_per_day INTEGER NOT NULL DEFAULT 1 CHECK (target_per_day > 0),
  points INTEGER NOT NULL DEFAULT 1,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.habits (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habits" ON public.habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit logs
CREATE TABLE public.habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)
);
CREATE INDEX ON public.habit_logs (user_id, date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();