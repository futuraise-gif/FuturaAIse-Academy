import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { analyticsService } from '@/services/instructorService';
import { courseService } from '@/services/instructorService';
import { StudentProgress, CourseAnalytics } from '@/types/instructor.types';
import { Course } from '@/types/instructor.types';

interface StudentDetailsModalProps {
  student: StudentProgress | null;
  courseId: string;
  onClose: () => void;
}

function StudentDetailsModal({ student, courseId, onClose }: StudentDetailsModalProps) {
  if (!student) return null;

  const enrolledDate = new Date(student.enrolled_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const lastAccessedDate = student.last_accessed_at
    ? new Date(student.last_accessed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{student.student_name}</h2>
              <p className="text-indigo-100 mt-1">{student.student_email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Student Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Enrollment Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{enrolledDate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Last Accessed</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lastAccessedDate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(student.completion_status)}`}>
                {student.completion_status.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {Math.floor(student.total_time_spent_minutes / 60)}h {student.total_time_spent_minutes % 60}m
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Progress</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#4F46E5"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - student.overall_progress_percentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-600">
                        {student.overall_progress_percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Complete</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.modules_completed}/{student.total_modules}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Modules</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.assignments_completed}/{student.total_assignments}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Assignments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.classes_attended}/{student.total_classes}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Classes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Module-wise Progress */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Module-wise Progress</h3>
            <div className="space-y-3">
              {student.module_progress.map((module, index) => (
                <div key={module.module_id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        Module {index + 1}: {module.module_title}
                      </h4>
                      {module.completed_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Completed on {new Date(module.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-indigo-600">
                      {module.progress_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress_percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Time spent: {Math.floor(module.time_spent_minutes / 60)}h {module.time_spent_minutes % 60}m
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Assignment Score</p>
                    <p className={`text-3xl font-bold mt-1 ${getGradeColor(student.average_assignment_score)}`}>
                      {student.average_assignment_score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      student.average_assignment_score >= 90 ? 'bg-green-600' :
                      student.average_assignment_score >= 80 ? 'bg-blue-600' :
                      student.average_assignment_score >= 70 ? 'bg-yellow-600' :
                      student.average_assignment_score >= 60 ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${student.average_assignment_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                    <p className={`text-3xl font-bold mt-1 ${getGradeColor(student.attendance_percentage)}`}>
                      {student.attendance_percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      student.attendance_percentage >= 90 ? 'bg-green-600' :
                      student.attendance_percentage >= 80 ? 'bg-blue-600' :
                      student.attendance_percentage >= 70 ? 'bg-yellow-600' :
                      student.attendance_percentage >= 60 ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${student.attendance_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof StudentProgress>('student_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.getInstructorCourses();
      setCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, studentsData] = await Promise.all([
        analyticsService.getCourseAnalytics(selectedCourseId),
        analyticsService.getCourseStudentsProgress(selectedCourseId)
      ]);
      setAnalytics(analyticsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof StudentProgress) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const query = searchQuery.toLowerCase();
      return (
        student.student_name.toLowerCase().includes(query) ||
        student.student_email.toLowerCase().includes(query)
      );
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [students, searchQuery, sortField, sortDirection]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 70) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    if (percentage >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const SortIcon = ({ field }: { field: keyof StudentProgress }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Progress Analytics</h1>
          <p className="text-gray-600 mt-2">Track and analyze student performance across your courses</p>
        </div>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : analytics && (
          <>
            {/* Course Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.total_enrolled}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.active_students}</p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {analytics.average_completion_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Assignment Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {analytics.average_assignment_score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {analytics.average_attendance_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
            </div>

            {/* Grade Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Distribution</h2>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(analytics.grade_distribution).map(([grade, count]) => {
                  const total = analytics.total_enrolled;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const maxCount = Math.max(...Object.values(analytics.grade_distribution));
                  const barHeight = maxCount > 0 ? (count / maxCount) * 200 : 0;

                  return (
                    <div key={grade} className="text-center">
                      <div className="flex flex-col items-center justify-end h-64 mb-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          {count} ({percentage.toFixed(1)}%)
                        </div>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            grade === 'A' ? 'bg-green-500' :
                            grade === 'B' ? 'bg-blue-500' :
                            grade === 'C' ? 'bg-yellow-500' :
                            grade === 'D' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        ></div>
                      </div>
                      <div className={`py-3 px-4 rounded-lg border-2 font-bold text-lg ${getGradeColor(grade)}`}>
                        {grade}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student Progress Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Student Progress</h2>
                  <div className="w-full md:w-96">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('student_name')}
                      >
                        <div className="flex items-center gap-2">
                          Student Name
                          <SortIcon field="student_name" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('student_email')}
                      >
                        <div className="flex items-center gap-2">
                          Email
                          <SortIcon field="student_email" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('overall_progress_percentage')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Progress %
                          <SortIcon field="overall_progress_percentage" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('modules_completed')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Modules
                          <SortIcon field="modules_completed" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('average_assignment_score')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Avg Score
                          <SortIcon field="average_assignment_score" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('attendance_percentage')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Attendance %
                          <SortIcon field="attendance_percentage" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {searchQuery ? 'No students found matching your search' : 'No students enrolled yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedStudents.map((student) => (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{student.student_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-gray-900">
                                  {student.overall_progress_percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${getProgressColor(student.overall_progress_percentage)}`}
                                  style={{ width: `${student.overall_progress_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-semibold text-gray-900">
                              {student.modules_completed}/{student.total_modules}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className={`text-sm font-bold ${
                              student.average_assignment_score >= 90 ? 'text-green-600' :
                              student.average_assignment_score >= 80 ? 'text-blue-600' :
                              student.average_assignment_score >= 70 ? 'text-yellow-600' :
                              student.average_assignment_score >= 60 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {student.average_assignment_score.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className={`text-sm font-bold ${
                              student.attendance_percentage >= 90 ? 'text-green-600' :
                              student.attendance_percentage >= 80 ? 'text-blue-600' :
                              student.attendance_percentage >= 70 ? 'text-yellow-600' :
                              student.attendance_percentage >= 60 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {student.attendance_percentage.toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedStudents.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedStudents.length} of {students.length} students
                    {searchQuery && ` (filtered by "${searchQuery}")`}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            courseId={selectedCourseId}
            onClose={() => setSelectedStudent(null)}
          />
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">You don't have any courses yet. Create a course to start tracking student progress.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
