'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import type { Blog } from '@/lib/types';
import { useBlogStore } from '@/lib/stores/blogStore';

export default function BlogDetailPage() {
  const fetchBlog = useBlogStore((s) => s.fetchBlog);
  const [blog, setBlog] = useState<Blog | null>(null);
  const params = useParams<{ blogId: string }>();
  const blogId = params?.blogId;

  useEffect(() => {
    const id = Number(blogId);
    if (!Number.isFinite(id)) return;
    void (async () => {
      const data = await fetchBlog(id);
      setBlog(data);
    })();
  }, [fetchBlog, blogId]);

  if (!blog) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {blog.image_url ? (
          <div className="relative w-full aspect-[16/9] bg-muted">
            <Image src={blog.image_url} alt={blog.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
          </div>
        ) : null}

        <div className="p-6 sm:p-10">
          <p className="text-sm text-muted-foreground">{blog.category || 'Blog'}</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">{blog.title}</h1>

          {blog.description ? (
            <p className="mt-6 text-foreground whitespace-pre-line leading-relaxed">{blog.description}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
