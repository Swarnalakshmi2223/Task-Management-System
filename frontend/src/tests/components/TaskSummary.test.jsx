import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskSummary from '../../components/TaskSummary';

// Realistic sample task data
const sampleTasks = [
  { _id: '1', title: 'Fix user authentication bug', status: 'Pending', priority: 'High' },
  { _id: '2', title: 'Implement dashboard charts', status: 'In Progress', priority: 'Medium' },
  { _id: '3', title: 'Update project documentation', status: 'Completed', priority: 'Low' },
  { _id: '4', title: 'Design system tokens update', status: 'Pending', priority: 'Medium' },
  { _id: '5', title: 'Refactor database models', status: 'Completed', priority: 'High' },
];

describe('TaskSummary Component', () => {
  it('1. Total task count is displayed correctly', () => {
    render(<TaskSummary tasks={sampleTasks} />);

    const totalCard = screen.getByText('Total Tasks').closest('.summary-card');
    expect(totalCard).toBeInTheDocument();
    expect(within(totalCard).getByText('5')).toBeInTheDocument();
  });

  it('2. Pending task count is displayed correctly', () => {
    render(<TaskSummary tasks={sampleTasks} />);

    const pendingCard = screen.getByText('Pending').closest('.summary-card');
    expect(pendingCard).toBeInTheDocument();
    expect(within(pendingCard).getByText('2')).toBeInTheDocument();
  });

  it('3. In Progress task count is displayed correctly', () => {
    render(<TaskSummary tasks={sampleTasks} />);

    const inProgressCard = screen.getByText('In Progress').closest('.summary-card');
    expect(inProgressCard).toBeInTheDocument();
    expect(within(inProgressCard).getByText('1')).toBeInTheDocument();
  });

  it('4. Completed task count is displayed correctly', () => {
    render(<TaskSummary tasks={sampleTasks} />);

    const completedCard = screen.getByText('Completed').closest('.summary-card');
    expect(completedCard).toBeInTheDocument();
    expect(within(completedCard).getByText('2')).toBeInTheDocument();
  });

  it('5. Zero values are displayed correctly', () => {
    render(<TaskSummary tasks={[]} />);

    const totalCard = screen.getByText('Total Tasks').closest('.summary-card');
    const pendingCard = screen.getByText('Pending').closest('.summary-card');
    const inProgressCard = screen.getByText('In Progress').closest('.summary-card');
    const completedCard = screen.getByText('Completed').closest('.summary-card');

    expect(within(totalCard).getByText('0')).toBeInTheDocument();
    expect(within(pendingCard).getByText('0')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('0')).toBeInTheDocument();
    expect(within(completedCard).getByText('0')).toBeInTheDocument();
  });

  it('6. Summary updates correctly when different task data is provided', () => {
    const initialTasks = [
      { _id: '1', title: 'Initial task', status: 'Pending', priority: 'Low' },
    ];

    const { rerender } = render(<TaskSummary tasks={initialTasks} />);

    const totalCard = screen.getByText('Total Tasks').closest('.summary-card');
    const pendingCard = screen.getByText('Pending').closest('.summary-card');
    const inProgressCard = screen.getByText('In Progress').closest('.summary-card');
    const completedCard = screen.getByText('Completed').closest('.summary-card');

    expect(within(totalCard).getByText('1')).toBeInTheDocument();
    expect(within(pendingCard).getByText('1')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('0')).toBeInTheDocument();
    expect(within(completedCard).getByText('0')).toBeInTheDocument();

    // Rerender with new, updated list of tasks
    const updatedTasks = [
      { _id: '1', title: 'Initial task', status: 'Completed', priority: 'Low' },
      { _id: '2', title: 'Second task', status: 'In Progress', priority: 'Medium' },
      { _id: '3', title: 'Third task', status: 'In Progress', priority: 'High' },
    ];

    rerender(<TaskSummary tasks={updatedTasks} />);

    expect(within(totalCard).getByText('3')).toBeInTheDocument();
    expect(within(pendingCard).getByText('0')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('2')).toBeInTheDocument();
    expect(within(completedCard).getByText('1')).toBeInTheDocument();
  });
});
