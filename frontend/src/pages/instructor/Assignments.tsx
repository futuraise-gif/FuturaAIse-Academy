import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { assignmentService, courseService } from '@/services/instructorService';
import {
  Assignment,
  AssignmentStatus,
  FileType,
  Course
} from '@/types/instructor.types';

interface CreateAssignmentDTO {
  course_id: string;
  title: string;
  description: string;
  instructions: string;
  grading_rubric: string;
  points: number;
  available_from: string;
  due_date: string;
  available_until: string;
  allow_late_submissions: boolean;
  late_penalty_per_day: number;
  max_attempts: number;
  allowed_file_types: FileType[];
  max_file_size_mb: number;
  require_file_submission: boolean;
  allow_text_submission: boolean;
}

export default function Assignments() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [formData, setFormData] = useState<CreateAssignmentDTO>({
    course_id: '',
    title: '',
    description: '',
    instructions: '',
    grading_rubric: '',
    points: 100,
    available_from: new Date().toISOString().slice(0, 16),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    available_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    allow_late_submissions: true,
    late_penalty_per_day: 10,
    max_attempts: 3,
    allowed_file_types: [FileType.PDF, FileType.DOCX],
    max_file_size_mb: 10,
    require_file_submission: true,
    allow_text_submission: true,
  });

  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<FileType>>(
    new Set([FileType.PDF, FileType.DOCX])
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssignments();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getInstructorCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const data = await assignmentService.getCourseAssignments(selectedCourseId);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        course_id: selectedCourseId,
        allowed_file_types: Array.from(selectedFileTypes),
      };

      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment.id, dataToSubmit);
      } else {
        await assignmentService.createAssignment(dataToSubmit);
      }

      setShowCreateModal(false);
      setEditingAssignment(null);
      fetchAssignments();
      resetForm();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Failed to save assignment');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      course_id: assignment.course_id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || '',
      grading_rubric: assignment.grading_rubric || '',
      points: assignment.points,
      available_from: new Date(assignment.available_from).toISOString().slice(0, 16),
      due_date: new Date(assignment.due_date).toISOString().slice(0, 16),
      available_until: assignment.available_until
        ? new Date(assignment.available_until).toISOString().slice(0, 16)
        : '',
      allow_late_submissions: assignment.allow_late_submissions,
      late_penalty_per_day: assignment.late_penalty_per_day || 0,
      max_attempts: assignment.max_attempts,
      allowed_file_types: assignment.allowed_file_types,
      max_file_size_mb: assignment.max_file_size_mb,
      require_file_submission: assignment.require_file_submission,
      allow_text_submission: assignment.allow_text_submission,
    });
    setSelectedFileTypes(new Set(assignment.allowed_file_types));
    setShowCreateModal(true);
  };

  const handlePublish = async (assignmentId: string) => {
    if (!confirm('Publish this assignment? Students will be able to see and submit.')) return;
    try {
      await assignmentService.publishAssignment(assignmentId);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to publish assignment:', error);
      alert('Failed to publish assignment');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Delete this assignment? This action cannot be undone.')) return;
    try {
      await assignmentService.deleteAssignment(assignmentId);
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to delete assignment:', error);
      alert(error.response?.data?.error || 'Failed to delete assignment');
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      title: '',
      description: '',
      instructions: '',
      grading_rubric: '',
      points: 100,
      available_from: new Date().toISOString().slice(0, 16),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      available_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      allow_late_submissions: true,
      late_penalty_per_day: 10,
      max_attempts: 3,
      allowed_file_types: [FileType.PDF, FileType.DOCX],
      max_file_size_mb: 10,
      require_file_submission: true,
      allow_text_submission: true,
    });
    setSelectedFileTypes(new Set([FileType.PDF, FileType.DOCX]));
  };

  const toggleFileType = (fileType: FileType) => {
    const newTypes = new Set(selectedFileTypes);
    if (newTypes.has(fileType)) {
      newTypes.delete(fileType);
    } else {
      newTypes.add(fileType);
    }
    setSelectedFileTypes(newTypes);
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const colors = {
      [AssignmentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [AssignmentStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [AssignmentStatus.CLOSED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors[AssignmentStatus.DRAFT];
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && courses.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading assignments...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-1">Create and manage course assignments</p>
          </div>
          <button
            onClick={() => {
              setEditingAssignment(null);
              setShowCreateModal(true);
            }}
            disabled={!selectedCourseId}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            + Create Assignment
          </button>
        </div>

        {/* Course Selector */}
        {courses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assignments List */}
        {!selectedCourseId ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No course selected</h3>
            <p className="text-gray-600 mb-6">Create a course first or select one to manage assignments</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-6">Create your first assignment for this course</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(assignment.status)}`}>
                          {assignment.status}
                        </span>
                        {isOverdue(assignment.due_date) && assignment.status === AssignmentStatus.PUBLISHED && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{assignment.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500">Points</p>
                      <p className="text-lg font-semibold text-gray-900">{assignment.points}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submissions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {assignment.total_submissions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Graded</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {assignment.graded_submissions || 0}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Available:</span>
                      <span className="text-gray-900 font-medium">{formatDate(assignment.available_from)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Due:</span>
                      <span className={`font-medium ${isOverdue(assignment.due_date) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(assignment.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Max {assignment.max_attempts} attempts
                    </span>
                    {assignment.allow_late_submissions && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Late: -{assignment.late_penalty_per_day}%/day
                      </span>
                    )}
                    {assignment.require_file_submission && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        File required
                      </span>
                    )}
                    {assignment.allow_text_submission && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Text allowed
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/instructor/courses/${assignment.course_id}/assignments/${assignment.id}/submissions`)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      View Submissions ({assignment.total_submissions || 0})
                    </button>
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </button>
                    {assignment.status === AssignmentStatus.DRAFT && (
                      <button
                        onClick={() => handlePublish(assignment.id)}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
              <div className="p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingAssignment(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateAssignment} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Build a Neural Network from Scratch"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the assignment..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed instructions for students..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grading Rubric
                      </label>
                      <textarea
                        value={formData.grading_rubric}
                        onChange={(e) => setFormData({ ...formData, grading_rubric: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Grading criteria and rubric..."
                      />
                    </div>
                  </div>

                  {/* Dates and Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attempts *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.max_attempts}
                        onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available From *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.available_from}
                        onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Until
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.available_until}
                        onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Late Submission Settings */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="allow_late"
                        checked={formData.allow_late_submissions}
                        onChange={(e) => setFormData({ ...formData, allow_late_submissions: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="allow_late" className="text-sm font-medium text-gray-700">
                        Allow Late Submissions
                      </label>
                    </div>

                    {formData.allow_late_submissions && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Late Penalty (% per day)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.late_penalty_per_day}
                          onChange={(e) => setFormData({ ...formData, late_penalty_per_day: parseInt(e.target.value) })}
                          className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submission Type */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Submission Type</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="require_file"
                          checked={formData.require_file_submission}
                          onChange={(e) => setFormData({ ...formData, require_file_submission: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="require_file" className="text-sm text-gray-700">
                          Require File Submission
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allow_text"
                          checked={formData.allow_text_submission}
                          onChange={(e) => setFormData({ ...formData, allow_text_submission: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="allow_text" className="text-sm text-gray-700">
                          Allow Text Submission
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Settings */}
                  {formData.require_file_submission && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">File Upload Settings</h3>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.max_file_size_mb}
                          onChange={(e) => setFormData({ ...formData, max_file_size_mb: parseInt(e.target.value) })}
                          className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allowed File Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.values(FileType).map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                                selectedFileTypes.has(type)
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFileTypes.has(type)}
                                onChange={() => toggleFileType(type)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm font-medium">{type.toUpperCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingAssignment(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
