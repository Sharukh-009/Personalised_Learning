import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  job_title: string;
  years_experience: number;
  career_goals: string;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: string;
};

export type CareerPath = {
  id: string;
  title: string;
  description: string;
  level: string;
  estimated_duration_months: number;
  average_salary_range: string;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_hours: number;
  thumbnail_url: string;
  provider: string;
  category: string;
  created_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: number;
  created_at: string;
  updated_at: string;
  skill?: Skill;
};

export type UserCourse = {
  id: string;
  user_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  course?: Course;
};

export type UserCareerGoal = {
  id: string;
  user_id: string;
  career_path_id: string;
  target_date: string | null;
  status: 'active' | 'achieved' | 'paused';
  created_at: string;
  career_path?: CareerPath;
};
