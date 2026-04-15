-- Seed data for development (run after creating users in Supabase Auth)
-- This creates sample programs, milestones, and tasks

-- Note: Replace the UUIDs below with actual user IDs from your Supabase Auth dashboard

-- Sample program (replace 'mentor-uuid-here' with actual mentor user ID)
-- insert into public.programs (id, title, description, mentor_id, status, start_date, end_date)
-- values (
--   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--   'Full-Stack Web Development',
--   'A comprehensive 12-week program covering React, Node.js, and PostgreSQL',
--   'mentor-uuid-here',
--   'active',
--   current_date,
--   current_date + interval '12 weeks'
-- );

-- Sample milestones
-- insert into public.milestones (program_id, title, description, order_index, due_date)
-- values
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Week 1-2: HTML & CSS Fundamentals', 'Master the basics of web layout and styling', 1, current_date + interval '2 weeks'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Week 3-4: JavaScript Essentials', 'Learn core JavaScript concepts and DOM manipulation', 2, current_date + interval '4 weeks'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Week 5-8: React Development', 'Build modern UIs with React and state management', 3, current_date + interval '8 weeks'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Week 9-12: Backend & Database', 'Create APIs with Node.js and PostgreSQL', 4, current_date + interval '12 weeks');
