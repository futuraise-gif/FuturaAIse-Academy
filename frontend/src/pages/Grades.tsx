import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/config/api';

interface Course {
  id: string;
  title: string;
  instructor_name: string;
}

interface GradedAssignment {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  points: number;
  submission_status: string;
  submission_grade: number | null;
  adjusted_grade: number | null;
  submitted_at: string;
  graded_at: string;
  due_date: string;
  is_late: boolean;
}

export default function Grades() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGraded: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [gradedAssignments, selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const coursesRes = await api.get('/courses/my-courses');
      const coursesData = coursesRes.data.courses || [];
      setCourses(coursesData);

      // Fetch all assignments with their submission status
      const assignmentsRes = await api.get('/assignments');
      const allAssignments = assignmentsRes.data.assignments || [];

      // Filter to only show graded assignments
      const graded = allAssignments.filter(
        (a: any) => a.submission_status === 'graded' && a.submission_grade !== null
      );

      setGradedAssignments(graded);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const filtered = selectedCourse === 'all'
      ? gradedAssignments
      : gradedAssignments.filter(a => a.course_id === selectedCourse);

    if (filtered.length === 0) {
      setStats({ totalGraded: 0, averageGrade: 0, highestGrade: 0, lowestGrade: 0 });
      return;
    }

    const grades = filtered.map(a => {
      const grade = a.adjusted_grade !== null ? a.adjusted_grade : a.submission_grade;
      const percentage = (grade! / a.points) * 100;
      return percentage;
    });

    const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    setStats({
      totalGraded: filtered.length,
      averageGrade: avg,
      highestGrade: highest,
      lowestGrade: lowest,
    });
  };

  const filteredAssignments = selectedCourse === 'all'
    ? gradedAssignments
    : gradedAssignments.filter(a => a.course_id === selectedCourse);

  const getGradePercentage = (assignment: GradedAssignment) => {
    const grade = assignment.adjusted_grade !== null ? assignment.adjusted_grade : assignment.submission_grade;
    return ((grade! / assignment.points) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getLetterGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading grades...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Grades</h2>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Course Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graded Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalGraded}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Grade</p>
                <p className={`text-3xl font-bold mt-1 ${getGradeColor(stats.averageGrade)}`}>
                  {stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Highest Grade</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.highestGrade > 0 ? `${stats.highestGrade.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lowest Grade</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.lowestGrade > 0 ? `${stats.lowestGrade.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="text-4xl">📉</div>
            </div>
          </div>
        </div>

        {/* Grades List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Grade Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCourse === 'all'
                ? 'Showing grades from all courses'
                : `Showing grades for ${courses.find(c => c.id === selectedCourse)?.title}`}
            </p>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No graded assignments yet</h3>
              <p className="text-gray-600">
                {selectedCourse === 'all'
                  ? 'Your graded assignments will appear here once instructors grade your submissions'
                  : 'No graded assignments for this course yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Letter Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Graded Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const percentage = parseFloat(getGradePercentage(assignment));
                    const letterGrade = getLetterGrade(percentage);
                    const grade = assignment.adjusted_grade !== null ? assignment.adjusted_grade : assignment.submission_grade;

                    return (
                      <tr
                        key={assignment.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/assignments/${assignment.course_id}/${assignment.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{assignment.course_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {grade?.toFixed(1)} / {assignment.points}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getLetterGradeColor(percentage)}`}>
                            {letterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.graded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {assignment.is_late && (
                              <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">
                                Late
                              </span>
                            )}
                            {assignment.adjusted_grade !== null && assignment.adjusted_grade !== assignment.submission_grade && (
                              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                Adjusted
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grade Scale Legend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Grade Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium">A (90-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium">B (80-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              <span className="text-sm font-medium">C (70-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
              <span className="text-sm font-medium">D (60-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="text-sm font-medium">F (Below 60%)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
