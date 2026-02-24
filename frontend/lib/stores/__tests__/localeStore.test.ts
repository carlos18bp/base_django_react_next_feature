import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';

import { useLocaleStore } from '../localeStore';

describe('localeStore', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('initializes with default locale "en"', () => {
    const { result } = renderHook(() => useLocaleStore());

    expect(result.current.locale).toBe('en');
  });

  it('sets locale when a valid locale is provided', () => {
    const { result } = renderHook(() => useLocaleStore());

    act(() => {
      result.current.setLocale('es');
    });

    expect(result.current.locale).toBe('es');
  });

  it('ignores locale change when an invalid value is provided', () => {
    const { result } = renderHook(() => useLocaleStore());

    act(() => {
      result.current.setLocale('fr');
    });

    expect(result.current.locale).toBe('en');
  });
});
