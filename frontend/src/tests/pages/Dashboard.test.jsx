import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';

// Mock the taskApi module
vi.mock('../../services/taskApi');
import { getAllTasks, deleteTask, updateTask } from '../../services/taskApi';

// Realistic sample tasks fixture
const sampleTasks = [
  {
    _id: 'task-1',
    title: 'Fix authentication token expiry bug',
    description: 'Refresh token logic fails when expired on mobile clients',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-09-15T00:00:00.000Z',
  },
  {
    _id: 'task-2',
    title: 'Write dashboard unit tests',
    description: 'Create comprehensive tests for Dashboard component and filters',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2026-09-20T00:00:00.000Z',
  },
  {
    _id: 'task-3',
    title: 'Deploy microservices to Kubernetes',
    description: 'Setup Helm charts and production deployment pipeline',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2026-09-30T00:00:00.000Z',
  },
];

const defaultProps = {
  onAddTask: vi.fn(),
  onEditTask: vi.fn(),
};

describe('Dashboard Component', () => {
  let originalConfirm;

  beforeEach(() => {
    vi.clearAllMocks();
    originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);
    getAllTasks.mockResolvedValue({ data: { data: sampleTasks } });
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('1. Dashboard renders correctly', async () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /task management/i })).toBeInTheDocument();
    expect(screen.getByText(/manage, organize and track your tasks efficiently/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search tasks by title or description/i)).toBeInTheDocument();
    expect(document.getElementById('filter-status')).toBeInTheDocument();
    expect(document.getElementById('filter-priority')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    });
  });

  it('2. Loading state appears while tasks are loading', () => {
    getAllTasks.mockReturnValue(new Promise(() => {})); // pending promise
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/fetching your tasks/i)).toBeInTheDocument();
  });

  it('3. Tasks are displayed after successful API response', async () => {
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
      expect(screen.getByText('Write dashboard unit tests')).toBeInTheDocument();
      expect(screen.getByText('Deploy microservices to Kubernetes')).toBeInTheDocument();
    });
  });

  it('4. Empty state appears when there are no tasks', async () => {
    getAllTasks.mockResolvedValueOnce({ data: { data: [] } });
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /no tasks yet/i })).toBeInTheDocument();
      expect(screen.getByText(/create your first task to start managing your work/i)).toBeInTheDocument();
    });
  });

  it('5. Error message appears when fetching tasks fails', async () => {
    getAllTasks.mockRejectedValueOnce(new Error('Network Error'));
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /unable to load tasks/i })).toBeInTheDocument();
      expect(screen.getByText(/unable to load tasks\. please make sure the backend is running/i)).toBeInTheDocument();
    });
  });

  it('6. Task summary displays correct counts', async () => {
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    });

    const totalCard = screen.getByText('All tasks').closest('.summary-card');
    const pendingCard = screen.getByText('Awaiting action').closest('.summary-card');
    const inProgressCard = screen.getByText('Currently active').closest('.summary-card');
    const completedCard = screen.getByText('Successfully done').closest('.summary-card');

    expect(within(totalCard).getByText('3')).toBeInTheDocument();
    expect(within(pendingCard).getByText('1')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('1')).toBeInTheDocument();
    expect(within(completedCard).getByText('1')).toBeInTheDocument();
  });

  it('7. Searching by task title filters the visible tasks', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    await user.type(searchInput, 'token expiry');

    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy microservices to Kubernetes')).not.toBeInTheDocument();
  });

  it('8. Searching by description filters the visible tasks', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Write dashboard unit tests'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    await user.type(searchInput, 'Helm charts');

    expect(screen.getByText('Deploy microservices to Kubernetes')).toBeInTheDocument();
    expect(screen.queryByText('Fix authentication token expiry bug')).not.toBeInTheDocument();
    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();
  });

  it('9. Search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    await user.type(searchInput, 'AUTHENTICATION');

    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();
  });

  it('10. Status filter works', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const statusFilter = document.getElementById('filter-status');
    await user.selectOptions(statusFilter, 'Pending');

    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy microservices to Kubernetes')).not.toBeInTheDocument();
  });

  it('11. Priority filter works', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Write dashboard unit tests'));

    const priorityFilter = document.getElementById('filter-priority');
    await user.selectOptions(priorityFilter, 'Medium');

    expect(screen.getByText('Write dashboard unit tests')).toBeInTheDocument();
    expect(screen.queryByText('Fix authentication token expiry bug')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy microservices to Kubernetes')).not.toBeInTheDocument();
  });

  it('12. Search + status filter work together', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    const statusFilter = document.getElementById('filter-status');

    await user.type(searchInput, 'tests');
    await user.selectOptions(statusFilter, 'In Progress');

    expect(screen.getByText('Write dashboard unit tests')).toBeInTheDocument();
    expect(screen.queryByText('Fix authentication token expiry bug')).not.toBeInTheDocument();

    // Now change status filter to Completed where title has "tests" -> no match
    await user.selectOptions(statusFilter, 'Completed');
    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /no matching tasks/i })).toBeInTheDocument();
  });

  it('13. Search + priority filter work together', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    const priorityFilter = document.getElementById('filter-priority');

    await user.type(searchInput, 'token');
    await user.selectOptions(priorityFilter, 'High');

    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();

    // Change priority filter to Low -> no match
    await user.selectOptions(priorityFilter, 'Low');
    expect(screen.queryByText('Fix authentication token expiry bug')).not.toBeInTheDocument();
  });

  it('14. Clear/reset filters works if the feature exists', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const searchInput = screen.getByPlaceholderText(/search tasks by title or description/i);
    await user.type(searchInput, 'token');

    expect(screen.queryByText('Write dashboard unit tests')).not.toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);

    // All tasks should be visible again
    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
    expect(screen.getByText('Write dashboard unit tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy microservices to Kubernetes')).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('15. Edit action works', async () => {
    const user = userEvent.setup();
    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const editButtons = screen.getAllByRole('button', { name: /edit task/i });
    await user.click(editButtons[0]);

    expect(defaultProps.onEditTask).toHaveBeenCalledWith('task-1');
  });

  it('16. Delete action calls the expected API/callback', async () => {
    const user = userEvent.setup();
    deleteTask.mockResolvedValueOnce({ data: { message: 'Deleted' } });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteTask).toHaveBeenCalledWith('task-1');
  });

  it('17. Successful deletion updates the UI', async () => {
    const user = userEvent.setup();
    deleteTask.mockResolvedValueOnce({ data: { message: 'Deleted' } });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Fix authentication token expiry bug')).not.toBeInTheDocument();
      expect(screen.getByText(/task deleted successfully/i)).toBeInTheDocument();
    });
  });

  it('18. Failed deletion displays an error message', async () => {
    const user = userEvent.setup();
    deleteTask.mockRejectedValueOnce({
      response: { data: { message: 'Server error while deleting task.' } },
    });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Server error while deleting task.')).toBeInTheDocument();
    });
    // Task should still remain in the document
    expect(screen.getByText('Fix authentication token expiry bug')).toBeInTheDocument();
  });

  it('19. Changing task status triggers the expected API behavior', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({
      data: { data: { ...sampleTasks[0], status: 'Completed' } },
    });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const statusDropdowns = screen.getAllByRole('combobox', { name: /update task status/i });
    await user.selectOptions(statusDropdowns[0], 'Completed');

    expect(updateTask).toHaveBeenCalledWith('task-1', { status: 'Completed' });
  });

  it('20. Successful status update updates the displayed task', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({
      data: { data: { ...sampleTasks[0], status: 'Completed' } },
    });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const statusDropdowns = screen.getAllByRole('combobox', { name: /update task status/i });
    await user.selectOptions(statusDropdowns[0], 'Completed');

    await waitFor(() => {
      expect(screen.getByText(/status updated to "completed"/i)).toBeInTheDocument();
      expect(statusDropdowns[0]).toHaveValue('Completed');
    });
  });

  it('21. Failed status update displays an error message toast', async () => {
    const user = userEvent.setup();
    updateTask.mockRejectedValueOnce({
      response: { data: { message: 'Server database error during status update' } },
    });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const statusDropdowns = screen.getAllByRole('combobox', { name: /update task status/i });
    await user.selectOptions(statusDropdowns[0], 'Completed');

    await waitFor(() => {
      expect(screen.getByText('Server database error during status update')).toBeInTheDocument();
    });
  });

  it('22. Toast notification can be manually dismissed', async () => {
    const user = userEvent.setup();
    updateTask.mockResolvedValueOnce({
      data: { data: { ...sampleTasks[0], status: 'Completed' } },
    });

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => screen.getByText('Fix authentication token expiry bug'));

    const statusDropdowns = screen.getAllByRole('combobox', { name: /update task status/i });
    await user.selectOptions(statusDropdowns[0], 'Completed');

    await waitFor(() => {
      expect(screen.getByText(/status updated to "completed"/i)).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: '' });
    await user.click(closeBtn);

    expect(screen.queryByText(/status updated to "completed"/i)).not.toBeInTheDocument();
  });
});
