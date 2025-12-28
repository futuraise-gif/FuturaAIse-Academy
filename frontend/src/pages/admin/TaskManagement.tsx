import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  crmService,
  Task,
  TaskStatus,
  TaskPriority,
} from '@/services/crmService';

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await crmService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await crmService.updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    const colorMap: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-600',
    };
    return colorMap[status];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colorMap: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: 'bg-gray-100 text-gray-700',
      [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
      [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
      [TaskPriority.URGENT]: 'bg-red-100 text-red-700',
    };
    return colorMap[priority];
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    const iconMap: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: '⬇️',
      [TaskPriority.MEDIUM]: '➡️',
      [TaskPriority.HIGH]: '⬆️',
      [TaskPriority.URGENT]: '🔥',
    };
    return iconMap[priority];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const formatFullDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  let filteredTasks = tasks;
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
  }

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const overdueTasks = tasks.filter(
    t => t.status !== TaskStatus.COMPLETED && isOverdue(t.due_date)
  ).length;
  const dueTodayTasks = tasks.filter(
    t =>
      t.status !== TaskStatus.COMPLETED &&
      t.due_date &&
      new Date(t.due_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tasks & Follow-ups</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Task
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingTasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressTasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Due Today</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{dueTodayTasks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{overdueTasks}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filterStatus === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.values(TaskStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      filterStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Priority
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterPriority('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filterPriority === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.values(TaskPriority).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      filterPriority === priority
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getPriorityIcon(priority)} {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span
                              className={
                                isOverdue(task.due_date) && task.status !== TaskStatus.COMPLETED
                                  ? 'text-red-600 font-medium'
                                  : ''
                              }
                            >
                              {formatDate(task.due_date)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>Assigned to: {task.assigned_to_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>✍️</span>
                          <span>Created by: {task.created_by_name}</span>
                        </div>
                        {task.completed_at && (
                          <div className="flex items-center gap-1">
                            <span>✅</span>
                            <span>Completed: {formatFullDate(task.completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 capitalize"
                      >
                        {Object.values(TaskStatus).map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetails(true);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No tasks found
              </div>
            )}
          </div>
        )}

        {/* Task Details Modal */}
        {showTaskDetails && selectedTask && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedTask.title}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          selectedTask.priority
                        )}`}
                      >
                        {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          selectedTask.status
                        )}`}
                      >
                        {selectedTask.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTaskDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {selectedTask.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <p className="text-gray-900">{selectedTask.assigned_to_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created By
                    </label>
                    <p className="text-gray-900">{selectedTask.created_by_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <p className="text-gray-900">
                      {selectedTask.due_date
                        ? formatFullDate(selectedTask.due_date)
                        : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedTask.status.replace('_', ' ')}
                    </p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completed At
                      </label>
                      <p className="text-green-600 font-medium">
                        {formatFullDate(selectedTask.completed_at)}
                      </p>
                    </div>
                  )}
                </div>

                {(selectedTask.student_id || selectedTask.lead_id) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTask.student_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Related Student ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {selectedTask.student_id}
                        </p>
                      </div>
                    )}
                    {selectedTask.lead_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Related Lead ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {selectedTask.lead_id}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {formatFullDate(selectedTask.created_at)}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatFullDate(selectedTask.updated_at)}
                  </p>
                </div>

                {selectedTask.status !== TaskStatus.COMPLETED && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedTask.id, TaskStatus.COMPLETED);
                        setShowTaskDetails(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedTask.id, TaskStatus.IN_PROGRESS);
                        setShowTaskDetails(false);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Mark as In Progress
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchTasks();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function CreateTaskModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    due_date: '',
    assigned_to: '',
    assigned_to_name: '',
    student_id: '',
    lead_id: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.createTask(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To (User ID) *
              </label>
              <input
                type="text"
                required
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To Name *
              </label>
              <input
                type="text"
                required
                value={formData.assigned_to_name}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID (optional)
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Link to a student"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead ID (optional)
              </label>
              <input
                type="text"
                value={formData.lead_id}
                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Link to a lead"
              />
            </div>
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
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
