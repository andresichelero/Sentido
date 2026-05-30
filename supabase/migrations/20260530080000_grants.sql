-- Grant permissions to authenticated and anon roles for all tables
GRANT ALL ON TABLE public.profiles TO authenticated, anon;
GRANT ALL ON TABLE public.checkins TO authenticated, anon;
GRANT ALL ON TABLE public.user_insights TO authenticated, anon;

-- Note: RLS policies will still enforce security rules on top of these grants.
