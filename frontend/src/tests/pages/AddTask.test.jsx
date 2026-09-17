import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddTask from '../../pages/AddTask';

// Mock taskApi
vi.mock('../../services/taskApi');
import { createTask } from '../../services/taskApi';

const defaultProps = {
  onBack: vi.fn(),
};

describe('AddTask Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Form renders correctly', () => {
    render(<AddTask {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /add new task/i })).toBeInTheDocument();
    expect(screen.getByText(/create a task and keep your work organized/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('2. All required fields are present', () => {
    render(<AddTask {...defaultProps} />);

    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('3. User can type a task title', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    const titleInput = screen.getByLabelText(/task title/i);
    await user.type(titleInput, 'Implement JWT Authentication');

    expect(titleInput).toHaveValue('Implement JWT Authentication');
  });

  it('4. User can type a description', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, 'Secure routes using access and refresh tokens.');

    expect(descInput).toHaveValue('Secure routes using access and refresh tokens.');
  });

  it('5. User can select priority', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.selectOptions(prioritySelect, 'High');

    expect(prioritySelect).toHaveValue('High');
  });

  it('6. User can select status', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, 'In Progress');

    expect(statusSelect).toHaveValue('In Progress');
  });

  it('7. User can select a due date', () => {
    render(<AddTask {...defaultProps} />);

    const dateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });

    expect(dateInput).toHaveValue('2026-10-15');
  });

  it('8. Submitting empty form shows validation messages', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/task description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });
    expect(createTask).not.toHaveBeenCalled();
  });

  it('9. Missing title shows title validation', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/description/i), 'Valid description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/task description is required/i)).not.toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
  });

  it('10. Missing description shows description validation', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Valid Title');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/task description is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/task title is required/i)).not.toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
  });

  it('11. Missing priority shows priority validation', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Valid Title');
    await user.type(screen.getByLabelText(/description/i), 'Valid description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    // Deselect priority
    await user.selectOptions(screen.getByLabelText(/priority/i), '');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/priority is required/i)).toBeInTheDocument();
    });
    expect(createTask).not.toHaveBeenCalled();
  });

  it('12. Missing due date shows due date validation', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Valid Title');
    await user.type(screen.getByLabelText(/description/i), 'Valid description');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });
    expect(createTask).not.toHaveBeenCalled();
  });

  it('13. Missing status shows status validation', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Valid Title');
    await user.type(screen.getByLabelText(/description/i), 'Valid description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    // Deselect status
    await user.selectOptions(screen.getByLabelText(/status/i), '');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/status is required/i)).toBeInTheDocument();
    });
    expect(createTask).not.toHaveBeenCalled();
  });

  it('14. Valid form submission calls the POST API', async () => {
    const user = userEvent.setup();
    createTask.mockResolvedValueOnce({ data: { data: {} } });

    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Deploy Backend');
    await user.type(screen.getByLabelText(/description/i), 'Deploy to cloud server');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-20' } });

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledTimes(1);
    });
  });

  it('15. Correct task data is sent to the API', async () => {
    const user = userEvent.setup();
    createTask.mockResolvedValueOnce({ data: { data: {} } });

    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Implement End-to-End Tests');
    await user.type(screen.getByLabelText(/description/i), 'Write automated browser test suite');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'High');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-11-01' } });
    await user.selectOptions(screen.getByLabelText(/status/i), 'In Progress');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'Implement End-to-End Tests',
        description: 'Write automated browser test suite',
        priority: 'High',
        dueDate: '2026-11-01',
        status: 'In Progress',
      });
    });
  });

  it('16. Successful API response displays success feedback', async () => {
    const user = userEvent.setup();
    createTask.mockResolvedValueOnce({ data: { data: {} } });

    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Test Task');
    await user.type(screen.getByLabelText(/description/i), 'Task Description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/task created successfully! redirecting to dashboard/i)).toBeInTheDocument();
    });
  });

  it('17. Failed API response displays an error message', async () => {
    const user = userEvent.setup();
    createTask.mockRejectedValueOnce({
      response: { data: { message: 'Database connection error' } },
    });

    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Test Task');
    await user.type(screen.getByLabelText(/description/i), 'Task Description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText('Database connection error')).toBeInTheDocument();
    });
  });

  it('18. Submit button/loading state behaves correctly', async () => {
    const user = userEvent.setup();
    let resolvePromise;
    createTask.mockReturnValueOnce(new Promise((resolve) => { resolvePromise = resolve; }));

    render(<AddTask {...defaultProps} />);

    await user.type(screen.getByLabelText(/task title/i), 'Test Task');
    await user.type(screen.getByLabelText(/description/i), 'Task Description');
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    await user.click(submitBtn);

    // During loading:
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByLabelText(/task title/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();

    // Resolve API call
    resolvePromise({ data: { data: {} } });

    await waitFor(() => {
      expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
    });
  });

  it('19. Clears field validation error when user types into the field', async () => {
    const user = userEvent.setup();
    render(<AddTask {...defaultProps} />);

    // Trigger validation
    await user.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    });

    // Type into title field -> error should disappear
    await user.type(screen.getByLabelText(/task title/i), 'Fixing error');
    expect(screen.queryByText(/task title is required/i)).not.toBeInTheDocument();
  });
});
