'use client';

import { create } from 'zustand';

import type { Blog } from '@/lib/types';
import { api } from '@/lib/services/http';

type BlogState = {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  fetchBlog: (blogId: number) => Promise<Blog | null>;
  clearError: () => void;
};

export const useBlogStore = create<BlogState>((set) => ({
  blogs: [],
  loading: false,
  error: null,
  fetchBlogs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('blogs/');
      set({ blogs: Array.isArray(response.data) ? response.data : [], loading: false });
    } catch (e) {
      set({ error: 'Could not load blogs. Is the backend running?', loading: false });
    }
  },
  fetchBlog: async (blogId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`blogs/${blogId}/`);
      set({ loading: false });
      return response.data as Blog;
    } catch (e) {
      set({ error: 'Could not load blog. Is the backend running?', loading: false });
      return null;
    }
  },
  clearError: () => set({ error: null }),
}));

export const selectBlogs = (state: BlogState) => state.blogs;
export const selectBlogsLoading = (state: BlogState) => state.loading;
export const selectBlogsError = (state: BlogState) => state.error;
