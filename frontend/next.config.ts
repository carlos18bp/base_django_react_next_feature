import type { NextConfig } from 'next';

const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8000').replace(/\/$/, '');
let backendRemotePattern: { protocol: 'http' | 'https'; hostname: string; port?: string; pathname: string } | null = null;

try {
  const url = new URL(backendOrigin);
  backendRemotePattern = {
    protocol: (url.protocol.replace(':', '') as 'http' | 'https') || 'http',
    hostname: url.hostname,
    port: url.port || undefined,
    pathname: '/media/**',
  };
} catch {
  backendRemotePattern = null;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/media/**',
      },
      ...(backendRemotePattern ? [backendRemotePattern] : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${backendOrigin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
