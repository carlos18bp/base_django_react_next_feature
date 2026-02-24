import { describe, it, expect } from '@jest/globals';

import { API_ENDPOINTS, COOKIE_KEYS, PAGINATION, ROUTES } from '../constants';

describe('constants', () => {
  describe('API_ENDPOINTS', () => {
    it('BLOG_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_DETAIL(42)).toBe('/blogs-data/42/');
    });

    it('PRODUCT_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.PRODUCT_DETAIL(7)).toBe('/products/7/');
    });
  });

  describe('ROUTES', () => {
    it('exposes HOME route as "/"', () => {
      expect(ROUTES.HOME).toBe('/');
    });

    it('exposes SIGN_IN route', () => {
      expect(ROUTES.SIGN_IN).toBe('/sign-in');
    });

    it('exposes DASHBOARD route', () => {
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
    });
  });

  describe('COOKIE_KEYS', () => {
    it('exposes ACCESS_TOKEN key', () => {
      expect(COOKIE_KEYS.ACCESS_TOKEN).toBe('access_token');
    });

    it('exposes REFRESH_TOKEN key', () => {
      expect(COOKIE_KEYS.REFRESH_TOKEN).toBe('refresh_token');
    });
  });

  describe('PAGINATION', () => {
    it('exposes DEFAULT_PAGE_SIZE as 20', () => {
      expect(PAGINATION.DEFAULT_PAGE_SIZE).toBe(20);
    });
  });
});
