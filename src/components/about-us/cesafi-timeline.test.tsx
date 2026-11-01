import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CesafiTimeline from './cesafi-timeline';
import { useAllTimeline } from '@/hooks/use-timeline';

jest.mock('@/hooks/use-timeline', () => ({ useAllTimeline: jest.fn() }));

beforeEach(() => {
  (useAllTimeline as jest.Mock).mockReturnValue({
    data: [
      {
        id: 4,
        year: '2001',
        title: 'CESAFI was born',
        category: 'founding',
        description: 'Founded in 2001.',
        is_highlight: false
      }
    ],
    isLoading: false,
    error: null
  });
});

describe('CesafiTimeline', () => {
  it('states that the basketball season tips off in August', () => {
    render(<CesafiTimeline />);

    expect(screen.getByText(/basketball season tips off every august/i)).toBeInTheDocument();
  });

  it('turns the call-to-action buttons into working links', () => {
    render(<CesafiTimeline />);

    expect(screen.getByRole('link', { name: /view current season/i })).toHaveAttribute('href', '/schedule');
    expect(screen.getByRole('link', { name: /learn more about cesafi/i })).toHaveAttribute('href', '/faq');
  });

  it('marks events with a basketball instead of a trophy emoji', () => {
    const { container } = render(<CesafiTimeline />);

    expect(container.textContent).not.toContain('🏆');
    expect(container.querySelector('[data-icon="basketball"]')).toBeInTheDocument();
  });
});
