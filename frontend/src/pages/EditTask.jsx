import { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { getTaskById, updateTask } from '../services/taskApi';

function EditTask({ taskId, onBack }) {
  // ── Form State ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    priority:    'Medium',
    dueDate:     '',
    status:      'Pending',
  });

  // ── UI State ──────────────────────────────────────────────────────────────
  const [errors,     setErrors]     = useState({});
  const [fetching,   setFetching]   = useState(Boolean(taskId));
  const [loading,    setLoading]    = useState(false);
  const [fetchError, setFetchError] = useState(taskId ? '' : 'No task ID provided.');
  const [apiError,   setApiError]   = useState('');
  const [success,    setSuccess]    = useState(false);

  // ── Fetch existing task on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!taskId) {
      return;
    }

    const fetchTask = async () => {
      try {
        setFetching(true);
        const response = await getTaskById(taskId); // GET /api/tasks/:id
        const task = response.data.data;

        const formatted = task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '';

        setFormData({
          title:       task.title       || '',
          description: task.description || '',
          priority:    task.priority    || 'Medium',
          dueDate:     formatted,
          status:      task.status      || 'Pending',
        });
      } catch (err) {
        setFetchError('Failed to load task. Please go back and try again.');
        console.error('Fetch error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // ── Handle Input Changes ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim())       newErrors.title       = 'Task title is required.';
    if (!formData.description.trim()) newErrors.description = 'Task description is required.';
    if (!formData.dueDate)            newErrors.dueDate     = 'Due date is required.';
    return newErrors;
  };

  // ── Handle Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await updateTask(taskId, formData); // PUT /api/tasks/:id
      setSuccess(true);
      setTimeout(() => { onBack(); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update task. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading while fetching task ───────────────────────────────────────────
  if (fetching) {
    return (
      <div className="container py-5">
        <div className="loading-state">
          <output className="spinner-border text-primary">
            <span className="visually-hidden">Loading task...</span>
          </output>
          <p>Loading task data...</p>
        </div>
      </div>
    );
  }

  // ── Fetch Error ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-6">
            <div className="error-state mb-3">
              <div className="error-state-icon">
                <FiAlertCircle size={24} />
              </div>
              <h5>Failed to Load Task</h5>
              <p>{fetchError}</p>
            </div>
            <button className="btn btn-outline-secondary" onClick={onBack}>
              <FiArrowLeft size={14} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Edit Form ──────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-6">

          {/* Back button */}
          <button
            className="btn-back mb-3"
            onClick={onBack}
            disabled={loading}
            id="btn-back-edit"
          >
            <FiArrowLeft size={14} />
            Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="form-page-header">
            <h1>Edit Task</h1>
            <p className="form-page-subtitle">Update the task details below.</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
              <span>✓</span>
              <span>Task updated successfully! Redirecting to dashboard...</span>
            </div>
          )}

          {/* API Error Alert */}
          {apiError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <span>✕</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="form-card">
            <form onSubmit={handleSubmit} noValidate>

              {/* Title */}
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-title">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label" htmlFor="edit-description">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={3}
                  placeholder="Describe the task"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              {/* Priority + Due Date — side by side */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="edit-priority">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    id="edit-priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="edit-dueDate">
                    Due Date <span className="text-danger">*</span>
                  </label>
                  <input
                    id="edit-dueDate"
                    type="date"
                    name="dueDate"
                    className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
                    value={formData.dueDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.dueDate && (
                    <div className="invalid-feedback">{errors.dueDate}</div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <hr className="divider" />

              {/* Buttons */}
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted small mb-0">
                  <span className="text-danger">*</span> Required fields
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                    disabled={loading}
                    id="btn-cancel-edit"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    id="btn-submit-edit"
                  >
                    {loading ? (
                      <>
                        <output className="spinner-border spinner-border-sm" />{' '}
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditTask;
