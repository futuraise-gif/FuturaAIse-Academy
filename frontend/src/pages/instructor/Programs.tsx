import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { programService } from '@/services/instructorService';
import { Program, ProgramLevel, ProgramStatus, CreateProgramDTO } from '@/types/instructor.types';

export default function Programs() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateProgramDTO>({
    title: '',
    description: '',
    level: ProgramLevel.BEGINNER,
    duration_weeks: 12,
    prerequisites: [],
    learning_outcomes: [],
  });
  const [prerequisite, setPrerequisite] = useState('');
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await programService.getInstructorPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await programService.createProgram(formData);
      setShowCreateModal(false);
      fetchPrograms();
      resetForm();
    } catch (error) {
      console.error('Failed to create program:', error);
      alert('Failed to create program');
    }
  };

  const handlePublish = async (programId: string) => {
    if (!confirm('Are you sure you want to publish this program? It will be visible to students.')) return;
    try {
      await programService.publishProgram(programId);
      fetchPrograms();
    } catch (error) {
      console.error('Failed to publish program:', error);
      alert('Failed to publish program');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;
    try {
      await programService.deleteProgram(programId);
      fetchPrograms();
    } catch (error: any) {
      console.error('Failed to delete program:', error);
      alert(error.response?.data?.error || 'Failed to delete program');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: ProgramLevel.BEGINNER,
      duration_weeks: 12,
      prerequisites: [],
      learning_outcomes: [],
    });
    setPrerequisite('');
    setOutcome('');
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

  const addOutcome = () => {
    if (outcome.trim()) {
      setFormData({
        ...formData,
        learning_outcomes: [...(formData.learning_outcomes || []), outcome.trim()],
      });
      setOutcome('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites?.filter((_, i) => i !== index),
    });
  };

  const removeOutcome = (index: number) => {
    setFormData({
      ...formData,
      learning_outcomes: formData.learning_outcomes?.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: ProgramStatus) => {
    const colors = {
      [ProgramStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [ProgramStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [ProgramStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors[ProgramStatus.DRAFT];
  };

  const getLevelBadge = (level: ProgramLevel) => {
    const colors = {
      [ProgramLevel.BEGINNER]: 'bg-blue-100 text-blue-800',
      [ProgramLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800',
      [ProgramLevel.ADVANCED]: 'bg-red-100 text-red-800',
      [ProgramLevel.ALL_LEVELS]: 'bg-purple-100 text-purple-800',
    };
    return colors[level] || colors[ProgramLevel.BEGINNER];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading programs...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
            <p className="text-gray-600 mt-1">Create and manage your training programs</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Create Program
          </button>
        </div>

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs yet</h3>
            <p className="text-gray-600 mb-6">Create your first program to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(program.status)}`}>
                      {program.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBadge(program.level)}`}>
                      {program.level}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{program.duration_weeks} weeks</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Courses</p>
                      <p className="text-sm font-semibold text-gray-900">{program.course_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Students</p>
                      <p className="text-sm font-semibold text-gray-900">{program.student_count}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/instructor/programs/${program.id}`)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    {program.status === ProgramStatus.DRAFT && (
                      <button
                        onClick={() => handlePublish(program.id)}
                        className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(program.id)}
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

        {/* Create Program Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Program</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProgram} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Generative AI Bootcamp"
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
                      placeholder="Describe the program..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as ProgramLevel })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={ProgramLevel.BEGINNER}>Beginner</option>
                        <option value={ProgramLevel.INTERMEDIATE}>Intermediate</option>
                        <option value={ProgramLevel.ADVANCED}>Advanced</option>
                        <option value={ProgramLevel.ALL_LEVELS}>All Levels</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (weeks) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add learning outcome and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addOutcome}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.learning_outcomes?.map((out, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {out}
                          <button
                            type="button"
                            onClick={() => removeOutcome(index)}
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
                      Create Program
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
