import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/config/api';

interface SubmissionFile {
  name: string;
  size: number;
  type: string;
  url: string;
  storage_path: string;
  uploaded_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_number: string;
  attempt_number: number;
  text_submission?: string;
  files: SubmissionFile[];
  submitted_at: string;
  is_late: boolean;
  days_late?: number;
  status: string;
  grade?: number;
  adjusted_grade?: number;
  feedback?: string;
  graded_at?: string;
}

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  points: number;
  due_date: string;
  grading_rubric?: string;
  status: string;
}

export default function AssignmentSubmissions() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);

  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: '',
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (courseId && assignmentId) {
      fetchAssignmentAndSubmissions();
    }
  }, [courseId, assignmentId]);

  const fetchAssignmentAndSubmissions = async () => {
    if (!courseId || !assignmentId) return;

    try {
      setLoading(true);

      // Fetch assignment details
      const assignmentRes = await api.get(`/assignments/${courseId}/${assignmentId}`);
      setAssignment(assignmentRes.data);

      // Fetch all submissions
      const submissionsRes = await api.get(`/assignments/${courseId}/${assignmentId}/submissions`);
      setSubmissions(submissionsRes.data.submissions || submissionsRes.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load assignment submissions: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade || 0,
      feedback: submission.feedback || '',
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !courseId || !assignmentId) return;

    const grade = parseFloat(gradeData.grade.toString());
    if (isNaN(grade) || grade < 0 || grade > (assignment?.points || 100)) {
      alert(`Grade must be between 0 and ${assignment?.points || 100}`);
      return;
    }

    try {
      await api.post(
        `/assignments/${courseId}/${assignmentId}/submissions/${selectedSubmission.student_id}/grade`,
        {
          grade,
          feedback: gradeData.feedback,
        }
      );

      setShowGradeModal(false);
      setSelectedSubmission(null);
      fetchAssignmentAndSubmissions();
      alert('Submission graded successfully');
    } catch (error: any) {
      console.error('Failed to grade submission:', error);
      alert('Failed to grade submission: ' + (error.response?.data?.error || error.message));
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // Extract just the filename from the URL (e.g., "/uploads/12345-file.pdf" -> "12345-file.pdf")
      const filename = fileUrl.split('/').pop() || fileName;

      const response = await api.get(fileUrl, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'not_submitted': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'late': 'bg-yellow-100 text-yellow-800',
      'graded': 'bg-green-100 text-green-800',
      'returned': 'bg-purple-100 text-purple-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      submission.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.student_number && submission.student_number.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status !== 'not_submitted').length,
    graded: submissions.filter((s) => s.status === 'graded' || s.status === 'returned').length,
    pending: submissions.filter((s) => s.status === 'submitted' || s.status === 'late').length,
    averageGrade: submissions
      .filter((s) => s.grade !== undefined && s.grade !== null)
      .reduce((acc, s) => acc + (s.grade || 0), 0) / Math.max(1, submissions.filter((s) => s.grade !== undefined && s.grade !== null).length),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading submissions...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Assignment not found</p>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Course
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="text-blue-600 hover:underline mb-4 flex items-center gap-1"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-600 mt-1">{assignment.description}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-gray-600">
              Due: <span className="font-medium">{formatDate(assignment.due_date)}</span>
            </span>
            <span className="text-gray-600">
              Points: <span className="font-medium">{assignment.points}</span>
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Graded</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.graded}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Average Grade</p>
            <p className={`text-2xl font-bold mt-1 ${getGradeColor(stats.averageGrade, assignment.points)}`}>
              {stats.averageGrade.toFixed(1)}/{assignment.points}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or student number..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Submissions</option>
                <option value="submitted">Submitted</option>
                <option value="late">Late</option>
                <option value="graded">Graded</option>
                <option value="returned">Returned</option>
                <option value="not_submitted">Not Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.student_name}</div>
                          <div className="text-sm text-gray-500">{submission.student_email}</div>
                          {submission.student_number && (
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              ID: {submission.student_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.submitted_at ? formatDate(submission.submitted_at) : '-'}
                        </div>
                        {submission.is_late && submission.days_late && (
                          <div className="text-xs text-red-600">{submission.days_late} days late</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.grade !== undefined && submission.grade !== null ? (
                          <div>
                            <span className={`text-sm font-bold ${getGradeColor(submission.grade, assignment.points)}`}>
                              {submission.grade}/{assignment.points}
                            </span>
                            {submission.adjusted_grade !== undefined && submission.adjusted_grade !== submission.grade && (
                              <div className="text-xs text-gray-500">
                                Adjusted: {submission.adjusted_grade}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.attempt_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.status !== 'not_submitted' ? (
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View & Grade
                          </button>
                        ) : (
                          <span className="text-gray-400">No submission</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Modal */}
        {showGradeModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
              <div className="p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Grade Submission</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedSubmission.student_name} - Attempt {selectedSubmission.attempt_number}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowGradeModal(false);
                      setSelectedSubmission(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Submission Details */}
                <div className="space-y-6">
                  {/* Submission Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedSubmission.submitted_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(selectedSubmission.status)}`}>
                          {selectedSubmission.status.replace('_', ' ')}
                        </span>
                      </div>
                      {selectedSubmission.is_late && (
                        <div>
                          <span className="text-gray-500">Days Late:</span>
                          <span className="ml-2 font-medium text-red-600">{selectedSubmission.days_late}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Attempt:</span>
                        <span className="ml-2 font-medium">{selectedSubmission.attempt_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Text Submission */}
                  {selectedSubmission.text_submission && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Text Submission</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.text_submission}</p>
                      </div>
                    </div>
                  )}

                  {/* File Submissions */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Submitted Files ({selectedSubmission.files.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-3xl">📄</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>{file.type}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.url, file.name)}
                              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grading Rubric */}
                  {assignment.grading_rubric && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Grading Rubric</h3>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">{assignment.grading_rubric}</p>
                      </div>
                    </div>
                  )}

                  {/* Grade Form */}
                  <form onSubmit={handleGradeSubmission} className="border-t pt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade (out of {assignment.points}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max={assignment.points}
                          step="0.5"
                          value={gradeData.grade}
                          onChange={(e) => setGradeData({ ...gradeData, grade: parseFloat(e.target.value) })}
                          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Percentage: {((gradeData.grade / assignment.points) * 100).toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </label>
                        <textarea
                          value={gradeData.feedback}
                          onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Provide feedback to the student..."
                        />
                      </div>

                      {/* Previous Grade Info */}
                      {selectedSubmission.grade !== undefined && selectedSubmission.grade !== null && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Previous Grade:</span> {selectedSubmission.grade}/{assignment.points}
                          </p>
                          {selectedSubmission.feedback && (
                            <p className="text-sm text-yellow-800 mt-2">
                              <span className="font-semibold">Previous Feedback:</span> {selectedSubmission.feedback}
                            </p>
                          )}
                          {selectedSubmission.graded_at && (
                            <p className="text-xs text-yellow-600 mt-2">
                              Graded on {formatDate(selectedSubmission.graded_at)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowGradeModal(false);
                            setSelectedSubmission(null);
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
