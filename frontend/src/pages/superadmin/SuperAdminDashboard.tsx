import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateUserModal from '@/components/CreateUserModal';
import { superadminService, CreateUserDTO, SystemStatistics } from '@/services/superadminService';
import { User, UserRole, UserStatus } from '@/types';
import { useAuthStore } from '@/store/authStore.firebase';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showResetPassword, setShowResetPassword] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState({
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    search: '',
  });

  // Verify super admin access
  useEffect(() => {
    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, stats] = await Promise.all([
        superadminService.getAllUsers({
          role: filters.role || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
        }),
        superadminService.getStatistics(),
      ]);
      setUsers(usersData.users);
      setStatistics(stats);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserDTO) => {
    try {
      await superadminService.createUser(data);
      setShowCreateModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await superadminService.deleteUser(userId);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    try {
      await superadminService.updateUser(userId, { status });
      fetchData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await superadminService.exportUsersCSV({
        role: filters.role || undefined,
        status: filters.status || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export users to CSV');
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusUpdate = async (status: UserStatus) => {
    if (!confirm(`Update status for ${selectedUsers.size} users to ${status}?`)) {
      return;
    }

    try {
      await superadminService.bulkUpdateStatus(Array.from(selectedUsers), status);
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      fetchData();
      alert('Bulk status update completed!');
    } catch (error: any) {
      console.error('Failed to bulk update:', error);
      alert(error.response?.data?.error || 'Failed to bulk update users');
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Complete system control and user management</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={statistics.total_users} icon="👥" color="bg-blue-500" />
            <StatCard title="Students" value={statistics.students} icon="🎓" color="bg-green-500" />
            <StatCard title="Instructors" value={statistics.instructors} icon="👨‍🏫" color="bg-purple-500" />
            <StatCard title="Total Courses" value={statistics.total_courses} icon="📚" color="bg-yellow-500" />
            <StatCard title="Active Users" value={statistics.active_users} icon="✅" color="bg-emerald-500" />
            <StatCard title="Inactive Users" value={statistics.inactive_users} icon="⏸️" color="bg-gray-500" />
            <StatCard title="Suspended Users" value={statistics.suspended_users} icon="⛔" color="bg-red-500" />
            <StatCard title="Admins" value={statistics.admins + statistics.super_admins} icon="🔐" color="bg-indigo-500" />
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email, or ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | '' })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Roles</option>
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.INSTRUCTOR}>Instructor</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus | '' })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.INACTIVE}>Inactive</option>
                <option value={UserStatus.SUSPENDED}>Suspended</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              + Create User
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                {selectedUsers.size} users selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate(UserStatus.ACTIVE)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Set Active
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(UserStatus.INACTIVE)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                >
                  Set Inactive
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(UserStatus.SUSPENDED)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Suspend
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers(new Set());
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.student_id || user.instructor_id || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateStatus(user.id, e.target.value as UserStatus)}
                      className={`text-xs rounded-full px-2 py-1 font-semibold ${getStatusBadgeColor(user.status)}`}
                      disabled={user.id === currentUser?.id}
                    >
                      <option value={UserStatus.ACTIVE}>Active</option>
                      <option value={UserStatus.INACTIVE}>Inactive</option>
                      <option value={UserStatus.SUSPENDED}>Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setShowResetPassword(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Reset Password
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateUser}
          />
        )}

        {/* Reset Password Modal */}
        {showResetPassword && (
          <ResetPasswordModal
            user={showResetPassword}
            onClose={() => setShowResetPassword(null)}
            onReset={async (userId, password) => {
              await superadminService.resetPassword(userId, password);
              setShowResetPassword(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 text-white text-2xl mr-4`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Reset Password Modal
function ResetPasswordModal({
  user,
  onClose,
  onReset,
}: {
  user: User;
  onClose: () => void;
  onReset: (userId: string, password: string) => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    setNewPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReset(user.id, newPassword);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <p className="text-gray-600 mb-6">
          Reset password for <strong>{user.first_name} {user.last_name}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Generate
              </button>
            </div>
          </div>

          {newPassword && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Save this password and share it with the user securely.
              </p>
              <p className="text-sm font-mono bg-white px-2 py-1 rounded mt-2">{newPassword}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || !newPassword}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper functions
function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'bg-green-100 text-green-800';
    case UserRole.INSTRUCTOR:
      return 'bg-purple-100 text-purple-800';
    case UserRole.ADMIN:
      return 'bg-blue-100 text-blue-800';
    case UserRole.SUPER_ADMIN:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusBadgeColor(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case UserStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case UserStatus.SUSPENDED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
