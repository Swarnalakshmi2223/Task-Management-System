import { useState } from 'react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { createTask } from '../services/taskApi';

function AddTask({ onBack }) {
  // ── Form State ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    priority:    'Medium',
    dueDate:     '',
    status:      'Pending',
  });

  // ── UI State ──────────────────────────────────────────────────────────────
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState(false);

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
    if (!formData.priority)           newErrors.priority    = 'Priority is required.';
    if (!formData.dueDate)            newErrors.dueDate     = 'Due date is required.';
    if (!formData.status)             newErrors.status      = 'Status is required.';
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
      await createTask(formData); // POST /api/tasks
      setSuccess(true);
      setTimeout(() => { onBack(); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to create task. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-6">

          {/* Back button */}
          <button
            className="btn-back mb-3"
            onClick={onBack}
            disabled={loading}
            id="btn-back-add"
          >
            <FiArrowLeft size={14} />
            Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="form-page-header">
            <h1>Add New Task</h1>
            <p className="form-page-subtitle">Create a task and keep your work organized.</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
              <span>✓</span>
              <span>Task created successfully! Redirecting to dashboard...</span>
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
                <label className="form-label" htmlFor="add-title">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  id="add-title"
                  type="text"
                  name="title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Complete MERN project"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label" htmlFor="add-description">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="add-description"
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={3}
                  placeholder="Describe what needs to be done..."
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
                  <label className="form-label" htmlFor="add-priority">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    id="add-priority"
                    name="priority"
                    className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.priority && (
                    <div className="invalid-feedback">{errors.priority}</div>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="add-dueDate">
                    Due Date <span className="text-danger">*</span>
                  </label>
                  <input
                    id="add-dueDate"
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
                <label className="form-label" htmlFor="add-status">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  id="add-status"
                  name="status"
                  className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
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
                    id="btn-cancel-add"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    id="btn-submit-add"
                  >
                    {loading ? (
                      <>
                        <output className="spinner-border spinner-border-sm" />{' '}
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiPlus size={14} strokeWidth={2.5} />
                        Create Task
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

export default AddTask;
