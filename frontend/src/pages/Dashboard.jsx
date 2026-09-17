import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus, FiX, FiAlertCircle, FiClipboard } from 'react-icons/fi';
import TaskSummary from '../components/TaskSummary';
import TaskCard    from '../components/TaskCard';
import { getAllTasks, deleteTask, updateTask } from '../services/taskApi';

function Dashboard({ onAddTask, onEditTask }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [deletingId,     setDeletingId]     = useState(null);
  const [updatingId,     setUpdatingId]     = useState(null);
  const [toast,          setToast]          = useState({ show: false, message: '', type: '' });

  // Track mounted state to prevent setState after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      if (isMounted.current) setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ── Fetch tasks on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAllTasks();
        setTasks(response.data.data);
      } catch (err) {
        setError('Unable to load tasks. Please make sure the backend is running.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // ── Handle Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      showToast('Task deleted successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to delete task. Please try again.';
      showToast(msg, 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handle Status Change ──────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const response = await updateTask(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? response.data.data : t)));
      showToast(`Status updated to "${newStatus}".`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      showToast(msg, 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const resetFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterPriority('All');
  };

  const isFiltered = search !== '' || filterStatus !== 'All' || filterPriority !== 'All';

  const filteredTasks = tasks.filter((task) => {
    const matchSearch   = task.title.toLowerCase().includes(search.toLowerCase()) ||
                          task.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus   === 'All' || task.status   === filterStatus;
    const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container py-4">

      {/* ── Toast Notification ───────────────────────────────────────────── */}
      {toast.show && (
        <div
          className={`alert alert-${toast.type} alert-dismissible d-flex align-items-center gap-2 mb-3`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setToast({ show: false, message: '', type: '' })}
          />
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="page-header-section">
        <div>
          <h1>Task Management</h1>
          <p className="page-subtitle">Manage, organize and track your tasks efficiently.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddTask} id="btn-add-task">
          <FiPlus size={15} strokeWidth={2.5} />
          Add Task
        </button>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <TaskSummary tasks={tasks} />

      {/* ── Toolbar: Search + Filters ─────────────────────────────────────── */}
      <div className="toolbar-section">
        <div className="row g-2 align-items-center">

          {/* Search */}
          <div className="col-12 col-md-5">
            <div className="search-wrapper">
              <span className="search-icon">
                <FiSearch size={15} />
              </span>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search tasks by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-tasks"
              />
            </div>
          </div>

          {/* Filter by Status */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="filter-status"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Filter by Priority */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              id="filter-priority"
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Clear Filters — only visible when active */}
          {isFiltered && (
            <div className="col-auto">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={resetFilters}
                title="Clear all filters"
                id="btn-clear-filters"
              >
                <FiX size={14} />
                Clear
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Loading State ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Fetching your tasks...</p>
        </div>
      )}

      {/* ── Error State ───────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="error-state">
          <div className="error-state-icon">
            <FiAlertCircle size={24} />
          </div>
          <h5>Unable to load tasks</h5>
          <p>{error}</p>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiClipboard size={26} />
          </div>
          {tasks.length === 0 ? (
            <>
              <h5>No tasks yet</h5>
              <p>Create your first task to start managing your work.</p>
              <button className="btn btn-primary btn-sm" onClick={onAddTask}>
                <FiPlus size={14} />
                Add Task
              </button>
            </>
          ) : (
            <>
              <h5>No matching tasks</h5>
              <p>Try changing your search term or adjusting the filters.</p>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                <FiX size={13} />
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Task List ─────────────────────────────────────────────────────── */}
      {!loading && !error && filteredTasks.length > 0 && (
        <>
          <div className="task-list-header">
            <span className="task-count">
              Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              {isFiltered ? ' (filtered)' : ''}
            </span>
          </div>

          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={handleDelete}
              onEdit={onEditTask}
              onStatusChange={handleStatusChange}
              deletingId={deletingId}
              updatingId={updatingId}
            />
          ))}
        </>
      )}

    </div>
  );
}

export default Dashboard;
