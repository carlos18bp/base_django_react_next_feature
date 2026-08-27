import { describe, expect, it } from '@jest/globals';

import { getApiErrorMessage } from '../errors';

describe('getApiErrorMessage', () => {
  it('returns an API error string', () => {
    const error = { response: { data: { error: 'Invalid request' } } };

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Invalid request');
  });

  it('returns the fallback for a non-string API error', () => {
    const error = { response: { data: { error: { code: 'invalid' } } } };

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Fallback');
  });

  it('returns the fallback for a non-object error', () => {
    expect(getApiErrorMessage('network failure', 'Fallback')).toBe('Fallback');
  });
});
