import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Video,
  Plus,
  Eye,
  Edit,
} from 'lucide-react';

type CourseStats = {
  id: string;
  title: string;
  enrollment_count: number;
  rating: number;
  created_at: string;
};

type SessionData = {
  id: string;
  title: string;
  scheduled_start: string;
  current_participants: number;
  max_participants: number;
  status: string;
};

type StudentAnalytics = {
  total_students: number;
  active_students: number;
  avg_completion_rate: number;
  total_courses: number;
};

export const EducatorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics>({
    total_students: 0,
    active_students: 0,
    avg_completion_rate: 0,
    total_courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [coursesData, sessionsData] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, enrollment_count, rating, created_at')
          .eq('educator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('live_sessions')
          .select('*')
          .eq('educator_id', user.id)
          .gte('scheduled_start', new Date().toISOString())
          .order('scheduled_start')
          .limit(3),
      ]);

      setCourses(coursesData.data || []);
      setSessions(sessionsData.data || []);

      const totalCourses = coursesData.data?.length || 0;
      const totalStudents =
        coursesData.data?.reduce((sum, course) => sum + (course.enrollment_count || 0), 0) || 0;

      setAnalytics({
        total_students: totalStudents,
        active_students: Math.floor(totalStudents * 0.7),
        avg_completion_rate: 75,
        total_courses: totalCourses,
      });
    } catch (error) {
      console.error('Error loading educator dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Educator Dashboard</h1>
          <p className="text-gray-600">Manage your courses, students, and live sessions</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md">
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{analytics.total_courses}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Courses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{analytics.total_students}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{analytics.active_students}</span>
          </div>
          <p className="text-gray-600 font-medium">Active Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {analytics.avg_completion_rate}%
            </span>
          </div>
          <p className="text-gray-600 font-medium">Avg Completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(course.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        {course.enrollment_count} students
                      </span>
                      <span className="text-yellow-600">
                        ★ {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No courses yet</p>
              <p className="text-sm mt-1">Create your first course to get started</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduled_start).toLocaleDateString()}
                        </span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>
                          {new Date(session.scheduled_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : session.status === 'live'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {session.current_participants}/{session.max_participants}
                    </span>
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Video className="w-4 h-4" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming sessions</p>
              <p className="text-sm mt-1">Schedule a live session for your students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
