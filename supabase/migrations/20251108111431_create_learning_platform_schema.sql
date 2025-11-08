/*
  # Personalized Learning & Career Guidance Platform - Initial Schema

  ## Overview
  Complete database schema for a learning and career guidance platform with personalized recommendations.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `bio` (text)
  - `avatar_url` (text)
  - `job_title` (text)
  - `years_experience` (integer)
  - `career_goals` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. skills
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `category` (text) - e.g., 'technical', 'soft', 'business'
  - `description` (text)
  - `created_at` (timestamptz)

  ### 3. career_paths
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `level` (text) - e.g., 'beginner', 'intermediate', 'advanced'
  - `estimated_duration_months` (integer)
  - `average_salary_range` (text)
  - `created_at` (timestamptz)

  ### 4. courses
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `difficulty_level` (text)
  - `duration_hours` (integer)
  - `thumbnail_url` (text)
  - `provider` (text)
  - `category` (text)
  - `created_at` (timestamptz)

  ### 5. user_skills
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `skill_id` (uuid, references skills)
  - `proficiency_level` (integer) - 1-5 scale
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. user_courses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `course_id` (uuid, references courses)
  - `status` (text) - 'not_started', 'in_progress', 'completed'
  - `progress_percentage` (integer)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 7. career_path_skills
  - `id` (uuid, primary key)
  - `career_path_id` (uuid, references career_paths)
  - `skill_id` (uuid, references skills)
  - `importance_level` (integer) - 1-5 scale
  - `created_at` (timestamptz)

  ### 8. user_career_goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `career_path_id` (uuid, references career_paths)
  - `target_date` (date)
  - `status` (text) - 'active', 'achieved', 'paused'
  - `created_at` (timestamptz)

  ### 9. learning_assessments
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `assessment_type` (text) - 'skill', 'personality', 'career_fit'
  - `results` (jsonb)
  - `completed_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read and update their own data
  - Public read access for reference data (skills, courses, career_paths)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  job_title text DEFAULT '',
  years_experience integer DEFAULT 0,
  career_goals text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Create career_paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  level text NOT NULL,
  estimated_duration_months integer DEFAULT 12,
  average_salary_range text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view career paths"
  ON career_paths FOR SELECT
  TO authenticated
  USING (true);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  difficulty_level text NOT NULL,
  duration_hours integer DEFAULT 1,
  thumbnail_url text DEFAULT '',
  provider text DEFAULT '',
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level integer NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON user_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_courses table
CREATE TABLE IF NOT EXISTS user_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course progress"
  ON user_courses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress"
  ON user_courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress"
  ON user_courses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create career_path_skills table
CREATE TABLE IF NOT EXISTS career_path_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id uuid NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance_level integer NOT NULL CHECK (importance_level BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(career_path_id, skill_id)
);

ALTER TABLE career_path_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view career path skills"
  ON career_path_skills FOR SELECT
  TO authenticated
  USING (true);

-- Create user_career_goals table
CREATE TABLE IF NOT EXISTS user_career_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  career_path_id uuid NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
  target_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_career_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own career goals"
  ON user_career_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career goals"
  ON user_career_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career goals"
  ON user_career_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own career goals"
  ON user_career_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create learning_assessments table
CREATE TABLE IF NOT EXISTS learning_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type text NOT NULL,
  results jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE learning_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON learning_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON learning_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_career_goals_user_id ON user_career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_career_path_skills_career_path_id ON career_path_skills(career_path_id);
