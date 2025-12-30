import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { moduleService } from '@/services/instructorService';
import { Module } from '@/types/instructor.types';

interface Material {
  id?: string;
  title: string;
  url: string;
  type: string;
}

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    duration_minutes: 0,
  });
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialType, setMaterialType] = useState('pdf');

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      const moduleData = await moduleService.getModuleDetails(moduleId!);
      setModule(moduleData);
      setFormData({
        title: moduleData.title,
        description: moduleData.description,
        type: moduleData.type,
        duration_minutes: moduleData.duration_minutes || 0,
      });
    } catch (error) {
      console.error('Failed to fetch module details:', error);
      alert('Failed to load module details');
      navigate(`/instructor/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!moduleId) return;

    try {
      await moduleService.updateModule(moduleId, formData);
      setEditMode(false);
      fetchModuleDetails();
      alert('Module updated successfully!');
    } catch (error: any) {
      console.error('Failed to update module:', error);
      alert(error.response?.data?.error || 'Failed to update module');
    }
  };

  const handleAddMaterial = async () => {
    if (!moduleId || !materialTitle || !materialUrl) return;

    try {
      await moduleService.addMaterial(moduleId, {
        title: materialTitle,
        url: materialUrl,
        type: materialType,
      });
      setMaterialTitle('');
      setMaterialUrl('');
      setMaterialType('pdf');
      fetchModuleDetails();
      alert('Material added successfully!');
    } catch (error: any) {
      console.error('Failed to add material:', error);
      alert(error.response?.data?.error || 'Failed to add material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!moduleId || !confirm('Are you sure you want to delete this material?')) return;

    try {
      await moduleService.removeMaterial(moduleId, materialId);
      fetchModuleDetails();
      alert('Material deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      alert(error.response?.data?.error || 'Failed to delete material');
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

  if (!module) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Module not found</p>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}`)}
              className="text-gray-600 hover:text-gray-900 text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{module.title}</h1>
              <p className="text-gray-600 mt-1">Module Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm"
              >
                Edit Module
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      title: module.title,
                      description: module.description,
                      type: module.type,
                      duration_minutes: module.duration_minutes || 0,
                    });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 text-sm"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Module Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Information</h2>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="live_class">Live Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{module.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="text-gray-900 capitalize">{module.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-gray-900">{module.duration_minutes || 0} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="text-gray-900 capitalize">{module.status}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Learning Materials */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Materials</h2>

          {/* Add Material Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Material</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Material title (e.g., Lecture Slides)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="url"
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
                placeholder="Material URL (Google Drive, Dropbox, etc.)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
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
                  onClick={handleAddMaterial}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Add Material
                </button>
              </div>
            </div>
          </div>

          {/* Materials List */}
          {module.materials && module.materials.length > 0 ? (
            <div className="space-y-3">
              {module.materials.map((material: any, index: number) => (
                <div
                  key={material.id || index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {material.type === 'pdf' ? '📄' :
                           material.type === 'ppt' ? '📊' :
                           material.type === 'video' ? '🎥' :
                           material.type === 'document' ? '📝' : '🔗'}
                        </span>
                        <h3 className="text-base font-semibold text-gray-900">{material.title}</h3>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">{material.type}</span>
                      </div>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {material.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📚</p>
              <p>No materials added yet</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Materials</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {module.materials?.length || 0}
                </p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-base font-bold text-gray-900 mt-1 capitalize">{module.type}</p>
              </div>
              <div className="text-3xl">
                {module.type === 'lecture' ? '📖' :
                 module.type === 'lab' ? '🔬' :
                 module.type === 'assignment' ? '📝' :
                 module.type === 'quiz' ? '❓' : '🎥'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{module.duration_minutes || 0}m</p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-base font-bold text-gray-900 mt-1 capitalize">{module.status}</p>
              </div>
              <div className="text-3xl">
                {module.status === 'published' ? '✅' : '📝'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
