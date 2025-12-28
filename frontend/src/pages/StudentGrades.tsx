import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gradeService } from '@/services/gradeService';
import { courseService } from '@/services/courseService';
import { GradeColumn, StudentGradeRecord, GradeColumnType } from '@/types/grade.types';
import { formatDistanceToNow } from 'date-fns';

export default function StudentGrades() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [columns, setColumns] = useState<GradeColumn[]>([]);
  const [gradeRecord, setGradeRecord] = useState<StudentGradeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, columnsData, gradesData] = await Promise.all([
        courseService.getCourseById(courseId!),
        gradeService.getColumns(courseId!),
        gradeService.getMyGrades(courseId!),
      ]);

      setCourse(courseData.course);
      setColumns(columnsData.columns.filter((col) => col.visible_to_students));
      setGradeRecord(gradesData.gradeRecord);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnTypeIcon = (type: GradeColumnType) => {
    switch (type) {
      case GradeColumnType.ASSIGNMENT:
        return '📝';
      case GradeColumnType.EXAM:
        return '📄';
      case GradeColumnType.QUIZ:
        return '📊';
      case GradeColumnType.PARTICIPATION:
        return '🙋';
      case GradeColumnType.CUSTOM:
        return '⭐';
      default:
        return '📋';
    }
  };

  const getGradeColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-100 text-gray-700';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
          >
            ← Back
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
              {course && (
                <p className="text-gray-600 mt-1">
                  {course.title} ({course.code})
                </p>
              )}
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Grade Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-100 text-sm mb-2">Overall Course Grade</p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-5xl font-bold">
                  {gradeRecord?.overall_percentage?.toFixed(1) || '0.0'}%
                </h2>
                <div
                  className={`text-2xl font-bold px-4 py-2 rounded-lg ${getLetterGradeColor(
                    gradeRecord?.overall_letter_grade
                  )}`}
                >
                  {gradeRecord?.overall_letter_grade || 'N/A'}
                </div>
              </div>
              <p className="text-indigo-100 text-sm mt-3">
                {gradeRecord?.overall_points_earned?.toFixed(1) || '0'} /{' '}
                {gradeRecord?.overall_points_possible?.toFixed(1) || '0'} points earned
              </p>
            </div>
            <div className="text-6xl opacity-50">🎓</div>
          </div>
        </div>

        {/* Grade Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{columns.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Graded Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(gradeRecord?.grades || {}).filter((g) => g.grade !== undefined).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {columns.length -
                Object.values(gradeRecord?.grades || {}).filter((g) => g.grade !== undefined).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {gradeRecord?.updated_at
                ? formatDistanceToNow(new Date(gradeRecord.updated_at), { addSuffix: true })
                : 'Never'}
            </p>
          </div>
        </div>

        {/* Individual Grades */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Grade Breakdown</h2>
            <p className="text-sm text-gray-600 mt-1">
              View your grades for each assignment and assessment
            </p>
          </div>

          <div className="p-6">
            {columns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No grades available yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your instructor hasn't created any graded items yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {columns.map((column) => {
                  const gradeEntry = gradeRecord?.grades?.[column.id];
                  const hasGrade = gradeEntry?.grade !== undefined;

                  return (
                    <div
                      key={column.id}
                      className={`border rounded-lg p-4 ${
                        hasGrade ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-3xl">{getColumnTypeIcon(column.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{column.name}</h3>
                              {column.category && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {column.category}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {column.points} points
                              {column.weight && ` • ${column.weight}% of grade`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {hasGrade ? (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                  {gradeEntry.grade?.toFixed(1)}
                                </span>
                                <span className="text-gray-500">/ {column.points}</span>
                              </div>
                              <div
                                className={`text-lg font-semibold ${getGradeColor(
                                  gradeEntry.percentage
                                )}`}
                              >
                                {gradeEntry.percentage?.toFixed(1)}%
                              </div>
                              {gradeEntry.letter_grade && (
                                <div
                                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold ${getLetterGradeColor(
                                    gradeEntry.letter_grade
                                  )}`}
                                >
                                  {gradeEntry.letter_grade}
                                </div>
                              )}
                              {gradeEntry.graded_at && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Graded{' '}
                                  {formatDistanceToNow(new Date(gradeEntry.graded_at), {
                                    addSuffix: true,
                                  })}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                Not Graded
                              </span>
                              <p className="text-xs text-gray-500 mt-2">{column.points} points</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {hasGrade && gradeEntry.is_override && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                          <p className="text-xs text-yellow-800">
                            ⚠️ Grade Override Applied
                            {gradeEntry.override_reason && `: ${gradeEntry.override_reason}`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Grade Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Grade Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm">A (90-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm">B (80-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-sm">C (70-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="text-sm">D (60-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm">F (Below 60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm">Not Graded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
