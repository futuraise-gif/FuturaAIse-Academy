import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { courseService, programService } from '@/services/instructorService';
import { Course, CourseStatus, Program } from '@/types/instructor.types';

interface CreateCourseDTO {
  title: string;
  description: string;
  program_id: string;
  thumbnail_url?: string;
  syllabus_url?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  order: number;
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('');
  const [formData, setFormData] = useState<CreateCourseDTO>({
    title: '',
    description: '',
    program_id: '',
    thumbnail_url: '',
    syllabus_url: '',
    prerequisites: [],
    learning_objectives: [],
    order: 1,
  });
  const [prerequisite, setPrerequisite] = useState('');
  const [objective, setObjective] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, programsData] = await Promise.all([
        courseService.getInstructorCourses(),
        programService.getPublishedPrograms(),
      ]);
      setCourses(coursesData);
      setPrograms(programsData);
      setError('');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.program_id) {
      setError('Please select a program');
      return;
    }

    try {
      await courseService.createCourse(formData);
      setShowCreateModal(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create course:', error);
      setError(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handlePublish = async (courseId: string) => {
    if (!confirm('Are you sure you want to publish this course? It will be visible to students.')) return;
    try {
      setError('');
      await courseService.publishCourse(courseId);
      fetchData();
    } catch (error: any) {
      console.error('Failed to publish course:', error);
      setError(error.response?.data?.error || 'Failed to publish course');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      setError('');
      await courseService.deleteCourse(courseId);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      setError(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      program_id: '',
      thumbnail_url: '',
      syllabus_url: '',
      prerequisites: [],
      learning_objectives: [],
      order: 1,
    });
    setPrerequisite('');
    setObjective('');
    setError('');
  };

  const addPrerequisite = () => {
    if (prerequisite.trim()) {
      setFormData({
        ...formData,
        prerequisites: [...(formData.prerequisites || []), prerequisite.trim()],
      });
      setPrerequisite('');
    }
  };

  const addObjective = () => {
    if (objective.trim()) {
      setFormData({
        ...formData,
        learning_objectives: [...(formData.learning_objectives || []), objective.trim()],
      });
      setObjective('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites?.filter((_, i) => i !== index),
    });
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      learning_objectives: formData.learning_objectives?.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: CourseStatus) => {
    const colors = {
      [CourseStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [CourseStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [CourseStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors[CourseStatus.DRAFT];
  };

  const filteredCourses = selectedProgramFilter
    ? courses.filter((course) => course.program_id === selectedProgramFilter)
    : courses;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading courses...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Create Course
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter by Program */}
        {programs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Program</label>
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedProgramFilter ? 'No courses in this program' : 'No courses yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedProgramFilter
                ? 'Create your first course for this program'
                : 'Create your first course to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(course.status)}`}>
                      {course.status}
                    </span>
                    <span className="text-xs text-gray-500">Order: {course.order}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm mb-4 inline-block">
                    {course.program_title}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500">Modules</p>
                      <p className="text-sm font-semibold text-gray-900">{course.module_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Students</p>
                      <p className="text-sm font-semibold text-gray-900">{course.student_count}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}`)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      View
                    </button>
                    {course.status === CourseStatus.DRAFT && (
                      <button
                        onClick={() => handlePublish(course.id)}
                        className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded text-sm font-medium hover:bg-yellow-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
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

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateCourse} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Introduction to Machine Learning"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the course content and objectives..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                    <select
                      required
                      value={formData.program_id}
                      onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus URL</label>
                      <input
                        type="url"
                        value={formData.syllabus_url}
                        onChange={(e) => setFormData({ ...formData, syllabus_url: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/syllabus.pdf"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Number *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Determines the display order within the program
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={prerequisite}
                        onChange={(e) => setPrerequisite(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add prerequisite and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addPrerequisite}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.prerequisites?.map((prereq, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {prereq}
                          <button
                            type="button"
                            onClick={() => removePrerequisite(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add learning objective and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addObjective}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.learning_objectives?.map((obj, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {obj}
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="text-blue-500 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
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
                      Create Course
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
