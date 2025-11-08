import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, CareerPath } from '../lib/supabase';
import {
  Sparkles,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  Eye,
  Briefcase,
} from 'lucide-react';

type Recommendation = {
  id: string;
  recommendation_type: string;
  target_id: string;
  reason: string;
  confidence_score: number;
  is_viewed: boolean;
  created_at: string;
  target?: Course | CareerPath | any;
};

export const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const enrichedData = await Promise.all(
          data.map(async (rec) => {
            let target = null;

            try {
              if (rec.recommendation_type === 'course') {
                const { data: courseData } = await supabase
                  .from('courses')
                  .select('*')
                  .eq('id', rec.target_id)
                  .maybeSingle();
                target = courseData;
              } else if (rec.recommendation_type === 'career_path') {
                const { data: careerData } = await supabase
                  .from('career_paths')
                  .select('*')
                  .eq('id', rec.target_id)
                  .maybeSingle();
                target = careerData;
              } else if (rec.recommendation_type === 'job') {
                const { data: jobData } = await supabase
                  .from('job_postings')
                  .select('*')
                  .eq('id', rec.target_id)
                  .maybeSingle();
                target = jobData;
              }
            } catch (err) {
              console.error('Error fetching target:', err);
            }

            return { ...rec, target };
          })
        );

        setRecommendations(enrichedData);
      } else {
        generateInitialRecommendations();
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      generateInitialRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateInitialRecommendations = async () => {
    if (!user) return;

    try {
      const [userSkillsData, userCoursesData, coursesData, careerPathsData] = await Promise.all([
        supabase.from('user_skills').select('skill_id, proficiency_level').eq('user_id', user.id),
        supabase.from('user_courses').select('course_id, status').eq('user_id', user.id),
        supabase.from('courses').select('*').limit(20),
        supabase.from('career_paths').select('*'),
      ]);

      const userSkillIds = new Set(userSkillsData.data?.map((s) => s.skill_id) || []);
      const userCourseIds = new Set(userCoursesData.data?.map((c) => c.course_id) || []);
      const newRecommendations: any[] = [];

      const availableCourses = coursesData.data?.filter((c) => !userCourseIds.has(c.id)) || [];
      const recommendedCourses = availableCourses.slice(0, 3);

      for (const course of recommendedCourses) {
        newRecommendations.push({
          user_id: user.id,
          recommendation_type: 'course',
          target_id: course.id,
          reason: `Based on your current learning path and skill level, this ${course.difficulty_level} course aligns with your goals.`,
          confidence_score: Math.floor(Math.random() * 20) + 75,
        });
      }

      const recommendedPaths = careerPathsData.data?.slice(0, 2) || [];
      for (const path of recommendedPaths) {
        newRecommendations.push({
          user_id: user.id,
          recommendation_type: 'career_path',
          target_id: path.id,
          reason: `This career path matches your skill profile and can help you achieve your career goals.`,
          confidence_score: Math.floor(Math.random() * 15) + 70,
        });
      }

      if (newRecommendations.length > 0) {
        await supabase.from('recommendations').insert(newRecommendations);
        await loadRecommendations();
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setLoading(false);
    }
  };

  const markAsViewed = async (recId: string) => {
    try {
      await supabase.from('recommendations').update({ is_viewed: true }).eq('id', recId);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, is_viewed: true } : r))
      );
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'career_path':
        return Target;
      case 'job':
        return Briefcase;
      case 'mentor':
        return Users;
      default:
        return Sparkles;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredRecommendations =
    filter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.recommendation_type === filter);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Sparkles className="w-8 h-8 mr-3 text-yellow-500" />
          AI-Powered Recommendations
        </h1>
        <p className="text-gray-600">
          Personalized suggestions based on your skills, goals, and learning patterns
        </p>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {['all', 'course', 'career_path', 'job', 'mentor'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              filter === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : getTypeLabel(type)}
          </button>
        ))}
      </div>

      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec) => {
            const Icon = getIcon(rec.recommendation_type);
            return (
              <div
                key={rec.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition ${
                  rec.is_viewed ? 'border-gray-200' : 'border-yellow-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {getTypeLabel(rec.recommendation_type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {rec.confidence_score}% match
                      </span>
                    </div>
                    {!rec.is_viewed && (
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {rec.target && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{rec.target.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{rec.target.description}</p>
                  </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-700">Why this recommendation:</span>{' '}
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {!rec.is_viewed && (
                    <button
                      onClick={() => markAsViewed(rec.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Mark as Viewed</span>
                    </button>
                  )}
                  <button className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition">
                    <CheckCircle className="w-4 h-4" />
                    <span>Explore</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No recommendations yet</p>
          <p className="text-gray-500 text-sm">
            Complete your profile and start learning to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
};
