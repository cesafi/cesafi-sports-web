import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AboutUsFaq from './about-us-faq';
import { useAboutUsFaq } from '@/hooks/use-faq';
import type { Faq } from '@/lib/types/faq';

jest.mock('@/hooks/use-faq', () => ({ useAboutUsFaq: jest.fn() }));

const faq = (overrides: Partial<Faq>): Faq =>
  ({
    id: 2,
    question: 'What is CESAFI?',
    answer: 'First paragraph.\n\nSecond paragraph.',
    is_open: true,
    is_active: true,
    is_highlight: true,
    display_order: 1,
    category: 'General',
    created_at: '',
    updated_at: '',
    ...overrides
  }) as Faq;

beforeAll(() => {
  window.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })) as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  (useAboutUsFaq as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, error: null });
});

describe('AboutUsFaq', () => {
  it('moves the watch links out of the What is CESAFI answer', () => {
    render(<AboutUsFaq initialFaqs={[faq({})]} />);

    expect(screen.queryByText('WATCH HERE')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /where to watch cesafi basketball/i })).toBeInTheDocument();
  });

  it('keeps the paragraph breaks in an answer', () => {
    render(<AboutUsFaq initialFaqs={[faq({})]} />);

    expect(screen.getByText(/First paragraph/)).toHaveClass('whitespace-pre-line');
  });

  it('shows server-rendered questions while the client refetch is loading', () => {
    (useAboutUsFaq as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<AboutUsFaq initialFaqs={[faq({})]} />);

    expect(screen.getByText('What is CESAFI?')).toBeInTheDocument();
    expect(screen.queryByText('Loading FAQ')).not.toBeInTheDocument();
  });

  it('shows the loader when there is nothing to display yet', () => {
    (useAboutUsFaq as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<AboutUsFaq />);

    expect(screen.getByText('Loading FAQ')).toBeInTheDocument();
  });
});
