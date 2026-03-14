-- Function to create default pillars for new users
create or replace function public.create_default_pillars()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.life_pillars (user_id, name, icon, color, sort_order)
  values
    (new.id, 'Health & Fitness', '🏋️', '#ef4444', 1),
    (new.id, 'Career & Business', '💼', '#3b82f6', 2),
    (new.id, 'Family & Relationships', '👨‍👩‍👧‍👦', '#ec4899', 3),
    (new.id, 'Finances', '💰', '#22c55e', 4),
    (new.id, 'Outdoors & Adventure', '🌲', '#84cc16', 5),
    (new.id, 'Home & Environment', '🏠', '#f97316', 6),
    (new.id, 'Growth & Learning', '📚', '#8b5cf6', 7);
  return new;
end;
$$;

-- Trigger: create default pillars when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_default_pillars();
