import { useState } from 'react';
import { courseService } from '@/services/courseService';

interface EnrollModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollModal({ onClose, onSuccess }: EnrollModalProps) {
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courseCode.trim()) {
      setError('Please enter a course code');
      return;
    }

    try {
      setLoading(true);
      const result = await courseService.selfEnroll(courseCode.toUpperCase().trim());
      alert(result.message);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Enroll in Course</h2>
          <p className="text-sm text-gray-600 mt-1">Enter the course code provided by your instructor</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., CS-101"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Course codes are case-insensitive and typically follow a format like "CS-101"
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
