export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  BACKOFFICE: '/backoffice',
  CATALOG: '/catalog',
  BLOGS: '/blogs',
  CHECKOUT: '/checkout',
} as const;

export const API_ENDPOINTS = {
  SIGN_IN: '/auth/sign-in/',
  SIGN_UP: '/auth/sign-up/',
  GOOGLE_LOGIN: '/auth/google-login/',
  SEND_PASSCODE: '/auth/send-passcode/',
  RESET_PASSWORD: '/auth/verify-passcode-and-reset-password/',
  UPDATE_PASSWORD: '/auth/update-password/',
  VALIDATE_TOKEN: '/auth/validate-token/',
  BLOGS: '/blogs-data/',
  BLOG_DETAIL: (id: number) => `/blogs-data/${id}/`,
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id: number) => `/products/${id}/`,
  SALES: '/sales/',
  CREATE_SALE: '/create-sale/',
  USERS: '/users/',
} as const;

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;
