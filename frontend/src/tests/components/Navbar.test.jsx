import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navbar from '../../components/Navbar';

describe('Navbar', () => {
  it('renders the brand name "TaskFlow"', () => {
    render(<Navbar />);
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
  });

  it('renders the brand subtitle', () => {
    render(<Navbar />);
    expect(screen.getByText('AI-Assisted Task Management')).toBeInTheDocument();
  });

  it('renders the MERN Stack badge', () => {
    render(<Navbar />);
    expect(screen.getByText('MERN Stack')).toBeInTheDocument();
  });
});
