import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CareerPath, Skill, UserCareerGoal } from '../lib/supabase';
import { Target, TrendingUp, Clock, DollarSign, CheckCircle, Plus } from 'lucide-react';

type CareerPathWithSkills = CareerPath & {
  required_skills?: Array<{ skill: Skill; importance_level: number }>;
};

export const CareerPaths = () => {
  const { user } = useAuth();
  const [careerPaths, setCareerPaths] = useState<CareerPathWithSkills[]>([]);
  const [userGoals, setUserGoals] = useState<UserCareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<CareerPathWithSkills | null>(null);

  useEffect(() => {
    loadCareerPaths();
  }, [user]);

  const loadCareerPaths = async () => {
    try {
      const [pathsData, goalsData] = await Promise.all([
        supabase.from('career_paths').select('*').order('level'),
        user
          ? supabase
              .from('user_career_goals')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active')
          : Promise.resolve({ data: [] }),
      ]);

      const pathsWithSkills = await Promise.all(
        (pathsData.data || []).map(async (path) => {
          const { data: skillsData } = await supabase
            .from('career_path_skills')
            .select('importance_level, skill:skills(*)')
            .eq('career_path_id', path.id)
            .order('importance_level', { ascending: false });

          return {
            ...path,
            required_skills: skillsData || [],
          };
        })
      );

      setCareerPaths(pathsWithSkills);
      setUserGoals(goalsData.data || []);
    } catch (error) {
      console.error('Error loading career paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (careerPathId: string) => {
    if (!user) return;

    try {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 12);

      const { error } = await supabase.from('user_career_goals').insert({
        user_id: user.id,
        career_path_id: careerPathId,
        target_date: targetDate.toISOString().split('T')[0],
        status: 'active',
      });

      if (error) throw error;
      await loadCareerPaths();
      setSelectedPath(null);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const hasGoal = (careerPathId: string) => {
    return userGoals.some((goal) => goal.career_path_id === careerPathId);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getImportanceStars = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Paths</h1>
        <p className="text-gray-600">
          Explore career opportunities and set your professional goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {careerPaths.map((path) => {
          const isGoal = hasGoal(path.id);
          return (
            <div
              key={path.id}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition ${
                isGoal ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{path.title}</h2>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                            path.level
                          )}`}
                        >
                          {path.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isGoal && (
                    <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Your Goal</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{path.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{path.estimated_duration_months} months</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{path.average_salary_range}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPath(path)}
                  className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 border-t border-gray-200 mt-4"
                >
                  View Required Skills
                </button>

                {!isGoal && (
                  <button
                    onClick={() => addGoal(path.id)}
                    className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Set as Goal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedPath.title}</h2>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}
                  >
                    {selectedPath.level}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Required Skills
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Build these skills to succeed in this career path
                </p>
              </div>

              <div className="space-y-4">
                {selectedPath.required_skills && selectedPath.required_skills.length > 0 ? (
                  selectedPath.required_skills.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.skill.name}</h4>
                          <p className="text-sm text-gray-600">{item.skill.description}</p>
                        </div>
                        <span className="text-yellow-500 text-lg ml-4">
                          {getImportanceStars(item.importance_level)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                          {item.skill.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Importance: {item.importance_level}/5
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No required skills listed yet</p>
                  </div>
                )}
              </div>

              {!hasGoal(selectedPath.id) && (
                <button
                  onClick={() => addGoal(selectedPath.id)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Set as Your Career Goal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
