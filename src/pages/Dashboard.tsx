import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, UserCourse, Skill, UserSkill, CareerPath } from '../lib/supabase';
import { BookOpen, Award, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    coursesCompleted: 0,
    skillsTracked: 0,
    careerGoals: 0,
  });
  const [recentCourses, setRecentCourses] = useState<(UserCourse & { course?: Course })[]>([]);
  const [topSkills, setTopSkills] = useState<(UserSkill & { skill?: Skill })[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [coursesData, skillsData, goalsData, coursesListData] = await Promise.all([
        supabase
          .from('user_courses')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('user_skills')
          .select('*, skill:skills(*)')
          .eq('user_id', user.id)
          .order('proficiency_level', { ascending: false })
          .limit(5),
        supabase
          .from('user_career_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        supabase.from('courses').select('*').limit(6),
      ]);

      const allCourses = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id);

      const inProgress = allCourses.data?.filter((c) => c.status === 'in_progress').length || 0;
      const completed = allCourses.data?.filter((c) => c.status === 'completed').length || 0;

      setStats({
        coursesInProgress: inProgress,
        coursesCompleted: completed,
        skillsTracked: skillsData.data?.length || 0,
        careerGoals: goalsData.data?.length || 0,
      });

      setRecentCourses(coursesData.data || []);
      setTopSkills(skillsData.data || []);
      setRecommendedCourses(coursesListData.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Continue your learning journey and achieve your career goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.coursesInProgress}</span>
          </div>
          <p className="text-gray-600 font-medium">In Progress</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</span>
          </div>
          <p className="text-gray-600 font-medium">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.skillsTracked}</span>
          </div>
          <p className="text-gray-600 font-medium">Skills Tracked</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.careerGoals}</span>
          </div>
          <p className="text-gray-600 font-medium">Career Goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>

          {recentCourses.length > 0 ? (
            <div className="space-y-4">
              {recentCourses.map((userCourse) => (
                <div key={userCourse.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">{userCourse.course?.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          userCourse.progress_percentage
                        )}`}
                        style={{ width: `${userCourse.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {userCourse.progress_percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{userCourse.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No courses started yet</p>
              <p className="text-sm mt-1">Browse our course library to get started</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Top Skills</h2>
            <Award className="w-5 h-5 text-gray-400" />
          </div>

          {topSkills.length > 0 ? (
            <div className="space-y-4">
              {topSkills.map((userSkill) => (
                <div key={userSkill.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{userSkill.skill?.name}</span>
                    <span className="text-sm text-gray-500">
                      Level {userSkill.proficiency_level}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-2 rounded-full ${
                          level <= userSkill.proficiency_level
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No skills tracked yet</p>
              <p className="text-sm mt-1">Add your skills to track your progress</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-32 bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white opacity-80" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                    {course.difficulty_level}
                  </span>
                  <span className="text-gray-500">{course.duration_hours}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
