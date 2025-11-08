# LearnPath - Personalized Learning & Career Guidance Platform

A comprehensive full-stack learning and career development platform that personalizes learning paths, tracks skill development, and provides career guidance. Bridges the gap between education and industry with AI-driven recommendations, educator tools, and job matching.

## Features

### For Learners

#### Dashboard
- Personalized welcome with user statistics
- Track courses in progress and completed
- Monitor skills development
- View active career goals
- Recommended courses based on your profile

#### AI-Powered Recommendations
- Personalized course suggestions based on skills and goals
- Career path recommendations with confidence scores
- Job matching based on skill profile
- Mentor suggestions for career growth
- Smart learning path optimization

#### Course Library
- Browse extensive course catalog
- Filter by difficulty level and category
- Enroll in courses and track progress
- Visual progress tracking with percentage completion
- Course ratings and reviews
- Performance metrics and quiz scores

#### Skills Tracking
- Add and manage professional skills
- Rate proficiency levels (1-5 scale)
- Organize skills by category (Technical, Soft Skills, Business)
- Visual skill progression indicators
- Skill gap analysis with recommendations
- Search and filter skills

#### Career Paths
- Explore different career opportunities
- View required skills for each path
- Set career goals with target dates
- Salary range and duration estimates
- Track active career goals
- Skill gap detection for target careers

#### Job Board
- Browse open job postings from verified recruiters
- Filter by type, location, and remote options
- AI-powered job matching with match scores
- Apply with cover letters
- Track application status
- View salary ranges and requirements

#### Mentorship
- Find experienced mentors in your field
- View mentor profiles with ratings and expertise
- Request mentorship sessions
- Track mentorship progress
- Focus area customization

#### User Profile
- Manage personal information
- View comprehensive learning analytics
- Track completion rates and performance
- Edit bio and career goals
- Resume upload and analysis
- Monitor overall progress

### For Educators

#### Educator Dashboard
- Track total students and course enrollments
- Monitor course performance and ratings
- View student analytics and engagement
- Manage multiple courses
- Schedule and track live sessions

#### Course Creation
- Create and publish courses
- Organize content into modules
- Add videos, quizzes, and assignments
- Set course pricing and difficulty levels
- Track enrollment and completion rates

#### Live Sessions
- Schedule live teaching sessions
- Video conferencing integration
- Track attendance
- Recording availability
- Session capacity management

#### Student Analytics
- View individual student performance
- Track completion rates and engagement
- Monitor quiz scores and progress
- Identify struggling students
- Generate performance reports

#### Mentorship Program
- Offer mentorship services
- Set hourly rates
- Manage mentee relationships
- Track mentorship sessions
- Build teaching reputation

### For Recruiters

#### Recruiter Dashboard
- Manage all job postings
- Track application metrics
- View candidate matches
- Monitor job performance
- Application pipeline management

#### Job Posting Management
- Create detailed job listings
- Specify required and preferred skills
- Set salary ranges and benefits
- Track views and applications
- Manage application deadlines

#### Candidate Management
- Review applications with AI match scores
- View candidate resumes and profiles
- Shortlist promising candidates
- Schedule interviews
- Track hiring pipeline

#### Company Profile
- Showcase company information
- Build employer brand
- Verified recruiter badge
- Industry categorization

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The platform uses a comprehensive database schema with:

### Core Tables
- User profiles and authentication
- Skills catalog and user skill tracking
- Course library with user progress
- Career paths with required skills mapping
- User career goals and assessments

### Role-Based Tables
- User roles (learner, educator, recruiter, admin)
- Educator profiles with expertise and ratings
- Recruiter profiles with company information

### Advanced Features
- AI-driven recommendations engine
- Job postings and applications with match scoring
- Resume storage and analysis
- Skill gap detection and recommendations
- Live sessions and attendance tracking
- Mentorship relationships and session management
- User analytics and engagement tracking
- Course modules with various content types

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Authentication required for all user data
- Users can only access and modify their own data
- Public read access for reference data (skills, courses, career paths)
- Recruiters can view applicant data for their own jobs
- Educators can view analytics for their own students

## Getting Started

1. Ensure environment variables are configured in `.env`
2. The database is pre-populated with sample data
3. Sign up to create an account (default role: learner)
4. Explore the platform:
   - Browse and enroll in courses
   - Track your skills and set proficiency levels
   - Get AI-powered recommendations
   - Apply to jobs that match your profile
   - Find mentors to guide your career
   - Set career goals and track progress

## User Roles

### Learner (Default)
All users start as learners with access to:
- Course enrollment and learning
- Skills tracking
- Career exploration
- Job applications
- Mentorship requests

### Educator
Additional access to:
- Course creation and management
- Live session scheduling
- Student analytics
- Mentorship offerings

### Recruiter
Additional access to:
- Job posting management
- Candidate review and shortlisting
- Application tracking
- Company profile management

## Key Features Explained

### AI-Powered Recommendations
The platform analyzes user skills, learning patterns, and career goals to provide personalized recommendations for courses, career paths, jobs, and mentors with confidence scores.

### Skill Gap Analysis
Automatically detects missing skills for target career paths and recommends specific courses to bridge those gaps.

### Job Matching
AI-powered matching algorithm compares candidate skills with job requirements to provide match scores, helping both learners and recruiters find the best fit.

### Resume Analysis
Upload resumes for automatic parsing and skill extraction, with feedback on how to improve your profile for better job matches.

### Live Sessions
Educators can schedule and conduct live teaching sessions with attendance tracking and recording capabilities.

### Analytics Dashboard
Comprehensive analytics for all user types:
- Learners: track learning patterns, engagement, and progress
- Educators: monitor student performance and course metrics
- Recruiters: analyze job posting performance and candidate quality
