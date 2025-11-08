/*
  # Seed Initial Platform Data

  ## Overview
  Populates the database with sample skills, career paths, and courses for the learning platform.

  ## Data Seeded
  - 20+ skills across technical, soft skills, and business categories
  - 6 career paths with different levels
  - 15+ courses across various categories
  - Links between career paths and required skills
*/

-- Insert Skills
INSERT INTO skills (name, category, description) VALUES
  ('JavaScript', 'technical', 'Programming language for web development'),
  ('Python', 'technical', 'Versatile programming language for data science and backend'),
  ('React', 'technical', 'Popular JavaScript library for building user interfaces'),
  ('SQL', 'technical', 'Database query language'),
  ('Data Analysis', 'technical', 'Analyzing and interpreting complex data'),
  ('Machine Learning', 'technical', 'Building predictive models and AI systems'),
  ('Project Management', 'business', 'Planning and executing projects effectively'),
  ('Communication', 'soft', 'Clear and effective information exchange'),
  ('Leadership', 'soft', 'Guiding and motivating teams'),
  ('Problem Solving', 'soft', 'Analytical thinking and solution development'),
  ('UI/UX Design', 'technical', 'Designing user interfaces and experiences'),
  ('Cloud Computing', 'technical', 'Working with cloud platforms like AWS, Azure'),
  ('Agile Methodologies', 'business', 'Agile project management and Scrum'),
  ('Strategic Thinking', 'business', 'Long-term planning and strategic decision making'),
  ('Public Speaking', 'soft', 'Presenting ideas to groups effectively'),
  ('Time Management', 'soft', 'Organizing and prioritizing tasks efficiently'),
  ('Marketing', 'business', 'Promoting products and services'),
  ('Financial Analysis', 'business', 'Analyzing financial data and metrics'),
  ('Node.js', 'technical', 'JavaScript runtime for backend development'),
  ('DevOps', 'technical', 'Development and operations integration')
ON CONFLICT (name) DO NOTHING;

-- Insert Career Paths
INSERT INTO career_paths (title, description, level, estimated_duration_months, average_salary_range) VALUES
  ('Full Stack Developer', 'Build complete web applications from front-end to back-end', 'intermediate', 12, '$70k - $120k'),
  ('Data Scientist', 'Analyze complex data and build predictive models', 'advanced', 18, '$90k - $150k'),
  ('Product Manager', 'Lead product strategy and development', 'intermediate', 15, '$80k - $140k'),
  ('UX Designer', 'Create intuitive and beautiful user experiences', 'beginner', 9, '$60k - $100k'),
  ('DevOps Engineer', 'Automate and optimize development workflows', 'advanced', 14, '$85k - $135k'),
  ('Business Analyst', 'Bridge business needs with technical solutions', 'beginner', 10, '$65k - $105k')
ON CONFLICT DO NOTHING;

-- Insert Courses
INSERT INTO courses (title, description, difficulty_level, duration_hours, provider, category) VALUES
  ('JavaScript Fundamentals', 'Learn the basics of JavaScript programming', 'beginner', 20, 'CodeAcademy', 'Programming'),
  ('Advanced React Patterns', 'Master advanced React concepts and patterns', 'advanced', 15, 'Frontend Masters', 'Web Development'),
  ('Python for Data Science', 'Use Python for data analysis and visualization', 'intermediate', 25, 'DataCamp', 'Data Science'),
  ('SQL Mastery', 'Become proficient in database queries', 'intermediate', 18, 'SQLBolt', 'Database'),
  ('Machine Learning Fundamentals', 'Introduction to ML algorithms and concepts', 'advanced', 30, 'Coursera', 'AI/ML'),
  ('Effective Communication Skills', 'Improve your professional communication', 'beginner', 8, 'LinkedIn Learning', 'Soft Skills'),
  ('Project Management Professional', 'Prepare for PMP certification', 'intermediate', 40, 'PMI', 'Business'),
  ('UI/UX Design Principles', 'Learn design thinking and user research', 'beginner', 16, 'Interaction Design Foundation', 'Design'),
  ('Cloud Architecture with AWS', 'Design scalable cloud solutions', 'advanced', 35, 'AWS Training', 'Cloud'),
  ('Agile Scrum Master Certification', 'Become a certified Scrum Master', 'intermediate', 20, 'Scrum Alliance', 'Business'),
  ('Leadership Essentials', 'Develop core leadership capabilities', 'beginner', 12, 'Harvard Online', 'Soft Skills'),
  ('Node.js Backend Development', 'Build robust backend applications', 'intermediate', 22, 'Udemy', 'Web Development'),
  ('Data Visualization with Tableau', 'Create impactful data visualizations', 'beginner', 14, 'Tableau', 'Data Science'),
  ('Strategic Thinking for Leaders', 'Develop strategic planning skills', 'advanced', 18, 'MIT Sloan', 'Business'),
  ('Public Speaking Mastery', 'Become a confident public speaker', 'beginner', 10, 'Toastmasters', 'Soft Skills')
ON CONFLICT DO NOTHING;

-- Link Career Paths with Skills
-- Full Stack Developer Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'Full Stack Developer' AND s.name IN ('JavaScript', 'React', 'Node.js')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'Full Stack Developer' AND s.name IN ('SQL', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- Data Scientist Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'Data Scientist' AND s.name IN ('Python', 'Machine Learning', 'Data Analysis')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'Data Scientist' AND s.name IN ('SQL', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- Product Manager Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'Product Manager' AND s.name IN ('Strategic Thinking', 'Communication', 'Project Management')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'Product Manager' AND s.name IN ('Leadership', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- UX Designer Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'UX Designer' AND s.name IN ('UI/UX Design', 'Communication')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'UX Designer' AND s.name IN ('Problem Solving')
ON CONFLICT DO NOTHING;

-- DevOps Engineer Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'DevOps Engineer' AND s.name IN ('DevOps', 'Cloud Computing')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'DevOps Engineer' AND s.name IN ('Python', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- Business Analyst Skills
INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 5
FROM career_paths cp, skills s
WHERE cp.title = 'Business Analyst' AND s.name IN ('Data Analysis', 'Communication')
ON CONFLICT DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, importance_level)
SELECT cp.id, s.id, 4
FROM career_paths cp, skills s
WHERE cp.title = 'Business Analyst' AND s.name IN ('SQL', 'Problem Solving', 'Financial Analysis')
ON CONFLICT DO NOTHING;