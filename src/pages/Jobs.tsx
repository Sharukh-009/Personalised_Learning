import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Send,
  CheckCircle,
} from 'lucide-react';

type JobPosting = {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  remote_allowed: boolean;
  application_deadline?: string;
  recruiter_profile?: {
    company_name: string;
    industry: string;
  };
};

type UserApplication = {
  job_id: string;
  status: string;
  match_score: number;
};

export const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [userApplications, setUserApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRemote, setFilterRemote] = useState<boolean | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        supabase
          .from('job_postings')
          .select('*, recruiter_profile:recruiter_profiles!inner(company_name, industry)')
          .eq('status', 'open')
          .order('created_at', { ascending: false }),
        user
          ? supabase.from('job_applications').select('job_id, status, match_score').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setJobs(jobsData.data || []);
      setUserApplications(appsData.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (jobId: string) => {
    return userApplications.some((app) => app.job_id === jobId);
  };

  const getApplicationStatus = (jobId: string) => {
    const app = userApplications.find((app) => app.job_id === jobId);
    return app?.status;
  };

  const applyToJob = async () => {
    if (!user || !selectedJob) return;

    try {
      const { error } = await supabase.from('job_applications').insert({
        job_id: selectedJob.id,
        user_id: user.id,
        cover_letter: coverLetter,
        status: 'pending',
        match_score: Math.floor(Math.random() * 30) + 70,
      });

      if (error) throw error;

      await supabase
        .from('job_postings')
        .update({ applications_count: (selectedJob as any).applications_count + 1 })
        .eq('id', selectedJob.id);

      await loadJobs();
      setShowApplicationModal(false);
      setCoverLetter('');
      setSelectedJob(null);
    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(error.message || 'Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.recruiter_profile?.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || job.job_type === filterType;
    const matchesRemote = filterRemote === null || job.remote_allowed === filterRemote;

    return matchesSearch && matchesType && matchesRemote;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
        <p className="text-gray-600">Find the perfect role to advance your career</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <select
              value={filterRemote === null ? 'all' : filterRemote ? 'remote' : 'onsite'}
              onChange={(e) =>
                setFilterRemote(e.target.value === 'all' ? null : e.target.value === 'remote')
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.map((job) => {
          const applied = hasApplied(job.id);
          const status = getApplicationStatus(job.id);

          return (
            <div
              key={job.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition ${
                applied ? 'border-green-400' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                      <p className="text-sm text-gray-600">{job.recruiter_profile?.company_name}</p>
                    </div>
                  </div>
                </div>
                {applied && (
                  <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 capitalize">{status}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.remote_allowed ? 'Remote' : job.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="capitalize">{job.experience_level}</span>
                </div>
                {job.salary_min && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {job.recruiter_profile?.industry} Industry
                </span>
                {!applied ? (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplicationModal(true);
                    }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply Now</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center space-x-2 bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No jobs found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500">
              <h2 className="text-2xl font-bold text-white">Apply to {selectedJob.title}</h2>
              <p className="text-blue-100 mt-1">{selectedJob.recruiter_profile?.company_name}</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit for this role..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-blue-700">Tip:</span> Highlight your relevant
                  skills and experience that match the job requirements.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setCoverLetter('');
                    setSelectedJob(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={applyToJob}
                  disabled={!coverLetter.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
