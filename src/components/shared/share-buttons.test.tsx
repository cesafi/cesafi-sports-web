import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import ShareButtons from './share-buttons';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const TITLE = 'BC Cheetahs emerge on top';
const ARTICLE_URL = 'https://preview.cesafi.org/news/bc-cheetahs-emerge-on-top';

const writeText = jest.fn().mockResolvedValue(undefined);

function mockDevice({ touch, share }: { touch: boolean; share?: jest.Mock }) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: touch }) as unknown as typeof window.matchMedia;
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  mockDevice({ touch: false });
});

describe('ShareButtons', () => {
  it.each(['compact', 'expanded', 'full'] as const)(
    'offers X, Facebook, Instagram and copy link in the %s variant',
    (variant) => {
      render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant={variant} />);

      expect(screen.getByRole('link', { name: /share on x/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /share on facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share on instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy article link/i })).toBeInTheDocument();
    }
  );

  it('points the X and Facebook links at the article, in a new tab', () => {
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    const encodedUrl = encodeURIComponent(ARTICLE_URL);
    const x = screen.getByRole('link', { name: /share on x/i });
    const facebook = screen.getByRole('link', { name: /share on facebook/i });

    expect(x.getAttribute('href')).toContain(`url=${encodedUrl}`);
    expect(facebook.getAttribute('href')).toContain(`u=${encodedUrl}`);
    for (const link of [x, facebook]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('opens a share link without reporting a blocked popup', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('link', { name: /share on facebook/i }));

    expect(open).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('copies the article URL from the copy link button', async () => {
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('button', { name: /copy article link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(ARTICLE_URL));
    expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
  });

  it('uses the phone share sheet for Instagram on touch devices', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    mockDevice({ touch: true, share });
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('button', { name: /share on instagram/i }));

    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: TITLE, url: ARTICLE_URL }));
    expect(writeText).not.toHaveBeenCalled();
  });

  it('stays quiet when the share sheet is dismissed', async () => {
    const share = jest.fn().mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'AbortError' }));
    mockDevice({ touch: true, share });
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('button', { name: /share on instagram/i }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: /share on instagram/i })).toBeEnabled());
    expect(writeText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('copies the link and offers to open Instagram when there is no share sheet', async () => {
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('button', { name: /share on instagram/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(ARTICLE_URL));
    const [message, options] = (toast.success as jest.Mock).mock.calls[0];
    expect(message).toMatch(/link copied/i);
    expect(options.action.label).toBe('Open Instagram');
  });

  it('skips the desktop share sheet, which does not offer Instagram', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    mockDevice({ touch: false, share });
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" />);

    fireEvent.click(screen.getByRole('button', { name: /share on instagram/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(ARTICLE_URL));
    expect(share).not.toHaveBeenCalled();
  });

  it('refuses to share an invalid URL', () => {
    render(<ShareButtons title={TITLE} url="javascript:alert(1)" variant="compact" />);

    const link = screen.getByRole('link', { name: /share on x/i });
    const notPrevented = fireEvent.click(link);

    expect(notPrevented).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Invalid URL for sharing');
  });

  it('disables every option in preview mode', () => {
    render(<ShareButtons title={TITLE} url={ARTICLE_URL} variant="compact" disabled />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    for (const name of [/share on x/i, /share on facebook/i, /share on instagram/i, /copy article link/i]) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });
});
