import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { courseService } from '@/services/courseService';
import { Course, CourseStatus } from '@/types/course.types';
import CreateCourseModal from '@/components/courses/CreateCourseModal';
import CourseCard from '@/components/courses/CourseCard';
import EnrollModal from '@/components/courses/EnrollModal';

export default function Courses() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('enrolled');

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isStudent = user?.role === UserRole.STUDENT;

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      if (activeTab === 'enrolled') {
        const data = await courseService.getMyEnrolledCourses();
        setEnrolledCourses(data.courses);
      } else {
        const data = await courseService.getAllCourses({
          status: isStudent ? CourseStatus.PUBLISHED : undefined,
        });
        setCourses(data.courses);
      }
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setShowCreateModal(false);
    fetchCourses();
  };

  const handleEnrollSuccess = () => {
    setShowEnrollModal(false);
    fetchCourses();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Courses</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isInstructor && 'Manage your courses and create new ones'}
              {isAdmin && 'View and manage all courses in the system'}
              {isStudent && 'Browse and enroll in available courses'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {isStudent && (
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                + Enroll by Course Code
              </button>
            )}

            {(isInstructor || isAdmin) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                + Create Course
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'enrolled'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isStudent ? 'Available Courses' : 'All Courses'}
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && (
          <>
            {activeTab === 'enrolled' && (
              <div>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">You are not enrolled in any courses yet.</p>
                    {isStudent && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Browse available courses →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {enrolledCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={true}
                        onUpdate={fetchCourses}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div>
                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-sm sm:text-base text-gray-500">
                      {isStudent
                        ? 'No courses available for enrollment at this time.'
                        : 'No courses found. Create your first course to get started.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={false}
                        onUpdate={fetchCourses}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}

      {showEnrollModal && (
        <EnrollModal
          onClose={() => setShowEnrollModal(false)}
          onSuccess={handleEnrollSuccess}
        />
      )}
    </DashboardLayout>
  );
}
