import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navbar from '../../components/Navbar';

describe('Navbar', () => {
  it.each([
    ['brand name "TaskFlow"', 'TaskFlow'],
    ['brand subtitle', 'AI-Assisted Task Management'],
    ['MERN Stack badge', 'MERN Stack'],
  ])('renders the %s', (_, text) => {
    render(<Navbar />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
