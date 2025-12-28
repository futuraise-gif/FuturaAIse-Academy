import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { courseService } from '@/services/courseService';
import { Course } from '@/types/course.types';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(courseId!);
      setCourse(data.course);
    } catch (error: any) {
      console.error('Failed to fetch course:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const modules = [
    {
      title: 'Content',
      description: 'Access course materials, videos, and files',
      icon: '📚',
      path: `/courses/${courseId}/content`,
      color: 'bg-blue-500',
    },
    {
      title: 'Discussions',
      description: 'Participate in course discussions',
      icon: '💬',
      path: `/courses/${courseId}/discussions`,
      color: 'bg-green-500',
    },
    {
      title: 'Assignments',
      description: 'View and submit assignments',
      icon: '📝',
      path: `/assignments?courseId=${courseId}`,
      color: 'bg-yellow-500',
    },
    {
      title: 'Grades',
      description: 'Check your grades and feedback',
      icon: '📊',
      path: `/courses/${courseId}/grades`,
      color: 'bg-purple-500',
      studentOnly: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/courses')}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Back to Courses
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Code:</span> {course.course_code}
                  </span>
                  {course.instructor_name && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Instructor:</span> {course.instructor_name}
                    </span>
                  )}
                  {course.enrolled_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Students:</span> {course.enrolled_count}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : course.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules
              .filter((module) => !module.studentOnly || !isInstructor)
              .map((module) => (
                <button
                  key={module.title}
                  onClick={() => navigate(module.path)}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${module.color} text-white p-3 rounded-lg text-2xl`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
