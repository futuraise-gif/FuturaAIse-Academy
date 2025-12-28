import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { attendanceService, courseService, moduleService } from '@/services/instructorService';
import { AttendanceRecord, AttendanceStatus, AttendanceMethod } from '@/types/instructor.types';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface StudentAttendanceForm extends Student {
  status: AttendanceStatus;
  notes: string;
}

interface AttendanceFilter {
  startDate: string;
  endDate: string;
  moduleId: string;
  studentId: string;
}

interface AttendanceSummary {
  student_id: string;
  student_name: string;
  student_email: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
}

export default function Attendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mark' | 'records'>('mark');

  // Course and module data
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);

  // Student data
  const [students, setStudents] = useState<Student[]>([]);
  const [studentForms, setStudentForms] = useState<StudentAttendanceForm[]>([]);

  // Mark attendance form
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);

  // View records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [filter, setFilter] = useState<AttendanceFilter>({
    startDate: '',
    endDate: '',
    moduleId: '',
    studentId: '',
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch students and modules when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchModules();
      if (activeTab === 'records') {
        fetchAttendanceRecords();
        fetchAttendanceSummary();
      }
    } else {
      setStudents([]);
      setStudentForms([]);
      setModules([]);
      setLiveSessions([]);
    }
  }, [selectedCourse]);

  // Update live sessions when module changes
  useEffect(() => {
    if (selectedModule) {
      const module = modules.find((m) => m.id === selectedModule);
      setLiveSessions(module?.live_sessions || []);
    } else {
      setLiveSessions([]);
      setSelectedSession('');
    }
  }, [selectedModule, modules]);

  // Initialize student forms when students load
  useEffect(() => {
    if (students.length > 0) {
      setStudentForms(
        students.map((student) => ({
          ...student,
          status: AttendanceStatus.PRESENT,
          notes: '',
        }))
      );
    }
  }, [students]);

  // Apply filters to records
  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, filter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch (err: any) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await courseService.getEnrolledStudents(selectedCourse);
      setStudents(
        data.map((s: any) => ({
          id: s.id || s.student_id,
          name: s.name || s.student_name || `${s.first_name} ${s.last_name}`,
          email: s.email || s.student_email,
        }))
      );
    } catch (err: any) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const data = await moduleService.getCourseModules(selectedCourse);
      setModules(data);
    } catch (err: any) {
      console.error('Failed to load modules:', err);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getCourseAttendance(selectedCourse);
      setAttendanceRecords(data);
    } catch (err: any) {
      setError('Failed to load attendance records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const data = await attendanceService.getCourseAttendanceSummary(selectedCourse);
      setAttendanceSummary(data);
    } catch (err: any) {
      console.error('Failed to load attendance summary:', err);
    }
  };

  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentForms((prev) =>
      prev.map((form) =>
        form.id === studentId ? { ...form, status } : form
      )
    );
  };

  const handleStudentNotesChange = (studentId: string, notes: string) => {
    setStudentForms((prev) =>
      prev.map((form) =>
        form.id === studentId ? { ...form, notes } : form
      )
    );
  };

  const handleBulkMark = () => {
    setStudentForms((prev) =>
      prev.map((form) => ({ ...form, status: bulkStatus }))
    );
  };

  const handleSubmitAttendance = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (!attendanceDate) {
      setError('Please select a date');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const attendanceData = studentForms.map((form) => ({
        student_id: form.id,
        course_id: selectedCourse,
        module_id: selectedModule || undefined,
        live_session_id: selectedSession || undefined,
        status: form.status,
        method: AttendanceMethod.MANUAL,
        marked_at: attendanceDate,
        notes: form.notes || undefined,
      }));

      await attendanceService.bulkMarkAttendance({
        attendance_records: attendanceData,
      });

      setSuccess(`Successfully marked attendance for ${studentForms.length} students`);

      // Reset form
      setStudentForms(
        students.map((student) => ({
          ...student,
          status: AttendanceStatus.PRESENT,
          notes: '',
        }))
      );

      // Refresh records if on that tab
      if (activeTab === 'records') {
        await fetchAttendanceRecords();
        await fetchAttendanceSummary();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (filter.startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.marked_at) >= new Date(filter.startDate)
      );
    }

    if (filter.endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.marked_at) <= new Date(filter.endDate)
      );
    }

    if (filter.moduleId) {
      filtered = filtered.filter((record) => record.module_id === filter.moduleId);
    }

    if (filter.studentId) {
      filtered = filtered.filter((record) => record.student_id === filter.studentId);
    }

    setFilteredRecords(filtered);
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      setError('No records to export');
      return;
    }

    const headers = [
      'Student Name',
      'Student Email',
      'Date',
      'Status',
      'Module',
      'Live Session',
      'Method',
      'Duration (min)',
      'Notes',
    ];

    const rows = filteredRecords.map((record) => [
      record.student_name,
      record.student_email,
      new Date(record.marked_at).toLocaleDateString(),
      record.status,
      record.module_id || 'N/A',
      record.live_session_id || 'N/A',
      record.method,
      record.duration_minutes || 'N/A',
      record.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `attendance_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess('Attendance records exported successfully');
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800';
      case AttendanceStatus.LATE:
        return 'bg-yellow-100 text-yellow-800';
      case AttendanceStatus.EXCUSED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendancePercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-700 font-semibold';
    if (percentage >= 80) return 'text-blue-700 font-semibold';
    if (percentage >= 70) return 'text-yellow-700 font-semibold';
    if (percentage >= 60) return 'text-orange-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Mark and track student attendance</p>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedModule('');
              setSelectedSession('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.course_code || course.id})
              </option>
            ))}
          </select>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {selectedCourse && (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('mark')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'mark'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Mark Attendance
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('records');
                      fetchAttendanceRecords();
                      fetchAttendanceSummary();
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'records'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    View Records
                  </button>
                </div>
              </div>

              {/* Mark Attendance Tab */}
              {activeTab === 'mark' && (
                <div className="p-6">
                  {/* Attendance Form Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module (Optional)
                      </label>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Modules</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Session (Optional)
                      </label>
                      <select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        disabled={!selectedModule || liveSessions.length === 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      >
                        <option value="">No Specific Session</option>
                        {liveSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.title} ({new Date(session.scheduled_at).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">
                        Bulk Mark All Students:
                      </span>
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value as AttendanceStatus)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={AttendanceStatus.PRESENT}>Present</option>
                        <option value={AttendanceStatus.ABSENT}>Absent</option>
                        <option value={AttendanceStatus.LATE}>Late</option>
                        <option value={AttendanceStatus.EXCUSED}>Excused</option>
                      </select>
                      <button
                        onClick={handleBulkMark}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                      >
                        Apply to All
                      </button>
                    </div>
                  </div>

                  {/* Student List */}
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No students enrolled in this course
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Student
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentForms.map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {student.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex justify-center gap-2">
                                    {Object.values(AttendanceStatus).map((status) => (
                                      <button
                                        key={status}
                                        onClick={() =>
                                          handleStudentStatusChange(student.id, status)
                                        }
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                          student.status === status
                                            ? getStatusColor(status)
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <input
                                    type="text"
                                    value={student.notes}
                                    onChange={(e) =>
                                      handleStudentNotesChange(student.id, e.target.value)
                                    }
                                    placeholder="Optional notes"
                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Submit Button */}
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSubmitAttendance}
                          disabled={saving || students.length === 0}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : 'Submit Attendance'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* View Records Tab */}
              {activeTab === 'records' && (
                <div className="p-6">
                  {/* Filters */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={filter.startDate}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={filter.endDate}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Module</label>
                        <select
                          value={filter.moduleId}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, moduleId: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">All Modules</option>
                          {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                              {module.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Student</label>
                        <select
                          value={filter.studentId}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, studentId: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">All Students</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setFilter({
                            startDate: '',
                            endDate: '',
                            moduleId: '',
                            studentId: '',
                          })
                        }
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={handleExportCSV}
                        disabled={filteredRecords.length === 0}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                      >
                        Export to CSV
                      </button>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  {attendanceSummary.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Attendance Summary
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                Student
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Total Sessions
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Present
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Absent
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Late
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Excused
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Attendance %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceSummary.map((summary) => (
                              <tr key={summary.student_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {summary.student_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {summary.student_email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                  {summary.total_sessions}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {summary.present}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    {summary.absent}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                    {summary.late}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {summary.excused}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span
                                    className={`text-lg ${getAttendancePercentageColor(
                                      summary.attendance_percentage
                                    )}`}
                                  >
                                    {summary.attendance_percentage.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Attendance Records Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Attendance Records ({filteredRecords.length})
                    </h3>
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : filteredRecords.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No attendance records found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                Student
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                Module
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Method
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                                Duration
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(record.marked_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.student_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {record.student_email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                      record.status
                                    )}`}
                                  >
                                    {record.status.charAt(0).toUpperCase() +
                                      record.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {record.module_id
                                    ? modules.find((m) => m.id === record.module_id)
                                        ?.title || record.module_id
                                    : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                  {record.method}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                  {record.duration_minutes
                                    ? `${record.duration_minutes} min`
                                    : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {record.notes || '-'}
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
            </div>
          </>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving attendance...
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
