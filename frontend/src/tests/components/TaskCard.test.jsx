import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskCard from '../../components/TaskCard';

// Realistic sample task fixture
const sampleTask = {
  _id: 'task-001',
  title: 'Implement Authentication Flow',
  description: 'Add JWT authentication and protected routes for frontend.',
  priority: 'High',
  status: 'Pending',
  dueDate: '2026-09-25T00:00:00.000Z',
};

describe('TaskCard Component', () => {
  let mockOnDelete;
  let mockOnEdit;
  let mockOnStatusChange;

  beforeEach(() => {
    mockOnDelete = vi.fn();
    mockOnEdit = vi.fn();
    mockOnStatusChange = vi.fn();
  });

  const renderCard = (props = {}) => {
    return render(
      <TaskCard
        task={sampleTask}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
        deletingId={null}
        updatingId={null}
        {...props}
      />
    );
  };

  it('1. Task title is displayed', () => {
    renderCard();
    expect(screen.getByText(sampleTask.title)).toBeInTheDocument();
  });

  it('2. Task description is displayed', () => {
    renderCard();
    expect(screen.getByText(sampleTask.description)).toBeInTheDocument();
  });

  it('3. Priority is displayed', () => {
    renderCard();
    expect(screen.getByText(sampleTask.priority)).toBeInTheDocument();
  });

  it('4. Due date is displayed', () => {
    renderCard();
    const expectedDate = new Date(sampleTask.dueDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('renders a dash when due date is not provided', () => {
    renderCard({ task: { ...sampleTask, dueDate: null } });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('5. Current status is displayed', () => {
    renderCard();
    const statusControl = screen.getByRole('combobox', { name: /update task status/i });
    expect(statusControl).toHaveValue('Pending');
  });

  it('6. Edit button is present', () => {
    renderCard();
    const editButton = screen.getByRole('button', { name: /edit task/i });
    expect(editButton).toBeInTheDocument();
  });

  it('7. Delete button is present', () => {
    renderCard();
    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('8. Status control is present', () => {
    renderCard();
    const statusSelect = screen.getByRole('combobox', { name: /update task status/i });
    expect(statusSelect).toBeInTheDocument();
  });

  it('9. Clicking Edit triggers the expected behavior', async () => {
    const user = userEvent.setup();
    renderCard();

    const editBtn = screen.getByRole('button', { name: /edit task/i });
    await user.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(sampleTask._id);
  });

  it('10. Clicking Delete triggers the expected delete behavior', async () => {
    const user = userEvent.setup();
    renderCard();

    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteBtn);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(sampleTask._id);
  });

  it('11. Changing status triggers the expected callback/API behavior if the component handles it', async () => {
    const user = userEvent.setup();
    renderCard();

    const statusSelect = screen.getByRole('combobox', { name: /update task status/i });
    await user.selectOptions(statusSelect, 'Completed');

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith(sampleTask._id, 'Completed');
  });

  it('handles optional states: disables actions and displays loading when deleting or updating', () => {
    const { rerender } = renderCard({ deletingId: sampleTask._id });
    expect(screen.getByRole('button', { name: /delete task/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /edit task/i })).toBeDisabled();
    expect(screen.getByText(/deleting/i)).toBeInTheDocument();

    rerender(
      <TaskCard
        task={sampleTask}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onStatusChange={mockOnStatusChange}
        deletingId={null}
        updatingId={sampleTask._id}
      />
    );
    expect(screen.getByRole('combobox', { name: /update task status/i })).toBeDisabled();
  });
});
