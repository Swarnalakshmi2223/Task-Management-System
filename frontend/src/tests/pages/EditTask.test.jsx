import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditTask from '../../pages/EditTask';

// Mock taskApi service
vi.mock('../../services/taskApi');
import { getTaskById, updateTask } from '../../services/taskApi';

const onBack = vi.fn();

// Realistic existing task fixture
const existingTask = {
  _id: 'task-xyz',
  title: 'Existing Task Title',
  description: 'Existing description text',
  priority: 'Medium',
  dueDate: '2026-10-05T00:00:00.000Z',
  status: 'In Progress',
};

describe('EditTask Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTaskById.mockResolvedValue({ data: { data: existingTask } });
  });

  it('1. Existing task data is loaded', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(getTaskById).toHaveBeenCalledWith('task-xyz');
    });
  });

  it('2. Existing title appears in the form', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/task title/i)).toHaveValue('Existing Task Title');
    });
  });

  it('3. Existing description appears', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description text');
    });
  });

  it('4. Existing priority appears', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/priority/i)).toHaveValue('Medium');
    });
  });

  it('5. Existing due date appears', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-10-05');
    });
  });

  it('6. Existing status appears', async () => {
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/status/i)).toHaveValue('In Progress');
    });
  });

  it('7. User can modify the fields', async () => {
    const user = userEvent.setup();
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const titleInput = screen.getByLabelText(/task title/i);
    const descInput = screen.getByLabelText(/description/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const dateInput = screen.getByLabelText(/due date/i);

    await user.clear(titleInput);
    await user.type(titleInput, 'Modified Title');
    await user.clear(descInput);
    await user.type(descInput, 'Modified Description');
    await user.selectOptions(prioritySelect, 'High');
    await user.selectOptions(statusSelect, 'Completed');
    fireEvent.change(dateInput, { target: { value: '2026-11-20' } });

    expect(titleInput).toHaveValue('Modified Title');
    expect(descInput).toHaveValue('Modified Description');
    expect(prioritySelect).toHaveValue('High');
    expect(statusSelect).toHaveValue('Completed');
    expect(dateInput).toHaveValue('2026-11-20');
  });

  it('8. Validation works', async () => {
    const user = userEvent.setup();
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const titleInput = screen.getByLabelText(/task title/i);
    await user.clear(titleInput);

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    });
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('9. Submitting valid changes calls PUT /tasks/:id through the API service', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({ data: { data: existingTask } });

    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledTimes(1);
    });
  });

  it('10. Correct updated task data is sent', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({ data: { data: {} } });

    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const titleInput = screen.getByLabelText(/task title/i);
    const descInput = screen.getByLabelText(/description/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const dateInput = screen.getByLabelText(/due date/i);

    await user.clear(titleInput);
    await user.type(titleInput, 'Fully Updated Title');
    await user.clear(descInput);
    await user.type(descInput, 'Fully Updated Description');
    await user.selectOptions(prioritySelect, 'High');
    await user.selectOptions(statusSelect, 'Completed');
    fireEvent.change(dateInput, { target: { value: '2026-12-15' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith('task-xyz', {
        title: 'Fully Updated Title',
        description: 'Fully Updated Description',
        priority: 'High',
        dueDate: '2026-12-15',
        status: 'Completed',
      });
    });
  });

  it('11. Successful update displays success feedback', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({ data: { data: {} } });

    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/task updated successfully! redirecting to dashboard/i)).toBeInTheDocument();
    });
  });

  it('12. Failed update displays an error message', async () => {
    const user = userEvent.setup();
    updateTask.mockRejectedValueOnce({
      response: { data: { message: 'Server database update error' } },
    });

    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Server database update error')).toBeInTheDocument();
    });
  });

  it('13. Loading state works correctly', async () => {
    // A) Initial fetch loading
    getTaskById.mockReturnValueOnce(new Promise(() => {}));
    const { unmount } = render(<EditTask taskId="task-xyz" onBack={onBack} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading task data/i)).toBeInTheDocument();

    unmount();

    // B) Saving state during update
    getTaskById.mockResolvedValueOnce({ data: { data: existingTask } });
    let resolveUpdate;
    updateTask.mockReturnValueOnce(new Promise((resolve) => { resolveUpdate = resolve; }));

    const user = userEvent.setup();
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByLabelText(/task title/i)).toBeDisabled();

    // Resolve update
    resolveUpdate({ data: { data: {} } });

    await waitFor(() => {
      expect(screen.getByText(/task updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error state when fetching task fails', async () => {
    getTaskById.mockRejectedValueOnce(new Error('Not found'));
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /failed to load task/i })).toBeInTheDocument();
    });
  });

  it('shows error when taskId is null', async () => {
    render(<EditTask taskId={null} onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('No task ID provided.')).toBeInTheDocument();
    });
  });

  it('clears field validation error when user types into the field', async () => {
    const user = userEvent.setup();
    render(<EditTask taskId="task-xyz" onBack={onBack} />);

    await waitFor(() => screen.getByLabelText(/task title/i));

    const titleInput = screen.getByLabelText(/task title/i);
    await user.clear(titleInput);

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    });

    await user.type(titleInput, 'New Title');
    expect(screen.queryByText(/task title is required/i)).not.toBeInTheDocument();
  });
});
