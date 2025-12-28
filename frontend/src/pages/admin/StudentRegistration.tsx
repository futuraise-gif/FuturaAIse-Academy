import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { adminStudentService, StudentRegistrationDTO, BillingRecord } from '@/services/adminStudentService';
import { User, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore.firebase';
import { courseService } from '@/services/courseService';

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function StudentRegistration() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'register' | 'manage' | 'billing'>('register');
  const [students, setStudents] = useState<User[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Registration form state
  const [formData, setFormData] = useState<StudentRegistrationDTO>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    enroll_in_courses: [],
  });

  // Billing form state
  const [billingFormData, setBillingFormData] = useState({
    student_id: '',
    amount: '',
    currency: 'USD',
    description: '',
    due_date: '',
    notes: '',
  });

  // Verify admin or super admin access
  useEffect(() => {
    if (
      currentUser?.role !== UserRole.ADMIN &&
      currentUser?.role !== UserRole.SUPER_ADMIN
    ) {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchCourses();
    if (activeTab === 'manage') {
      fetchStudents();
    } else if (activeTab === 'billing') {
      fetchBillingRecords();
    }
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await adminStudentService.getAllStudents();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingRecords = async () => {
    try {
      setLoading(true);
      const data = await adminStudentService.getAllBillingRecords();
      setBillingRecords(data.billing_records || []);
    } catch (error) {
      console.error('Failed to fetch billing records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await adminStudentService.registerStudent(formData);
      alert(
        `Student registered successfully!\nStudent ID: ${result.credentials.student_id}\nEmail: ${result.credentials.email}`
      );
      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        enroll_in_courses: [],
      });
    } catch (error: any) {
      console.error('Failed to register student:', error);
      alert(error.response?.data?.error || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminStudentService.createBillingRecord({
        ...billingFormData,
        amount: parseFloat(billingFormData.amount),
      });
      alert('Billing record created successfully!');
      // Reset form
      setBillingFormData({
        student_id: '',
        amount: '',
        currency: 'USD',
        description: '',
        due_date: '',
        notes: '',
      });
      fetchBillingRecords();
    } catch (error: any) {
      console.error('Failed to create billing record:', error);
      alert(error.response?.data?.error || 'Failed to create billing record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBillingStatus = async (
    billingId: string,
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  ) => {
    try {
      await adminStudentService.updateBillingStatus(billingId, { status });
      alert('Billing status updated successfully!');
      fetchBillingRecords();
    } catch (error: any) {
      console.error('Failed to update billing status:', error);
      alert(error.response?.data?.error || 'Failed to update billing status');
    }
  };

  const handleDeleteBilling = async (billingId: string) => {
    if (!confirm('Are you sure you want to delete this billing record?')) {
      return;
    }
    try {
      await adminStudentService.deleteBillingRecord(billingId);
      alert('Billing record deleted successfully!');
      fetchBillingRecords();
    } catch (error: any) {
      console.error('Failed to delete billing record:', error);
      alert(error.response?.data?.error || 'Failed to delete billing record');
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      enroll_in_courses: prev.enroll_in_courses?.includes(courseId)
        ? prev.enroll_in_courses.filter((id) => id !== courseId)
        : [...(prev.enroll_in_courses || []), courseId],
    }));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Student Registration & Billing</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register Student
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'manage'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Students
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'billing'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing Management
          </button>
        </div>

        {/* Register Student Tab */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Register New Student</h2>
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({ ...formData, date_of_birth: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.emergency_contact_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.emergency_contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.guardian_name}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.guardian_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.guardian_email}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Course Enrollment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enroll in Courses (Optional)
                </label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-gray-500">No courses available</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <label key={course.id} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.enroll_in_courses?.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-600">
                              {course.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Students Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Students</h2>
            {loading ? (
              <p>Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-gray-500">No students found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Student ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{student.student_id}</td>
                        <td className="px-4 py-2">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-4 py-2">{student.email}</td>
                        <td className="px-4 py-2">{student.phone || '-'}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              student.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Billing Management Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Create Billing Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Create Billing Record</h2>
              <form onSubmit={handleCreateBilling} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Student *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.student_id}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          student_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.student_id} - {student.first_name}{' '}
                          {student.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.amount}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Currency *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.currency}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.due_date}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.description}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={billingFormData.notes}
                      onChange={(e) =>
                        setBillingFormData({
                          ...billingFormData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Billing Record'}
                  </button>
                </div>
              </form>
            </div>

            {/* Billing Records List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Billing Records</h2>
              {loading ? (
                <p>Loading billing records...</p>
              ) : billingRecords.length === 0 ? (
                <p className="text-gray-500">No billing records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Student</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Due Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingRecords.map((record) => (
                        <tr key={record.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div className="font-medium">{record.student_name}</div>
                            <div className="text-sm text-gray-600">
                              {record.student_email}
                            </div>
                          </td>
                          <td className="px-4 py-2">{record.description}</td>
                          <td className="px-4 py-2">
                            {record.currency} {record.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(record.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <select
                              className={`px-2 py-1 rounded-full text-xs border-0 ${
                                record.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : record.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                              value={record.status}
                              onChange={(e) =>
                                handleUpdateBillingStatus(
                                  record.id,
                                  e.target.value as any
                                )
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleDeleteBilling(record.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
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
      </div>
    </DashboardLayout>
  );
}
