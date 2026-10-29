jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { revalidatePath } from 'next/cache';
import { RevalidationHelper } from './revalidation';

const revalidatePathMock = revalidatePath as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RevalidationHelper standings refresh', () => {
  it.each([
    ['revalidateMatches', () => RevalidationHelper.revalidateMatches()],
    ['revalidateMatchParticipants', () => RevalidationHelper.revalidateMatchParticipants()]
  ])('%s refreshes the public and admin standings pages', (_name, revalidate) => {
    revalidate();

    expect(revalidatePathMock).toHaveBeenCalledWith('/standings');
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/standings');
  });
});
