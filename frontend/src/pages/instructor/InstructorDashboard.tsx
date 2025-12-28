import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorService, InstructorDashboardStats, CourseWithStats } from '@/services/instructorService';
import DashboardLayout from '@/components/DashboardLayout';

interface StudentInfo {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  enrolled_courses_count: number;
  status: string;
}

export default function InstructorDashboard() {
  const [stats, setStats] = useState<InstructorDashboardStats | null>(null);
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'courses' | 'students'>('overview');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeView === 'courses') {
      fetchCourses();
    } else if (activeView === 'students') {
      fetchStudents();
    }
  }, [activeView, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const { stats: dashboardStats } = await instructorService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filterStatus = activeTab === 'all' ? undefined : activeTab;
      const { courses: coursesData } = await instructorService.getMyCourses(filterStatus);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Mock student data - replace with actual API call
      const mockStudents: StudentInfo[] = [
        {
          id: '1',
          student_id: 'STU20250001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          enrolled_courses_count: 3,
          status: 'active',
        },
        {
          id: '2',
          student_id: 'STU20250002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          enrolled_courses_count: 2,
          status: 'active',
        },
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your courses, assignments, and students</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <span className="text-white text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_courses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <span className="text-white text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active_courses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <span className="text-white text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.draft_courses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('students')}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_students}</p>
                  <p className="text-xs text-indigo-600 mt-1">Click to view all</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <span className="text-white text-2xl">⏰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending_submissions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeView === 'overview'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeView === 'courses'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveView('courses')}
          >
            My Courses
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeView === 'students'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
            onClick={() => setActiveView('students')}
          >
            My Students ({stats?.total_students || 0})
          </button>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/instructor/courses/create"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">➕</div>
            <h3 className="font-semibold text-gray-900">Create Course</h3>
            <p className="text-sm text-gray-600 mt-1">Start a new course</p>
          </Link>

          <Link
            to="/instructor/assignments/create"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900">New Assignment</h3>
            <p className="text-sm text-gray-600 mt-1">Create assignment</p>
          </Link>

          <Link
            to="/instructor/quizzes/create"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">New Quiz</h3>
            <p className="text-sm text-gray-600 mt-1">Build a quiz</p>
          </Link>

          <Link
            to="/announcements"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📢</div>
            <h3 className="font-semibold text-gray-900">Announcements</h3>
            <p className="text-sm text-gray-600 mt-1">Post updates</p>
          </Link>
        </div>
          </>
        )}

        {/* Courses Tab */}
        {activeView === 'courses' && (
          <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'active'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'draft'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found</p>
                <Link
                  to="/instructor/courses/create"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
                >
                  Create your first course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link to={`/instructor/courses/${course.id}`} className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg hover:text-indigo-600">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">{course.course_code}</p>
                      </Link>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          course.status
                        )}`}
                      >
                        {course.status}
                      </span>
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{course.enrolled_count}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {course.stats.total_assignments}
                        </p>
                        <p className="text-xs text-gray-600">Assignments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {course.stats.total_quizzes}
                        </p>
                        <p className="text-xs text-gray-600">Quizzes</p>
                      </div>
                    </div>

                    {course.stats.pending_submissions > 0 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-2">
                        <p className="text-xs text-red-800 text-center">
                          {course.stats.pending_submissions} pending submission
                          {course.stats.pending_submissions !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/instructor/courses/${course.id}/grades`}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 text-center font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Grade Center
                      </Link>
                      <Link
                        to={`/instructor/courses/${course.id}`}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 text-center font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Students Tab */}
        {activeView === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">My Students</h2>
                <p className="text-sm text-gray-600">
                  Total: {students.length} student{students.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No students enrolled yet</p>
                  <p className="text-sm text-gray-400 mt-2">Students will appear here once they enroll in your courses</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                  {student.first_name[0]}{student.last_name[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.first_name} {student.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.student_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{student.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900">{student.enrolled_courses_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                student.status
                              )}`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-2xl">
                      {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedStudent.student_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                    <p className="text-sm text-gray-900">{selectedStudent.enrolled_courses_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        selectedStudent.status
                      )}`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
