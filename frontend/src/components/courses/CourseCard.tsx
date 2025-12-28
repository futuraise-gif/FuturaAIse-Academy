import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, CourseStatus } from '@/types/course.types';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { courseService } from '@/services/courseService';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onUpdate: () => void;
}

export default function CourseCard({ course, isEnrolled, onUpdate }: CourseCardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isOwner = course.instructor_id === user?.id;

  const getStatusBadge = () => {
    const badges = {
      [CourseStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [CourseStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [CourseStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[course.status]}`}>
        {course.status.toUpperCase()}
      </span>
    );
  };

  const handleEnroll = async () => {
    if (!course.allow_self_enrollment) {
      alert('This course does not allow self-enrollment. Please contact the instructor.');
      return;
    }

    try {
      setLoading(true);
      await courseService.selfEnroll(course.code);
      alert('Successfully enrolled in course!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      await courseService.publishCourse(course.id);
      alert('Course published successfully!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to publish course');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this course?')) return;

    try {
      setLoading(true);
      await courseService.deleteCourse(course.id);
      alert('Course archived successfully!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to archive course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]">
      {/* Course Header with Color Bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

      <div className="p-4 sm:p-6">
        {/* Course Code and Status */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <span className="text-xs sm:text-sm font-mono font-semibold text-indigo-600 truncate">{course.code}</span>
          {getStatusBadge()}
        </div>

        {/* Course Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{course.title}</h3>

        {/* Instructor */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate">
          <span className="font-medium">Instructor:</span> {course.instructor_name}
        </p>

        {/* Term & Year */}
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 gap-1">
          <span className="capitalize">{course.term}</span>
          <span>•</span>
          <span>{course.year}</span>
          {course.credits && (
            <>
              <span>•</span>
              <span>{course.credits} Credits</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 min-h-[3rem]">{course.description}</p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 font-medium text-xs sm:text-sm transition-colors touch-manipulation"
          >
            View Course
          </button>

          {/* Student Actions */}
          {!isEnrolled && user?.role === UserRole.STUDENT && course.status === CourseStatus.PUBLISHED && (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 font-medium text-xs sm:text-sm disabled:opacity-50 transition-colors touch-manipulation"
            >
              {loading ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}

          {/* Instructor/Admin Actions */}
          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              {course.status === CourseStatus.DRAFT && (
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 font-medium text-xs sm:text-sm disabled:opacity-50 transition-colors touch-manipulation"
                >
                  Publish
                </button>
              )}

              <button
                onClick={handleArchive}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 font-medium text-xs sm:text-sm disabled:opacity-50 transition-colors touch-manipulation"
              >
                Archive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
