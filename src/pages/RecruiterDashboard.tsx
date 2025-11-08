import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';

type JobPosting = {
  id: string;
  title: string;
  location: string;
  job_type: string;
  status: string;
  applications_count: number;
  views_count: number;
  created_at: string;
  salary_min?: number;
  salary_max?: number;
};

type Application = {
  id: string;
  user_id: string;
  status: string;
  match_score: number;
  applied_at: string;
  profile?: {
    full_name: string;
    job_title: string;
  };
  job?: {
    title: string;
  };
};

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    avgMatchScore: 0,
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
      const [jobsData, appsData] = await Promise.all([
        supabase
          .from('job_postings')
          .select('*')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('job_applications')
          .select('*, profile:profiles(full_name, job_title), job:job_postings!inner(title, recruiter_id)')
          .eq('job.recruiter_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(10),
      ]);

      setJobs(jobsData.data || []);
      setApplications(appsData.data || []);

      const activeJobs = jobsData.data?.filter((j) => j.status === 'open').length || 0;
      const totalApps = appsData.data?.length || 0;
      const shortlisted =
        appsData.data?.filter((a) => a.status === 'shortlisted' || a.status === 'interview')
          .length || 0;
      const avgScore =
        totalApps > 0
          ? appsData.data!.reduce((sum, app) => sum + app.match_score, 0) / totalApps
          : 0;

      setStats({
        activeJobs,
        totalApplications: totalApps,
        shortlisted,
        avgMatchScore: avgScore,
      });
    } catch (error) {
      console.error('Error loading recruiter dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appId);

      if (error) throw error;
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating application:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-600">Manage job postings and review applications</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md">
          <Plus className="w-5 h-5" />
          <span>Post Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.activeJobs}</span>
          </div>
          <p className="text-gray-600 font-medium">Active Jobs</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalApplications}</span>
          </div>
          <p className="text-gray-600 font-medium">Applications</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.shortlisted}</span>
          </div>
          <p className="text-gray-600 font-medium">Shortlisted</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.avgMatchScore.toFixed(0)}%
            </span>
          </div>
          <p className="text-gray-600 font-medium">Avg Match Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="capitalize">{job.job_type}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : job.status === 'closed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span>
                        <Users className="w-4 h-4 inline mr-1" />
                        {job.applications_count} applicants
                      </span>
                      <span>
                        <Eye className="w-4 h-4 inline mr-1" />
                        {job.views_count} views
                      </span>
                    </div>
                    {job.salary_min && (
                      <span className="text-green-600 font-medium">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No job postings yet</p>
              <p className="text-sm mt-1">Create your first job posting to find candidates</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{app.profile?.full_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{app.profile?.job_title}</p>
                      <p className="text-xs text-gray-500 mt-1">Applied to: {app.job?.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        {app.match_score}% match
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'shortlisted'
                            ? 'bg-green-100 text-green-700'
                            : app.status === 'interview'
                            ? 'bg-blue-100 text-blue-700'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Shortlist</span>
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'rejected')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No applications yet</p>
              <p className="text-sm mt-1">Applications will appear here once candidates apply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
