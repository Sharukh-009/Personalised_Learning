import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Skill, UserSkill } from '../lib/supabase';
import { TrendingUp, Plus, X, Search } from 'lucide-react';

export const Skills = () => {
  const { user } = useAuth();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<(UserSkill & { skill?: Skill })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSkills();
  }, [user]);

  const loadSkills = async () => {
    try {
      const [skillsData, userSkillsData] = await Promise.all([
        supabase.from('skills').select('*').order('name'),
        user
          ? supabase.from('user_skills').select('*, skill:skills(*)').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setAllSkills(skillsData.data || []);
      setUserSkills(userSkillsData.data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillId: string, proficiency: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_skills').insert({
        user_id: user.id,
        skill_id: skillId,
        proficiency_level: proficiency,
      });

      if (error) throw error;
      await loadSkills();
      setShowAddModal(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const updateSkillLevel = async (userSkillId: string, newLevel: number) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .update({ proficiency_level: newLevel, updated_at: new Date().toISOString() })
        .eq('id', userSkillId);

      if (error) throw error;
      await loadSkills();
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const removeSkill = async (userSkillId: string) => {
    try {
      const { error } = await supabase.from('user_skills').delete().eq('id', userSkillId);

      if (error) throw error;
      await loadSkills();
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const hasSkill = (skillId: string) => {
    return userSkills.some((us) => us.skill_id === skillId);
  };

  const categories = ['all', 'technical', 'soft', 'business'];

  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const notAlreadyAdded = !hasSkill(skill.id);
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  const groupedUserSkills = userSkills.reduce((acc, userSkill) => {
    const category = userSkill.skill?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(userSkill);
    return acc;
  }, {} as Record<string, (UserSkill & { skill?: Skill })[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'from-blue-500 to-cyan-500';
      case 'soft':
        return 'from-green-500 to-emerald-500';
      case 'business':
        return 'from-orange-500 to-amber-500';
      default:
        return 'from-gray-500 to-slate-500';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Skills</h1>
          <p className="text-gray-600">Track and develop your professional skills</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Skill</span>
        </button>
      </div>

      {userSkills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No skills tracked yet</p>
          <p className="text-gray-500 text-sm mb-6">Start tracking your skills to see your progress</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Skill</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedUserSkills).map(([category, skills]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize">{category} Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((userSkill) => (
                  <div
                    key={userSkill.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{userSkill.skill?.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{userSkill.skill?.description}</p>
                      </div>
                      <button
                        onClick={() => removeSkill(userSkill.id)}
                        className="text-gray-400 hover:text-red-500 transition ml-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Proficiency Level</span>
                        <span className="text-sm font-semibold text-blue-600">
                          Level {userSkill.proficiency_level}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateSkillLevel(userSkill.id, level)}
                            className={`flex-1 h-3 rounded-full transition ${
                              level <= userSkill.proficiency_level
                                ? `bg-gradient-to-r ${getCategoryColor(category)}`
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          ></button>
                        ))}
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add a Skill</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => addSkill(skill.id, level)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm font-medium"
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredSkills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No skills found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
