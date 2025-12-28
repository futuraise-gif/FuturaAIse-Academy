import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gradeService } from '@/services/gradeService';
import { GradeColumn, StudentGradeRecord, GradeColumnType, UpdateGradeDTO } from '@/types/grade.types';
import { courseService } from '@/services/courseService';

export default function GradeCenter() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [columns, setColumns] = useState<GradeColumn[]>([]);
  const [students, setStudents] = useState<StudentGradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ studentId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchGradeCenter();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { course: courseData } = await courseService.getCourseById(courseId!);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };

  const fetchGradeCenter = async () => {
    try {
      setLoading(true);
      const { columns: columnsData, students: studentsData } = await gradeService.getGradeCenter(courseId!);
      setColumns(columnsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to fetch grade center:', error);
      alert('Failed to load grade center');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (studentId: string, columnId: string, currentGrade?: number) => {
    setEditingCell({ studentId, columnId });
    setEditValue(currentGrade?.toString() || '');
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const grade = parseFloat(editValue);
    if (isNaN(grade) || grade < 0) {
      setEditingCell(null);
      setEditValue('');
      return;
    }

    try {
      setSaving(true);
      const data: UpdateGradeDTO = {
        grade,
        is_override: false,
      };

      await gradeService.updateGrade(
        courseId!,
        editingCell.studentId,
        editingCell.columnId,
        data
      );

      await fetchGradeCenter();
      setEditingCell(null);
      setEditValue('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleExport = async () => {
    try {
      await gradeService.exportGrades(courseId!);
    } catch (error) {
      alert('Failed to export grades');
    }
  };

  const getColumnColor = (type: GradeColumnType) => {
    switch (type) {
      case GradeColumnType.ASSIGNMENT:
        return 'bg-blue-50';
      case GradeColumnType.EXAM:
        return 'bg-purple-50';
      case GradeColumnType.QUIZ:
        return 'bg-green-50';
      case GradeColumnType.PARTICIPATION:
        return 'bg-yellow-50';
      case GradeColumnType.TOTAL:
        return 'bg-gray-100';
      default:
        return 'bg-white';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-700 font-semibold';
    if (percentage >= 80) return 'text-blue-700 font-semibold';
    if (percentage >= 70) return 'text-yellow-700 font-semibold';
    if (percentage >= 60) return 'text-orange-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base"
          >
            ← Back
          </button>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Grade Center</h1>
              {course && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {course.title} ({course.code})
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowColumnModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                + Add Column
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Export CSV
              </button>
              <button
                onClick={fetchGradeCenter}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Grade Columns</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{columns.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Avg Overall %</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {students.length > 0
                ? (
                    students.reduce((sum, s) => sum + (s.overall_percentage || 0), 0) /
                    students.length
                  ).toFixed(1)
                : '0.0'}
              %
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Graded Entries</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {students.reduce(
                (sum, s) =>
                  sum + Object.values(s.grades || {}).filter((g) => g.grade !== undefined).length,
                0
              )}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>How to use:</strong> Click on any grade cell to edit. Press Enter to save or
            Escape to cancel. Grades are automatically calculated. <span className="hidden sm:inline">On mobile, scroll horizontally to view all columns.</span>
          </p>
        </div>

        {/* Grade Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    Student
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider ${getColumnColor(
                        column.type
                      )} border-r border-gray-200 min-w-[120px]`}
                    >
                      <div>
                        <div className="font-semibold">{column.name}</div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {column.points} pts
                          {column.weight && ` • ${column.weight}%`}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="sticky right-0 z-10 bg-gray-100 px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l-2 border-gray-300">
                    <div>
                      <div className="font-semibold">Overall</div>
                      <div className="text-[10px] text-gray-500 mt-1">Percentage</div>
                    </div>
                  </th>
                  <th className="sticky right-0 z-10 bg-gray-100 px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    <div>
                      <div className="font-semibold">Letter</div>
                      <div className="text-[10px] text-gray-500 mt-1">Grade</div>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 3}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No students enrolled in this course yet
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div>
                          <div>{student.student_name}</div>
                          <div className="text-xs text-gray-500">{student.student_email}</div>
                        </div>
                      </td>

                      {columns.map((column) => {
                        const gradeEntry = student.grades?.[column.id];
                        const isEditing =
                          editingCell?.studentId === student.student_id &&
                          editingCell?.columnId === column.id;

                        return (
                          <td
                            key={column.id}
                            className={`px-4 py-4 whitespace-nowrap text-sm text-center ${getColumnColor(
                              column.type
                            )} border-r border-gray-200 cursor-pointer hover:bg-gray-100`}
                            onClick={() =>
                              !isEditing &&
                              handleCellClick(student.student_id, column.id, gradeEntry?.grade)
                            }
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                                autoFocus
                                min="0"
                                max={column.points}
                                step="0.01"
                              />
                            ) : (
                              <div>
                                {gradeEntry?.grade !== undefined ? (
                                  <>
                                    <div className="font-medium text-gray-900">
                                      {gradeEntry.grade.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {gradeEntry.percentage?.toFixed(1)}%
                                    </div>
                                    {gradeEntry.is_override && (
                                      <div className="text-[10px] text-orange-600 mt-1">
                                        Override
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-gray-400">—</div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="sticky right-0 z-10 bg-gray-50 px-6 py-4 whitespace-nowrap text-sm text-center border-l-2 border-gray-300">
                        <div
                          className={`text-lg font-bold ${getPercentageColor(
                            student.overall_percentage || 0
                          )}`}
                        >
                          {student.overall_percentage?.toFixed(1) || '0.0'}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.overall_points_earned?.toFixed(1) || '0'} /{' '}
                          {student.overall_points_possible?.toFixed(1) || '0'}
                        </div>
                      </td>

                      <td className="sticky right-0 z-10 bg-gray-50 px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {student.overall_letter_grade || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Column Types</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-xs sm:text-sm text-gray-700">Assignment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-50 border border-purple-200 rounded"></div>
              <span className="text-xs sm:text-sm text-gray-700">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-xs sm:text-sm text-gray-700">Quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-xs sm:text-sm text-gray-700">Participation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-xs sm:text-sm text-gray-700">Total</span>
            </div>
          </div>
        </div>

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            Saving grade...
          </div>
        )}
      </div>

      {/* Add Column Modal */}
      {showColumnModal && (
        <AddColumnModal
          courseId={courseId!}
          onClose={() => setShowColumnModal(false)}
          onSuccess={() => {
            setShowColumnModal(false);
            fetchGradeCenter();
          }}
        />
      )}
    </div>
  );
}

interface AddColumnModalProps {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddColumnModal({ courseId, onClose, onSuccess }: AddColumnModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<GradeColumnType>(GradeColumnType.CUSTOM);
  const [points, setPoints] = useState('100');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Column name is required');
      return;
    }

    if (!points || parseFloat(points) <= 0) {
      setError('Points must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await gradeService.createColumn({
        course_id: courseId,
        name: name.trim(),
        type,
        points: parseFloat(points),
        weight: weight ? parseFloat(weight) : undefined,
        category: category.trim() || undefined,
        visible_to_students: true,
        include_in_calculations: true,
      });

      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create column');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Grade Column</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Midterm Exam"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GradeColumnType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value={GradeColumnType.ASSIGNMENT}>Assignment</option>
              <option value={GradeColumnType.EXAM}>Exam</option>
              <option value={GradeColumnType.QUIZ}>Quiz</option>
              <option value={GradeColumnType.PARTICIPATION}>Participation</option>
              <option value={GradeColumnType.CUSTOM}>Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="100"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (optional)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 20 for 20%"
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentage of total grade (for weighted grading)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Homework, Tests"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
