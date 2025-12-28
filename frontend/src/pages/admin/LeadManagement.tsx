import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  crmService,
  Lead,
  LeadStatus,
  LeadSource,
} from '@/services/crmService';

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await crmService.updateLeadStatus(leadId, newStatus);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleConvertToStudent = async (leadId: string) => {
    try {
      const result = await crmService.convertLeadToStudent(leadId, {});
      alert(`Lead converted to student successfully! Student ID: ${result.student_id}`);
      fetchLeads();
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to student');
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const colorMap: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'bg-blue-500',
      [LeadStatus.CONTACTED]: 'bg-yellow-500',
      [LeadStatus.QUALIFIED]: 'bg-purple-500',
      [LeadStatus.PROPOSAL_SENT]: 'bg-indigo-500',
      [LeadStatus.NEGOTIATION]: 'bg-orange-500',
      [LeadStatus.CONVERTED]: 'bg-green-500',
      [LeadStatus.LOST]: 'bg-red-500',
    };
    return colorMap[status];
  };

  const getLeadSourceIcon = (source: LeadSource) => {
    const iconMap: Record<LeadSource, string> = {
      [LeadSource.WEBSITE]: '🌐',
      [LeadSource.REFERRAL]: '👥',
      [LeadSource.SOCIAL_MEDIA]: '📱',
      [LeadSource.EMAIL_CAMPAIGN]: '📧',
      [LeadSource.PHONE_INQUIRY]: '📞',
      [LeadSource.WALK_IN]: '🚶',
      [LeadSource.EVENT]: '🎪',
      [LeadSource.OTHER]: '📌',
    };
    return iconMap[source];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div
      className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedLead(lead);
        setShowLeadDetails(true);
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">
            {lead.first_name} {lead.last_name}
          </h4>
          <p className="text-sm text-gray-600">{lead.email}</p>
        </div>
        <span className="text-xl">{getLeadSourceIcon(lead.source)}</span>
      </div>

      {lead.phone && (
        <p className="text-sm text-gray-600 mb-2">📱 {lead.phone}</p>
      )}

      {lead.score !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Lead Score</span>
            <span className="font-semibold">{lead.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${lead.score}%` }}
            ></div>
          </div>
        </div>
      )}

      {lead.assigned_to_name && (
        <p className="text-xs text-gray-500 mt-2">
          👤 Assigned to: {lead.assigned_to_name}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Created: {formatDate(lead.created_at)}
      </p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <div className="flex gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  viewMode === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-gray-700'
                }`}
                onClick={() => setViewMode('pipeline')}
              >
                Pipeline
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-700'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Lead
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading leads...</div>
          </div>
        ) : viewMode === 'pipeline' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {Object.values(LeadStatus).map((status) => {
              const statusLeads = getLeadsByStatus(status);
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                      <h3 className="font-semibold text-gray-900 capitalize text-sm">
                        {status.replace('_', ' ')}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600">{statusLeads.length} leads</p>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {statusLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      {lead.phone && (
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xl">{getLeadSourceIcon(lead.source)}</span>
                      <span className="ml-2 text-sm text-gray-600 capitalize">
                        {lead.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 capitalize"
                      >
                        {Object.values(LeadStatus).map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${lead.score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{lead.score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lead.assigned_to_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadDetails(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      {lead.status !== LeadStatus.CONVERTED && (
                        <button
                          onClick={() => handleConvertToStudent(lead.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lead Details Modal */}
        {showLeadDetails && selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedLead.first_name} {selectedLead.last_name}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedLead.email}</p>
                  </div>
                  <button
                    onClick={() => setShowLeadDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <p className="text-gray-900 capitalize">
                      {getLeadSourceIcon(selectedLead.source)}{' '}
                      {selectedLead.source.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm text-white ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Score
                    </label>
                    <p className="text-gray-900">{selectedLead.score || 0}/100</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <p className="text-gray-900">
                      {selectedLead.assigned_to_name || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Enrollment
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedLead.expected_enrollment_date)}
                    </p>
                  </div>
                </div>

                {selectedLead.interested_courses && selectedLead.interested_courses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interested Courses
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.interested_courses.map((course, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(selectedLead.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDate(selectedLead.updated_at)}
                  </div>
                  {selectedLead.last_contacted && (
                    <div>
                      <span className="font-medium">Last Contacted:</span>{' '}
                      {formatDate(selectedLead.last_contacted)}
                    </div>
                  )}
                </div>

                {selectedLead.status !== LeadStatus.CONVERTED && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleConvertToStudent(selectedLead.id);
                        setShowLeadDetails(false);
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Convert to Student
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Lead Modal */}
        {showCreateModal && (
          <CreateLeadModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchLeads();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function CreateLeadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: LeadSource.WEBSITE,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.createLead(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Create New Lead</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source *
            </label>
            <select
              required
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(LeadSource).map((source) => (
                <option key={source} value={source}>
                  {source.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
