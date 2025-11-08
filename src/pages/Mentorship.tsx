import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Star, Calendar, MessageCircle, CheckCircle, Plus, Search } from 'lucide-react';

type EducatorProfile = {
  id: string;
  user_id: string;
  expertise_areas: string[];
  teaching_experience_years: number;
  hourly_rate: number;
  rating: number;
  total_students: number;
  bio: string;
  profile?: {
    full_name: string;
    job_title: string;
  };
};

type Mentorship = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  focus_area: string;
  status: string;
  sessions_completed: number;
  next_session_date?: string;
  mentor_profile?: {
    full_name: string;
    job_title: string;
  };
  mentee_profile?: {
    full_name: string;
    job_title: string;
  };
};

export const Mentorship = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<EducatorProfile[]>([]);
  const [myMentorships, setMyMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<EducatorProfile | null>(null);
  const [focusArea, setFocusArea] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [mentorsData, mentorshipsData] = await Promise.all([
        supabase
          .from('educator_profiles')
          .select('*, profile:profiles!inner(full_name, job_title)')
          .gte('rating', 3.5)
          .order('rating', { ascending: false })
          .limit(12),
        supabase
          .from('mentorships')
          .select(
            '*, mentor_profile:profiles!mentorships_mentor_id_fkey(full_name, job_title), mentee_profile:profiles!mentorships_mentee_id_fkey(full_name, job_title)'
          )
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
          .eq('status', 'active'),
      ]);

      setMentors(mentorsData.data || []);
      setMyMentorships(mentorshipsData.data || []);
    } catch (error) {
      console.error('Error loading mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestMentorship = async () => {
    if (!user || !selectedMentor || !focusArea.trim()) return;

    try {
      const { error } = await supabase.from('mentorships').insert({
        mentor_id: selectedMentor.user_id,
        mentee_id: user.id,
        focus_area: focusArea,
        status: 'pending',
      });

      if (error) throw error;

      await loadData();
      setShowRequestModal(false);
      setFocusArea('');
      setSelectedMentor(null);
    } catch (error: any) {
      console.error('Error requesting mentorship:', error);
      alert(error.message || 'Failed to send mentorship request');
    }
  };

  const hasMentorship = (mentorId: string) => {
    return myMentorships.some(
      (m) => (m.mentor_id === mentorId || m.mentee_id === mentorId) && m.status === 'active'
    );
  };

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.profile?.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise_areas.some((area) => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
        <p className="text-gray-600">
          Connect with experienced professionals to accelerate your career growth
        </p>
      </div>

      {myMentorships.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Mentorships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myMentorships.map((mentorship) => {
              const isMentor = mentorship.mentor_id === user?.id;
              const otherPerson = isMentor
                ? mentorship.mentee_profile
                : mentorship.mentor_profile;

              return (
                <div
                  key={mentorship.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{otherPerson?.full_name}</h3>
                      <p className="text-xs text-gray-600">{otherPerson?.job_title}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Focus:</span> {mentorship.focus_area}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {mentorship.sessions_completed} sessions
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search mentors by name, role, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => {
            const alreadyConnected = hasMentorship(mentor.user_id);

            return (
              <div
                key={mentor.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {mentor.profile?.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{mentor.profile?.full_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{mentor.profile?.job_title}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {mentor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({mentor.total_students} students)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{mentor.bio}</p>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise_areas.slice(0, 3).map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-green-600">
                    ${mentor.hourly_rate}/hour
                  </span>
                  {alreadyConnected ? (
                    <button
                      disabled
                      className="flex items-center space-x-1 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Connected</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestModal(true);
                      }}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No mentors found</p>
          </div>
        )}
      </div>

      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Request Mentorship</h2>
              <p className="text-gray-600 mt-1">
                Connect with {selectedMentor.profile?.full_name}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to focus on?
                </label>
                <textarea
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g., Career transition, technical skills, leadership development..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setFocusArea('');
                    setSelectedMentor(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={requestMentorship}
                  disabled={!focusArea.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
