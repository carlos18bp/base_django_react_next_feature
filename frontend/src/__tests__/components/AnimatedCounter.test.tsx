import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedCounter from '../../app/components/AnimatedCounter';

let intersectionCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [0];
  takeRecords = vi.fn().mockReturnValue([]);
}

describe('AnimatedCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders with prefix and suffix around the count', () => {
    render(<AnimatedCounter end={100} prefix="+" suffix="%" />);

    const span = screen.getByText(/\+.*%/);
    expect(span).toBeInTheDocument();
  });

  it('renders initial count as 0', () => {
    render(<AnimatedCounter end={500} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('observes the span element on mount', () => {
    render(<AnimatedCounter end={50} />);

    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = render(<AnimatedCounter end={50} />);

    unmount();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('animates to the target value when element becomes visible', () => {
    const now = 1000;
    vi.setSystemTime(now);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<AnimatedCounter end={100} duration={1000} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(rafCallbacks.length).toBe(1);

    vi.setSystemTime(now + 1100);
    act(() => {
      rafCallbacks[rafCallbacks.length - 1](now + 1100);
    });

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('does not animate when element is not intersecting', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(<AnimatedCounter end={100} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(rafSpy).not.toHaveBeenCalled();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('does not re-animate on subsequent intersections', () => {
    const now = 1000;
    vi.setSystemTime(now);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<AnimatedCounter end={50} duration={500} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    vi.setSystemTime(now + 600);
    act(() => {
      rafCallbacks[rafCallbacks.length - 1](now + 600);
    });

    const callCountAfterFirst = rafCallbacks.length;

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(rafCallbacks.length).toBe(callCountAfterFirst);
  });
});
