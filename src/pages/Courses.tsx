import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, UserCourse } from '../lib/supabase';
import { BookOpen, Clock, Filter, Search, Play, CheckCircle } from 'lucide-react';

export const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      const [coursesData, userCoursesData] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        user
          ? supabase.from('user_courses').select('*').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setCourses(coursesData.data || []);
      setUserCourses(userCoursesData.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_courses').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'in_progress',
        progress_percentage: 0,
        started_at: new Date().toISOString(),
      });

      if (error) throw error;
      await loadCourses();
    } catch (error) {
      console.error('Error starting course:', error);
    }
  };

  const updateProgress = async (userCourseId: string, progress: number) => {
    try {
      const updates: any = {
        progress_percentage: progress,
      };

      if (progress === 100) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_courses')
        .update(updates)
        .eq('id', userCourseId);

      if (error) throw error;
      await loadCourses();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getUserCourse = (courseId: string) => {
    return userCourses.find((uc) => uc.course_id === courseId);
  };

  const categories = ['all', ...new Set(courses.map((c) => c.category))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.difficulty_level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Library</h1>
        <p className="text-gray-600">
          Browse and enroll in courses to expand your skills
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Difficulty Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const userCourse = getUserCourse(course.id);
          return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-40 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 flex items-center justify-center relative">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
                {userCourse && (
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2">
                    {userCourse.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Play className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 flex-1">
                    {course.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {course.difficulty_level}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration_hours}h
                  </div>
                </div>

                {userCourse ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-semibold text-blue-600">
                        {userCourse.progress_percentage}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${userCourse.progress_percentage}%` }}
                      ></div>
                    </div>
                    {userCourse.status !== 'completed' && (
                      <button
                        onClick={() =>
                          updateProgress(
                            userCourse.id,
                            Math.min(100, userCourse.progress_percentage + 25)
                          )
                        }
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                      >
                        Continue Learning
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => startCourse(course.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md hover:shadow-lg"
                  >
                    Start Course
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No courses found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};
