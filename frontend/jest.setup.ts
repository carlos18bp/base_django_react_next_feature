import React from 'react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';

type NextImageProps = React.ComponentPropsWithoutRef<'img'> & { fill?: boolean };
type NextLinkProps = React.ComponentPropsWithoutRef<'a'>;

jest.mock('next/image', () => ({
  __esModule: true,
  default: function NextImage({ fill: _fill, ...rest }: NextImageProps) {
    return React.createElement('img', rest);
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: NextLinkProps) => React.createElement('a', { href, ...rest }, children),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
