import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore.firebase';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-gray-900">{user?.first_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-gray-900">{user?.last_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>

            {user?.student_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Number</label>
                <p className="mt-1 text-gray-900 font-mono">{user.student_id}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-gray-900 capitalize">{user?.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-gray-900 capitalize">{user?.status}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-gray-900">{new Date(user?.created_at!).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
