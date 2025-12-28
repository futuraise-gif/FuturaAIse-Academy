import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { crmService, DashboardStats, LeadStatus, ActivityType } from '@/services/crmService';

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await crmService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching CRM dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    const iconMap: Record<ActivityType, string> = {
      [ActivityType.LEAD_CREATED]: '➕',
      [ActivityType.LEAD_STATUS_CHANGED]: '🔄',
      [ActivityType.LEAD_ASSIGNED]: '👤',
      [ActivityType.COMMUNICATION_LOGGED]: '💬',
      [ActivityType.STUDENT_REGISTERED]: '🎓',
      [ActivityType.STAGE_CHANGED]: '📊',
      [ActivityType.COURSE_ENROLLED]: '📚',
      [ActivityType.COURSE_COMPLETED]: '✅',
      [ActivityType.PAYMENT_RECEIVED]: '💰',
      [ActivityType.INVOICE_GENERATED]: '📄',
      [ActivityType.DOCUMENT_UPLOADED]: '📎',
      [ActivityType.NOTE_ADDED]: '📝',
      [ActivityType.TASK_CREATED]: '📋',
      [ActivityType.TASK_COMPLETED]: '✔️',
    };
    return iconMap[type] || '📌';
  };

  const getLeadStatusColor = (status: LeadStatus) => {
    const colorMap: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
      [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
      [LeadStatus.QUALIFIED]: 'bg-purple-100 text-purple-800',
      [LeadStatus.PROPOSAL_SENT]: 'bg-indigo-100 text-indigo-800',
      [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
      [LeadStatus.CONVERTED]: 'bg-green-100 text-green-800',
      [LeadStatus.LOST]: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading CRM Dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <div className="flex gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Create Lead
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Create Invoice
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.total_leads || 0}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Conversion Rate: {stats?.conversion_rate?.toFixed(1) || 0}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ${stats?.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              This month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  ${stats?.pending_payments?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
            <p className="text-sm text-red-500 mt-4">
              {stats?.overdue_invoices || 0} overdue invoices
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats?.tasks_pending || 0}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
            <p className="text-sm text-orange-500 mt-4">
              {stats?.tasks_due_today || 0} due today
            </p>
          </div>
        </div>

        {/* Lead Pipeline Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(LeadStatus).map(([key, status]) => (
              <div key={status} className="text-center">
                <div className={`rounded-lg p-4 ${getLeadStatusColor(status)}`}>
                  <p className="text-2xl font-bold">
                    {stats?.leads_by_status?.[status] || 0}
                  </p>
                  <p className="text-xs font-medium mt-1 capitalize">
                    {status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.recent_activities && stats.recent_activities.length > 0 ? (
              stats.recent_activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {activity.created_by_name && (
                          <span>By {activity.created_by_name}</span>
                        )}
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                <span>➕</span> Create New Lead
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                <span>💬</span> Log Communication
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                <span>📋</span> Create Task
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                <span>📄</span> Generate Invoice
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Leads</span>
                <span className="font-semibold text-indigo-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversions</span>
                <span className="font-semibold text-green-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payments Received</span>
                <span className="font-semibold text-green-600">$15,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasks Completed</span>
                <span className="font-semibold text-blue-600">18</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">Follow-up calls</p>
                <p className="text-gray-600">8 scheduled for today</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Invoices Due</p>
                <p className="text-gray-600">3 invoices due this week</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Payment Plans</p>
                <p className="text-gray-600">5 installments due</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
