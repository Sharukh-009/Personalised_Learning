/*
  # Comprehensive Platform Features

  ## Overview
  Adds advanced features including AI-driven recommendations, educator tools, career module with resume analysis, and enhanced dashboards.

  ## New Tables

  ### 1. user_roles
  - Defines user types: learner, educator, recruiter, admin
  - Users can have multiple roles

  ### 2. educator_profiles
  - Extended profile for educators
  - Expertise, bio, ratings, certifications

  ### 3. recruiter_profiles
  - Extended profile for recruiters
  - Company information, job postings

  ### 4. course_modules
  - Course content structure
  - Lessons, videos, quizzes organized by module

  ### 5. live_sessions
  - Educator-led live sessions
  - Scheduling, attendance tracking

  ### 6. mentorships
  - Mentor-mentee relationships
  - Session tracking

  ### 7. resumes
  - User resume storage and parsing
  - Skills extraction, experience data

  ### 8. skill_gaps
  - AI-detected skill gaps
  - Recommendations for improvement

  ### 9. job_postings
  - Jobs from recruiters
  - Skill requirements, salary ranges

  ### 10. job_applications
  - User applications to jobs
  - Match scores, status tracking

  ### 11. recommendations
  - AI-driven recommendations
  - Courses, mentors, jobs, learning paths

  ### 12. user_analytics
  - Learning patterns, performance metrics
  - Time tracking, engagement scores

  ## Security
  - RLS enabled on all tables
  - Role-based access control
  - Users can only access their own data or public data
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('learner', 'educator', 'recruiter', 'admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create educator_profiles table
CREATE TABLE IF NOT EXISTS educator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  expertise_areas text[] DEFAULT '{}',
  teaching_experience_years integer DEFAULT 0,
  certifications text[] DEFAULT '{}',
  hourly_rate numeric(10,2) DEFAULT 0,
  availability_hours text DEFAULT '',
  rating numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  total_students integer DEFAULT 0,
  total_courses integer DEFAULT 0,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view educator profiles"
  ON educator_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Educators can update own profile"
  ON educator_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can insert own profile"
  ON educator_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create recruiter_profiles table
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  company_website text DEFAULT '',
  company_size text DEFAULT '',
  industry text DEFAULT '',
  company_description text DEFAULT '',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recruiter profiles"
  ON recruiter_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recruiters can update own profile"
  ON recruiter_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can insert own profile"
  ON recruiter_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Extend courses table with educator_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'educator_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN educator_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
    ALTER TABLE courses ADD COLUMN is_active boolean DEFAULT true;
    ALTER TABLE courses ADD COLUMN enrollment_count integer DEFAULT 0;
    ALTER TABLE courses ADD COLUMN rating numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5);
  END IF;
END $$;

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL,
  content_type text CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
  content_url text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course modules"
  ON course_modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Educators can manage own course modules"
  ON course_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_modules.course_id
      AND courses.educator_id = auth.uid()
    )
  );

-- Extend user_courses with performance metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_courses' AND column_name = 'quiz_scores'
  ) THEN
    ALTER TABLE user_courses ADD COLUMN quiz_scores jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE user_courses ADD COLUMN time_spent_minutes integer DEFAULT 0;
    ALTER TABLE user_courses ADD COLUMN last_accessed_at timestamptz;
    ALTER TABLE user_courses ADD COLUMN performance_score numeric(5,2) DEFAULT 0;
    ALTER TABLE user_courses ADD COLUMN certificate_url text DEFAULT '';
  END IF;
END $$;

-- Create live_sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  educator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  meeting_url text DEFAULT '',
  max_participants integer DEFAULT 50,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  recording_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live sessions"
  ON live_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Educators can manage own sessions"
  ON live_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = educator_id);

-- Create session_attendees table
CREATE TABLE IF NOT EXISTS session_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  attended boolean DEFAULT false,
  UNIQUE(session_id, user_id)
);

ALTER TABLE session_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON session_attendees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
  ON session_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view session attendance"
  ON session_attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_sessions
      WHERE live_sessions.id = session_attendees.session_id
      AND live_sessions.educator_id = auth.uid()
    )
  );

-- Create mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  focus_area text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  sessions_completed integer DEFAULT 0,
  next_session_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mentorships"
  ON mentorships FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can manage own mentorships"
  ON mentorships FOR ALL
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  parsed_data jsonb DEFAULT '{}'::jsonb,
  extracted_skills text[] DEFAULT '{}',
  years_of_experience integer DEFAULT 0,
  education_level text DEFAULT '',
  analysis_score numeric(5,2) DEFAULT 0,
  analysis_feedback jsonb DEFAULT '{}'::jsonb,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own resumes"
  ON resumes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create skill_gaps table
CREATE TABLE IF NOT EXISTS skill_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_career_path_id uuid REFERENCES career_paths(id) ON DELETE SET NULL,
  missing_skills jsonb DEFAULT '[]'::jsonb,
  proficiency_gaps jsonb DEFAULT '[]'::jsonb,
  recommended_courses uuid[] DEFAULT '{}',
  priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill gaps"
  ON skill_gaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own skill gaps"
  ON skill_gaps FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  required_skills uuid[] DEFAULT '{}',
  preferred_skills uuid[] DEFAULT '{}',
  experience_level text NOT NULL,
  min_experience_years integer DEFAULT 0,
  max_experience_years integer,
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  location text DEFAULT '',
  job_type text DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  remote_allowed boolean DEFAULT false,
  application_deadline date,
  status text DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open job postings"
  ON job_postings FOR SELECT
  TO authenticated
  USING (status = 'open');

CREATE POLICY "Recruiters can manage own job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (auth.uid() = recruiter_id);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'accepted')),
  match_score numeric(5,2) DEFAULT 0,
  matching_skills uuid[] DEFAULT '{}',
  missing_skills uuid[] DEFAULT '{}',
  recruiter_notes text DEFAULT '',
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own applications"
  ON job_applications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view applications for own jobs"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update applications for own jobs"
  ON job_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.recruiter_id = auth.uid()
    )
  );

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('course', 'mentor', 'job', 'skill', 'career_path')),
  target_id uuid NOT NULL,
  reason text DEFAULT '',
  confidence_score numeric(5,2) DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  is_viewed boolean DEFAULT false,
  is_acted_upon boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time_spent_minutes integer DEFAULT 0,
  courses_accessed integer DEFAULT 0,
  modules_completed integer DEFAULT 0,
  quiz_attempts integer DEFAULT 0,
  average_quiz_score numeric(5,2) DEFAULT 0,
  sessions_attended integer DEFAULT 0,
  engagement_score numeric(5,2) DEFAULT 0,
  learning_streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON user_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON user_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view student analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = user_analytics.user_id
      AND c.educator_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_educator_profiles_user_id ON educator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_educator_id ON courses(educator_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_educator_id ON live_sessions(educator_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_course_id ON live_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_session_attendees_session_id ON session_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendees_user_id ON session_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id ON skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter_id ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(date);
