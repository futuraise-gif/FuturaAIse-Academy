import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../config/api';

// Assignment Detail Page
interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  grading_rubric?: string;
  available_from: string;
  due_date: string;
  available_until?: string;
  allow_late_submissions: boolean;
  late_penalty_per_day?: number;
  max_attempts: number;
  allowed_file_types: string[];
  max_file_size_mb: number;
  require_file_submission: boolean;
  allow_text_submission: boolean;
  status: string;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  attempt_number: number;
  text_submission?: string;
  files: any[];
  submitted_at: string;
  is_late: boolean;
  days_late?: number;
  status: string;
  grade?: number;
  adjusted_grade?: number;
  feedback?: string;
  graded_at?: string;
}

export default function AssignmentDetail() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [textSubmission, setTextSubmission] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchAssignmentDetails = useCallback(async () => {
    console.log('=== FETCH START ===');
    console.log('Fetching assignment details:', { courseId, assignmentId });
    let fetchedAssignment = null;
    try {
      setLoading(true);

      // Fetch assignment details
      const assignmentRes = await api.get(`/assignments/${courseId}/${assignmentId}`);
      console.log('=== ASSIGNMENT RESPONSE ===');
      console.log('Status:', assignmentRes.status);
      console.log('Data:', JSON.stringify(assignmentRes.data, null, 2));
      fetchedAssignment = assignmentRes.data;
      setAssignment(assignmentRes.data);

      // Fetch student's submission if exists
      try {
        const submissionRes = await api.get(`/assignments/${courseId}/${assignmentId}/my-submission`);
        console.log('=== SUBMISSION RESPONSE ===');
        console.log('Submission data:', JSON.stringify(submissionRes.data, null, 2));
        setSubmission(submissionRes.data);
        if (submissionRes.data?.text_submission) {
          setTextSubmission(submissionRes.data.text_submission);
        }
      } catch (error) {
        console.log('No submission found (expected for first time)');
        setSubmission(null);
      }
    } catch (error: any) {
      console.error('=== ERROR FETCHING ===', error);
      alert('Failed to load assignment details: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETE ===');
      console.log('Assignment state will be:', fetchedAssignment);
    }
  }, [courseId, assignmentId]);

  useEffect(() => {
    console.log('=== useEffect triggered ===', { courseId, assignmentId });
    if (courseId && assignmentId) {
      fetchAssignmentDetails();
    }
  }, [courseId, assignmentId, fetchAssignmentDetails]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate file types
      if (assignment?.allowed_file_types && assignment.allowed_file_types.length > 0) {
        const invalidFiles = files.filter(file => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          return !assignment.allowed_file_types.includes(ext || '');
        });

        if (invalidFiles.length > 0) {
          alert(`Invalid file types. Allowed types: ${assignment.allowed_file_types.join(', ')}`);
          return;
        }
      }

      // Validate file sizes
      const maxSizeMB = assignment?.max_file_size_mb || 10;
      const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);

      if (oversizedFiles.length > 0) {
        alert(`Some files exceed the maximum size of ${maxSizeMB}MB`);
        return;
      }

      setSelectedFiles(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textSubmission.trim() && selectedFiles.length === 0) {
      alert('Please provide a text submission or upload files');
      return;
    }

    if (assignment?.require_file_submission && selectedFiles.length === 0) {
      alert('File submission is required for this assignment');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('text_submission', textSubmission);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await api.post(`/assignments/${courseId}/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Assignment submitted successfully!');
      setTextSubmission('');
      setSelectedFiles([]);
      fetchAssignmentDetails();
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days until due`;
  };

  console.log('=== RENDER ===', { loading, assignment: assignment ? 'exists' : 'null' });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading assignment...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    console.log('Rendering not found state');
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
          <button
            onClick={() => navigate('/assignments')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Assignments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  console.log('Rendering assignment detail:', assignment.title);

  const isOverdue = new Date(assignment.due_date) < new Date();
  const canSubmit = !submission || (assignment.max_attempts > (submission?.attempt_number || 0));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/assignments')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center gap-2"
          >
            ← Back to Assignments
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{assignment.points} points</span>
            <span>•</span>
            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{assignment.description}</p>

          {assignment.instructions && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{assignment.instructions}</p>
            </>
          )}

          {assignment.grading_rubric && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Grading Rubric</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.grading_rubric}</p>
            </>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Submission Requirements</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Max attempts: {assignment.max_attempts}</li>
              {assignment.allow_late_submissions && (
                <li>Late submissions allowed{assignment.late_penalty_per_day && ` (${assignment.late_penalty_per_day}% penalty per day)`}</li>
              )}
              {assignment.require_file_submission && assignment.allowed_file_types && (
                <li>File types: {assignment.allowed_file_types.join(', ')}</li>
              )}
              {assignment.allow_text_submission && <li>Text submission allowed</li>}
            </ul>
          </div>
        </div>

        {/* Submission Status */}
        {submission && submission.status && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="text-gray-900">{new Date(submission.submitted_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attempt:</span>
                <span className="text-gray-900">{submission.attempt_number} of {assignment.max_attempts}</span>
              </div>
              {submission.is_late && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Late:</span>
                  <span className="text-red-600">{submission.days_late} days</span>
                </div>
              )}
              {submission.grade !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade:</span>
                    <span className="text-gray-900 font-semibold">
                      {submission.adjusted_grade || submission.grade} / {assignment.points}
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Instructor Feedback</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Submission Form */}
        {canSubmit && !isOverdue && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {submission ? 'Resubmit Assignment' : 'Submit Assignment'}
            </h2>
            <form onSubmit={handleSubmit}>
              {assignment.allow_text_submission && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Submission
                  </label>
                  <textarea
                    value={textSubmission}
                    onChange={(e) => setTextSubmission(e.target.value)}
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your submission here..."
                    required={!assignment.require_file_submission && !assignment.allow_text_submission}
                  />
                </div>
              )}

              {assignment.require_file_submission && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files {assignment.require_file_submission && <span className="text-red-600">*</span>}
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept={assignment.allowed_file_types?.map(type => `.${type}`).join(',')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={assignment.require_file_submission}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Selected files:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedFiles.map((file, index) => (
                          <li key={index}>
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assignment.allowed_file_types && assignment.allowed_file_types.length > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Allowed file types: {assignment.allowed_file_types.join(', ')}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum file size: {assignment.max_file_size_mb}MB
                  </p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/assignments')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isOverdue && !assignment.allow_late_submissions && !submission && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-semibold">This assignment is overdue and late submissions are not allowed.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
