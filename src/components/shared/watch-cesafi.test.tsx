import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WatchCesafi from './watch-cesafi';

describe('WatchCesafi', () => {
  it('leads with basketball and the August tip-off', () => {
    render(<WatchCesafi />);

    expect(screen.getByRole('heading', { name: /where to watch cesafi basketball/i })).toBeInTheDocument();
    expect(screen.getByText(/tips off in august/i)).toBeInTheDocument();
  });

  it.each([
    [/watch live on facebook/i, 'https://www.facebook.com/thecesafi'],
    [/watch on youtube/i, 'https://www.youtube.com/@CESAFIOfficial']
  ])('links %s to the official channel in a new tab', (name, href) => {
    render(<WatchCesafi />);

    const link = screen.getByRole('link', { name });

    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('sends in-person fans at the Cebu Coliseum to the schedule', () => {
    render(<WatchCesafi />);

    expect(screen.getByRole('link', { name: /cebu coliseum/i })).toHaveAttribute('href', '/schedule');
  });

  it('does not name Smart or Puso Pilipinas', () => {
    const { container } = render(<WatchCesafi />);

    expect(container.textContent).not.toMatch(/smart|puso/i);
  });
});
