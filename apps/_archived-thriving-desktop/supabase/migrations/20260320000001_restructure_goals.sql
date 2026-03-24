-- ============================================================
-- Migration: Restructure Goals
-- Date: 2026-03-20
-- Purpose: Rename 7 existing goals to shorter actionable names,
--   add 7 new goals split from the originals, and reparent
--   goals to the correct pillars. Data cleanup only.
-- ============================================================

-- ============================================================
-- STEP 1: RENAME EXISTING GOALS
-- ============================================================

UPDATE public.goals
SET title = 'River fishing crew',
    description = 'Build social connections through fishing on the Piscataqua with Bob and friends',
    updated_at = now()
WHERE title = 'Build Social & Fishing Life on the Piscataqua River';

UPDATE public.goals
SET title = 'Backcountry riding',
    description = 'Build skills for backcountry snowmobile terrain',
    updated_at = now()
WHERE title = 'Become a Backcountry Snowmobiler';

UPDATE public.goals
SET title = 'Montana with Josh',
    description = 'Beekeeping trip to Avalanche Gulch with Josh',
    updated_at = now()
WHERE title = 'Family Time & Travel';

UPDATE public.goals
SET title = 'Grover Ave fixes',
    description = 'Dog door, sump pump, fence, and house maintenance at 32 Grover',
    updated_at = now()
WHERE title = 'Create Safe & Functional Home at 32 Grover Ave';

UPDATE public.goals
SET title = 'B2BBHS systems',
    description = 'Compensation model, billing, and operational systems for B2BBHS',
    updated_at = now()
WHERE title = 'Build Business & Financial Systems';

UPDATE public.goals
SET title = 'Sleep routine',
    description = 'Consistent 9:30 PM bedtime and wind-down habits',
    updated_at = now()
WHERE title = 'Optimize Sleep & Physical Health';

UPDATE public.goals
SET title = 'Office heating',
    description = 'Install new furnace and mini splits at 33 Halsted',
    updated_at = now()
WHERE title = 'Create Comfortable Office at 33 Halsted Street';

-- ============================================================
-- STEP 2: MOVE "Office heating" TO Home & Environment PILLAR
-- (in case it was under a different pillar like Career)
-- ============================================================

UPDATE public.goals
SET pillar_id = (
  SELECT lp.id FROM public.life_pillars lp
  WHERE lp.name = 'Home & Environment'
    AND lp.user_id = public.goals.user_id
  LIMIT 1
),
    updated_at = now()
WHERE title = 'Office heating';

-- ============================================================
-- STEP 3: ADD NEW GOALS
-- Each INSERT uses a subquery to resolve pillar_id by name,
-- scoped to the same user who owns the "River fishing crew"
-- goal (or whichever reference goal exists in that pillar).
-- ============================================================

-- "Buy a boat" → same pillar as "River fishing crew" (social fishing, not adventure)
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT g.user_id, g.pillar_id,
       'Buy a boat',
       'Purchase and set up a boat for the Piscataqua River',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = g.pillar_id),
       '#84cc16', 4
FROM public.goals g
WHERE g.title = 'River fishing crew'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Buy a boat' AND x.user_id = g.user_id);

-- "Dock repair" → Home & Environment
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'Dock repair',
       'Repair floating dock, install pilings, get dock in water by April',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#f97316', 3
FROM public.life_pillars lp
WHERE lp.name = 'Home & Environment'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Dock repair' AND x.user_id = lp.user_id);

-- "Josh & Anita visit" → Family & Relationships
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'Josh & Anita visit',
       'Coordinate summer visit dates for Josh and Anita',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#ec4899', 5
FROM public.life_pillars lp
WHERE lp.name = 'Family & Relationships'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Josh & Anita visit' AND x.user_id = lp.user_id);

-- "Buy a Tacoma" → Home & Environment
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'Buy a Tacoma',
       'Find reliable AWD Toyota Tacoma for snowmobile trips',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#f97316', 6
FROM public.life_pillars lp
WHERE lp.name = 'Home & Environment'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Buy a Tacoma' AND x.user_id = lp.user_id);

-- "Fitness gear" → Health & Fitness
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'Fitness gear',
       'Track down BJJ fitness gear brand and reorder',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#ef4444', 7
FROM public.life_pillars lp
WHERE lp.name = 'Health & Fitness'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Fitness gear' AND x.user_id = lp.user_id);

-- "UPP launch" → Career & Business
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'UPP launch',
       'Ship Thriving app and Silver Trading tool',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#3b82f6', 2
FROM public.life_pillars lp
WHERE lp.name = 'Career & Business'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'UPP launch' AND x.user_id = lp.user_id);

-- "Dog outdoor access" → Home & Environment
INSERT INTO public.goals (user_id, pillar_id, title, description, sort_order, color, priority_rank)
SELECT lp.user_id, lp.id,
       'Dog outdoor access',
       'Doggy door and fence for safe outdoor access at Grover Ave',
       (SELECT COALESCE(MAX(g2.sort_order), 0) + 1 FROM public.goals g2 WHERE g2.pillar_id = lp.id),
       '#f97316', 5
FROM public.life_pillars lp
WHERE lp.name = 'Home & Environment'
  AND NOT EXISTS (SELECT 1 FROM public.goals x WHERE x.title = 'Dog outdoor access' AND x.user_id = lp.user_id);
