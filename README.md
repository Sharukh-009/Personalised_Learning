# LearnPath - Personalized Learning & Career Guidance Platform

A comprehensive full-stack learning and career development platform that personalizes learning paths, tracks skill development, and provides career guidance.

## Features

### Dashboard
- Personalized welcome with user statistics
- Track courses in progress and completed
- Monitor skills development
- View active career goals
- Recommended courses based on your profile

### Course Library
- Browse extensive course catalog
- Filter by difficulty level and category
- Enroll in courses and track progress
- Visual progress tracking with percentage completion
- Course categorization and search functionality

### Skills Tracking
- Add and manage your professional skills
- Rate proficiency levels (1-5 scale)
- Organize skills by category (Technical, Soft Skills, Business)
- Visual skill progression indicators
- Search and filter skills

### Career Paths
- Explore different career opportunities
- View required skills for each path
- Set career goals with target dates
- Salary range and duration estimates
- Track active career goals

### User Profile
- Manage personal information
- View learning statistics
- Track completion rates
- Edit bio and career goals
- Monitor overall progress

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The platform uses a comprehensive database schema with:
- User profiles and authentication
- Skills catalog and user skill tracking
- Course library with user progress
- Career paths with required skills mapping
- User career goals and assessments
- Row Level Security (RLS) for data protection

## Getting Started

1. Ensure environment variables are configured
2. The database is pre-populated with sample data
3. Sign up to create an account
4. Start exploring courses, tracking skills, and setting career goals

## Security Features

- Row Level Security (RLS) enabled on all tables
- Authentication required for all user data
- Users can only access and modify their own data
- Public read access for reference data (skills, courses, career paths)
