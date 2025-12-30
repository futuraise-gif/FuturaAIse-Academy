import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/config/api';

interface Module {
  id: string;
  title: string;
  description: string;
  type: string;
  duration_minutes: number;
  status: string;
  materials?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
}

export default function ModuleView() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      const response = await api.get(`/modules/${moduleId}`);
      setModule(response.data.module);
    } catch (error) {
      console.error('Failed to fetch module details:', error);
      alert('Failed to load module details');
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
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
            onClick={() => navigate(`/courses/${courseId}`)}
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{module.title}</h1>
            <p className="text-gray-600 mt-1">Learning Module</p>
          </div>
        </div>

        {/* Module Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">
              {module.type === 'lecture' ? '📖' :
               module.type === 'lab' ? '🔬' :
               module.type === 'assignment' ? '📝' :
               module.type === 'quiz' ? '❓' : '🎥'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium capitalize">
                  {module.type}
                </span>
                {module.duration_minutes > 0 && (
                  <span className="text-sm text-gray-600">⏱️ {module.duration_minutes} minutes</span>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">{module.description}</p>
            </div>
          </div>
        </div>

        {/* Learning Materials */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Learning Materials</h2>

          {module.materials && module.materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.materials.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-lg p-4 hover:shadow-lg transition-all hover:border-blue-500 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">
                      {material.type === 'pdf' ? '📄' :
                       material.type === 'ppt' ? '📊' :
                       material.type === 'video' ? '🎥' :
                       material.type === 'document' ? '📝' : '🔗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                      <p className="text-xs text-blue-600 mt-2 group-hover:underline">
                        Click to open →
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-600">No materials available for this module yet</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
            </div>
          )}
        </div>

        {/* Module Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-3">📋 Complete this module</h3>
          <p className="text-blue-100 mb-4">
            Make sure to review all the materials and complete any assigned tasks
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              Back to Course
            </button>
            <button
              onClick={() => alert('Module completion tracking - coming soon!')}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800"
            >
              Mark as Complete
            </button>
          </div>
        </div>

        {/* Additional Resources Tip */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Study Tip</h4>
              <p className="text-sm text-yellow-700">
                Download or bookmark the materials for offline access. Take notes while going through each resource for better retention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
