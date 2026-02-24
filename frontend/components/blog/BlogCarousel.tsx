'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import BlogCard from '@/components/blog/BlogCard';
import { useBlogStore } from '@/lib/stores/blogStore';

export default function BlogCarousel() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  const items = blogs.slice(0, 6);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500">Guides & tips</p>
          <h2 className="text-2xl font-semibold tracking-tight mt-1">Trending blogs</h2>
        </div>
        <Link href="/blogs" className="text-sm text-gray-700 hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="w-full aspect-[16/10] bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="mt-2 h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Blogs unavailable</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-black text-white px-5 py-2.5 hover:bg-gray-900"
            onClick={() => void fetchBlogs()}
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-5">
          <p className="text-sm font-medium text-gray-900">No blogs yet</p>
          <p className="text-sm text-gray-600 mt-1">Create blog posts in the backend and they’ll appear here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      )}
    </section>
  );
}
