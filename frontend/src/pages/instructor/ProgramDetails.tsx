import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { programService } from '@/services/instructorService';
import { Program, ProgramStatus } from '@/types/instructor.types';

export default function ProgramDetails() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      const data = await programService.getProgramDetails(programId!);
      setProgram(data);
    } catch (error) {
      console.error('Failed to fetch program details:', error);
      alert('Failed to load program details');
      navigate('/instructor/programs');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!program) return;
    if (!confirm('Are you sure you want to publish this program? It will be visible to students.')) return;

    try {
      await programService.publishProgram(program.id);
      fetchProgramDetails();
    } catch (error) {
      console.error('Failed to publish program:', error);
      alert('Failed to publish program');
    }
  };

  const handleArchive = async () => {
    if (!program) return;
    if (!confirm('Are you sure you want to archive this program?')) return;

    try {
      await programService.archiveProgram(program.id);
      fetchProgramDetails();
    } catch (error) {
      console.error('Failed to archive program:', error);
      alert('Failed to archive program');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading program details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!program) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Program not found</p>
          <button
            onClick={() => navigate('/instructor/programs')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Programs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: ProgramStatus) => {
    const colors = {
      [ProgramStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [ProgramStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [ProgramStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors[ProgramStatus.DRAFT];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/instructor/programs')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(program.status)}`}>
                  {program.status}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Program Details & Courses</p>
            </div>
          </div>
          <div className="flex gap-2">
            {program.status === ProgramStatus.DRAFT && (
              <button
                onClick={handlePublish}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Publish Program
              </button>
            )}
            {program.status === ProgramStatus.PUBLISHED && (
              <button
                onClick={handleArchive}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700"
              >
                Archive Program
              </button>
            )}
          </div>
        </div>

        {/* Program Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Level</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{program.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{program.duration_weeks} weeks</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-lg font-semibold text-gray-900">{program.student_count || 0}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-gray-900">{program.description}</p>
          </div>

          {program.prerequisites && program.prerequisites.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Prerequisites</p>
              <ul className="list-disc list-inside space-y-1">
                {program.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-gray-900">{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {program.learning_outcomes && program.learning_outcomes.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Learning Outcomes</p>
              <ul className="list-disc list-inside space-y-1">
                {program.learning_outcomes.map((outcome, index) => (
                  <li key={index} className="text-gray-900">{outcome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Courses ({program.course_count || 0})
            </h2>
            <button
              onClick={() => navigate(`/instructor/courses?program_id=${program.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              + Add Course
            </button>
          </div>

          {!program.course_count || program.course_count === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Add courses to this program to get started</p>
              <button
                onClick={() => navigate(`/instructor/courses?program_id=${program.id}`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Add First Course
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              <p>This program has {program.course_count} course(s).</p>
              <button
                onClick={() => navigate(`/instructor/courses?program_id=${program.id}`)}
                className="mt-4 text-blue-600 hover:underline"
              >
                View all courses →
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{program.course_count || 0}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{program.student_count || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{program.duration_weeks}</p>
                <p className="text-xs text-gray-500">weeks</p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-bold text-gray-900 mt-1 capitalize">{program.status}</p>
              </div>
              <div className="text-4xl">
                {program.status === ProgramStatus.PUBLISHED ? '✅' : program.status === ProgramStatus.DRAFT ? '📝' : '📦'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
