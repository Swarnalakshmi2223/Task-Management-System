import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

// TaskCard — compact, professional task card with icons and clean layout
function TaskCard({ task, onDelete, onEdit, onStatusChange, deletingId, updatingId }) {
  const isDeleting = deletingId === task._id;
  const isUpdating = updatingId === task._id;
  const isBusy     = isDeleting || isUpdating;

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <div className={`task-card${isBusy ? ' opacity-50' : ''}`}>
      <div className="task-card-body">

        {/* ── Row 1: Title + Priority Badge ──────────────────────────────── */}
        <div className="task-card-row1">
          <h6 className="task-title">{task.title}</h6>
          <span className={`priority-badge priority-${task.priority}`}>
            {task.priority}
          </span>
        </div>

        {/* ── Row 2: Description ─────────────────────────────────────────── */}
        <p className="task-desc">{task.description}</p>

        {/* ── Row 3: Due Date + Status Select ────────────────────────────── */}
        <div className="task-card-row3">
          <span className="task-date">
            <FiCalendar size={13} />
            {formattedDate}
          </span>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm status-select"
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              disabled={isBusy}
              aria-label="Update task status"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            {isUpdating && (
              <span className="spinner-border spinner-border-sm text-primary" role="status" />
            )}
          </div>
        </div>

        {/* ── Row 4: Action Buttons ───────────────────────────────────────── */}
        <div className="task-card-row4">
          <div className="task-actions">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(task._id)}
              disabled={isBusy}
              aria-label="Edit task"
            >
              <FiEdit2 size={13} />
              Edit
            </button>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(task._id)}
              disabled={isBusy}
              aria-label="Delete task"
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 size={13} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TaskCard;
