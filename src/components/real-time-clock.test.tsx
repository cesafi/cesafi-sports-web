import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import { CompactClock, DashboardClock, RealTimeClock } from './real-time-clock';

const SERVER_TIME = new Date(2026, 10, 2, 13, 5, 9);
const CLIENT_TIME = new Date(2026, 10, 2, 13, 5, 16);

const textOf = (markup: string) => {
  const container = document.createElement('div');
  container.innerHTML = markup;
  return container.textContent ?? '';
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(SERVER_TIME);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('RealTimeClock', () => {
  it('hydrates without a mismatch when the client clock has moved on from the server', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<RealTimeClock />);
    jest.setSystemTime(CLIENT_TIME);

    const onRecoverableError = jest.fn();
    let root: Root;
    act(() => {
      root = hydrateRoot(container, <RealTimeClock />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container).toHaveTextContent('01:05:16 PM');

    act(() => root.unmount());
  });

  it('leaves the time out of the server render', () => {
    expect(textOf(renderToString(<RealTimeClock />))).not.toContain('01:05:09');
  });

  it.each([
    ['12-hour', { format: '12h' as const }],
    ['24-hour', { format: '24h' as const }],
    ['dated', { showDate: true }]
  ])('reserves the width of the %s time in the server render', (_label, props) => {
    jest.setSystemTime(new Date(2026, 10, 12, 13, 5, 9));
    const reserved = textOf(renderToString(<RealTimeClock {...props} />));

    render(<RealTimeClock {...props} />);
    const shown = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent ?? '';

    expect(reserved).toHaveLength(shown.length);
  });

  it('hides the reserved space from view and from screen readers', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<RealTimeClock />);

    const slot = container.querySelector('span');

    expect(slot).toHaveClass('invisible');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the time as soon as it mounts and keeps ticking', () => {
    render(<RealTimeClock />);

    const time = screen.getByText('01:05:09 PM');
    expect(time).not.toHaveClass('invisible');
    expect(time).not.toHaveAttribute('aria-hidden');

    act(() => jest.advanceTimersByTime(1000));

    expect(screen.getByText('01:05:10 PM')).toBeInTheDocument();
  });

  it('stops ticking when it unmounts', () => {
    const { unmount } = render(<RealTimeClock />);

    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  it.each([
    ['CompactClock', CompactClock],
    ['DashboardClock', DashboardClock]
  ])('keeps %s out of the server render too', (_name, Clock) => {
    expect(textOf(renderToString(<Clock />))).not.toContain('01:05:09');
  });
});
