import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/config/api';

interface Assignment {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  status: string;
  submission_type: string;
  allow_late_submission: boolean;
  submission_status: string | null;
  submission_grade: number | null;
  submitted_at: string | null;
}

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments');
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatusBadge = (assignment: Assignment) => {
    if (assignment.submission_status === 'graded') {
      return (
        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 font-medium">
          Graded {assignment.submission_grade !== null ? `(${assignment.submission_grade}/${assignment.total_points})` : ''}
        </span>
      );
    }
    if (assignment.submission_status === 'submitted') {
      return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium">Submitted</span>;
    }
    return null;
  };

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const isOverdue = dueDate < now;

    if (isOverdue && !assignment.allow_late_submission) {
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Overdue</span>;
    }
    if (isOverdue) {
      return <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">Late Allowed</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Open</span>;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading assignments...</div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !assignment.submission_status;
    if (filter === 'submitted') return assignment.submission_status === 'submitted';
    if (filter === 'graded') return assignment.submission_status === 'graded';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'submitted'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilter('graded')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'graded'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Graded
            </button>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">
              Assignments from your enrolled courses will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer"
                onClick={() => navigate(`/assignments/${assignment.course_id}/${assignment.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      {getSubmissionStatusBadge(assignment)}
                      {getStatusBadge(assignment)}
                    </div>
                    <p className="text-sm text-indigo-600 mb-2">{assignment.course_title}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-sm text-gray-500 mb-1">
                      {getDaysUntilDue(assignment.due_date)}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {assignment.total_points} pts
                    </div>
                    {assignment.submitted_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {assignment.submission_type}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assignments/${assignment.course_id}/${assignment.id}`);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
