'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Blog } from '@/lib/types';

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="group block border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500">{blog.category || 'Blog'}</p>
        <h3 className="font-semibold mt-1 leading-tight">{blog.title}</h3>
      </div>
    </Link>
  );
}
