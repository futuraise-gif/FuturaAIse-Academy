import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { courseService, moduleService } from '@/services/instructorService';
import { Course, Module, CourseStatus } from '@/types/instructor.types';

interface ModuleFormData {
  title: string;
  description: string;
  type: string;
  order: number;
}

interface Material {
  title: string;
  url: string;
  type: string;
}

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleFormData, setModuleFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    type: 'lecture',
    order: 1,
  });
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialType, setMaterialType] = useState('pdf');
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseData, modulesData] = await Promise.all([
        courseService.getCourseDetails(courseId!),
        moduleService.getCourseModules(courseId!),
      ]);
      setCourse(courseData);
      setModules(modulesData || []);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      alert('Failed to load course details');
      navigate('/instructor/courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!course) return;
    if (!confirm('Are you sure you want to publish this course? It will be visible to students.')) return;

    try {
      await courseService.publishCourse(course.id);
      fetchCourseData();
      alert('Course published successfully!');
    } catch (error) {
      console.error('Failed to publish course:', error);
      alert('Failed to publish course');
    }
  };

  const handleEdit = () => {
    navigate(`/instructor/courses/${courseId}/edit`);
  };

  const handleAddModule = () => {
    setModuleFormData({
      title: '',
      description: '',
      type: 'lecture',
      order: modules.length + 1,
    });
    setMaterials([]);
    setMaterialTitle('');
    setMaterialUrl('');
    setMaterialType('pdf');
    setShowModuleModal(true);
  };

  const handleAddMaterial = () => {
    if (materialTitle && materialUrl) {
      setMaterials([...materials, { title: materialTitle, url: materialUrl, type: materialType }]);
      setMaterialTitle('');
      setMaterialUrl('');
      setMaterialType('pdf');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !course) return;

    try {
      const newModule = await moduleService.createModule({
        ...moduleFormData,
        course_id: courseId,
        program_id: course.program_id || '',
      });

      // Add materials if any
      if (materials.length > 0 && newModule.id) {
        for (const material of materials) {
          try {
            await moduleService.addMaterial(newModule.id, material);
          } catch (err) {
            console.error('Failed to add material:', err);
          }
        }
      }

      setShowModuleModal(false);
      fetchCourseData();
      alert('Module created successfully!');
    } catch (error: any) {
      console.error('Failed to create module:', error);
      alert(error.response?.data?.error || 'Failed to create module');
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleName: string) => {
    if (!confirm(`Are you sure you want to delete the module "${moduleName}"? This action cannot be undone.`)) return;

    try {
      await moduleService.deleteModule(moduleId);
      fetchCourseData();
      alert('Module deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete module:', error);
      alert(error.response?.data?.error || 'Failed to delete module');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Course not found</p>
          <button
            onClick={() => navigate('/instructor/courses')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Courses
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: CourseStatus) => {
    const colors = {
      [CourseStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [CourseStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [CourseStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors[CourseStatus.DRAFT];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/instructor/courses')}
              className="text-gray-600 hover:text-gray-900 text-2xl"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(course.status)}`}>
                  {course.status}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Course Management</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleEdit}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 text-sm"
            >
              Edit Course
            </button>
            {course.status === CourseStatus.DRAFT && (
              <button
                onClick={handlePublish}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 text-sm"
              >
                Publish Course
              </button>
            )}
          </div>
        </div>

        {/* Course Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Program</p>
              <p className="text-lg font-semibold text-gray-900">{course.program_title || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{course.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Students Enrolled</p>
              <p className="text-lg font-semibold text-gray-900">{course.student_count || 0}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-gray-900">{course.description}</p>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Prerequisites</p>
              <ul className="list-disc list-inside space-y-1">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-gray-900">{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Learning Objectives</p>
              <ul className="list-disc list-inside space-y-1">
                {course.learning_objectives.map((objective, index) => (
                  <li key={index} className="text-gray-900">{objective}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert('Module management is available below')}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Modules</h3>
              <p className="text-xs text-gray-600">{modules.length} module(s)</p>
            </button>

            <button
              onClick={() => navigate(`/instructor/assignments?course_id=${courseId}`)}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Assignments</h3>
              <p className="text-xs text-gray-600">Manage assignments</p>
            </button>

            <button
              onClick={() => navigate(`/instructor/attendance?course_id=${courseId}`)}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-2">✓</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Attendance</h3>
              <p className="text-xs text-gray-600">Track attendance</p>
            </button>

            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/grades`)}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Grades</h3>
              <p className="text-xs text-gray-600">Grade center</p>
            </button>
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Course Modules ({modules.length})
            </h2>
            <button
              onClick={handleAddModule}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              + Add Module
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600 mb-4">Add modules to organize your course content</p>
              <button
                onClick={handleAddModule}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Add First Module
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl font-bold text-gray-400 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/instructor/courses/${courseId}/modules/${module.id}`)}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id, module.title)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{modules.length}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{course.student_count || 0}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Course Order</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">#{course.order || 1}</p>
              </div>
              <div className="text-3xl">🔢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-base font-bold text-gray-900 mt-1 capitalize">{course.status}</p>
              </div>
              <div className="text-3xl">
                {course.status === CourseStatus.PUBLISHED ? '✅' : course.status === CourseStatus.DRAFT ? '📝' : '📦'}
              </div>
            </div>
          </div>
        </div>

        {/* Add Module Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Add New Module</h2>
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateModule} className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={moduleFormData.title}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Introduction to AI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={moduleFormData.description}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe this module..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Type *
                      </label>
                      <select
                        required
                        value={moduleFormData.type}
                        onChange={(e) => setModuleFormData({ ...moduleFormData, type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="lecture">Lecture</option>
                        <option value="lab">Lab</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="live_class">Live Class</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={moduleFormData.order}
                        onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Learning Materials (Optional)</h3>

                    <div className="space-y-3 mb-3">
                      <div>
                        <input
                          type="text"
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          placeholder="Material title (e.g., Lecture Slides)"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="url"
                          value={materialUrl}
                          onChange={(e) => setMaterialUrl(e.target.value)}
                          placeholder="Material URL (Google Drive, Dropbox, etc.)"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={materialType}
                          onChange={(e) => setMaterialType(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="pdf">PDF</option>
                          <option value="ppt">PowerPoint</option>
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="link">Link</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddMaterial}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {materials.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">Added Materials:</p>
                        {materials.map((material, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                              <p className="text-xs text-gray-500 truncate">{material.url}</p>
                            </div>
                            <span className="mx-2 text-xs bg-gray-200 px-2 py-1 rounded">{material.type}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModuleModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Create Module
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
