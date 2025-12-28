import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole } from '@/types';
import api from '@/config/api';

interface Course {
  id: string;
  title: string;
  instructor_name: string;
  code?: string;
}

interface Assignment {
  id: string;
  title: string;
  course_id: string;
  due_date: string;
  status: string;
  submission_status: string | null;
  submission_grade: number | null;
  submitted_at: string | null;
}

interface Announcement {
  id: string;
  title: string;
  course_id?: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesCount: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    announcementsCount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const coursesRes = await api.get('/courses/my-courses');
      const courses = coursesRes.data.courses || [];
      setEnrolledCourses(courses);

      // Fetch assignments
      let assignments: Assignment[] = [];
      try {
        const assignmentsRes = await api.get('/assignments');
        assignments = assignmentsRes.data.assignments || [];
        setUpcomingAssignments(assignments.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }

      // Fetch announcements
      let announcements: Announcement[] = [];
      try {
        const announcementsRes = await api.get('/announcements');
        announcements = announcementsRes.data.announcements || [];
        setRecentAnnouncements(announcements.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }

      // Calculate stats - count assignments that haven't been submitted
      const pending = assignments.filter((a) => !a.submission_status).length;
      setStats({
        coursesCount: courses.length,
        pendingAssignments: pending,
        averageGrade: 0, // Will be calculated when grade API is available
        announcementsCount: announcements.length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Enrolled Courses</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stats.coursesCount}</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending Assignments</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stats.pendingAssignments}</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Average Grade</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A'}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Announcements</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stats.announcementsCount}</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl">📢</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Courses</h3>
            </div>
            <div className="p-4 sm:p-6">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Browse available courses to get started</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 text-sm sm:text-base transition-colors touch-manipulation"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md active:shadow-lg transition-all cursor-pointer touch-manipulation transform active:scale-[0.98]"
                    >
                      <div className="w-full h-2 bg-indigo-500 rounded-full mb-2 sm:mb-3"></div>
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">{course.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{course.instructor_name}</p>
                      {course.code && (
                        <p className="text-xs text-gray-500 mt-1">{course.code}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
            </div>
            <div className="p-6">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-600 text-sm">No assignments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => navigate(`/assignments/${assignment.course_id}/${assignment.id}`)}
                      className="border-l-4 border-indigo-500 pl-4 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <h4 className="font-medium text-gray-900 text-sm">{assignment.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            assignment.submission_status === 'graded'
                              ? 'bg-purple-100 text-purple-800'
                              : assignment.submission_status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {assignment.submission_status === 'graded'
                            ? 'Graded'
                            : assignment.submission_status === 'submitted'
                            ? 'Submitted'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📢</div>
                <p className="text-gray-600 text-sm">No announcements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    onClick={() => navigate(`/announcements/${announcement.id}`)}
                    className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <div className="text-2xl">📢</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
