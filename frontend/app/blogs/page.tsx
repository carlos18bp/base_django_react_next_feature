'use client';

import { useEffect } from 'react';

import BlogCard from '@/components/blog/BlogCard';
import { useBlogStore } from '@/lib/stores/blogStore';

export default function BlogsPage() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
        <p className="mt-2 text-muted-foreground">Tips, guides and inspiration for smarter shopping.</p>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="w-full aspect-[16/10] bg-muted animate-pulse" />
              <div className="p-4">
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-4 w-5/6 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 border border-border rounded-2xl bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Blogs unavailable</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90"
            onClick={() => void fetchBlogs()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && !blogs.length ? (
        <div className="mt-10 border border-dashed border-border rounded-2xl p-10 bg-card">
          <p className="text-foreground font-semibold">No blogs yet</p>
          <p className="text-muted-foreground mt-1">Generate fake blogs or create new ones from admin.</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
