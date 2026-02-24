'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { useAuthStore } from '@/lib/stores/authStore';

type GoogleUser = {
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export default function SignInPage() {
  const router = useRouter();
  const { signIn, googleLogin } = useAuthStore();

  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Google login failed');
        return;
      }

      let decoded: GoogleUser | null = null;
      try {
        decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
      } catch {
        decoded = null;
      }

      await googleLogin({
        credential: credentialResponse.credential,
        email: decoded?.email,
        given_name: decoded?.given_name,
        family_name: decoded?.family_name,
        picture: decoded?.picture,
      });
      
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back. Sign in to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <input 
              className="border border-gray-200 rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-black/10" 
              placeholder="Email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="email"
              required
            />
          </div>
          
          <div>
            <input 
              className="border border-gray-200 rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-black/10" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              autoComplete="current-password"
              required
            />
          </div>

          <button 
            className="bg-black text-white rounded-full px-5 py-3 w-full disabled:opacity-50 hover:bg-gray-900" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-gray-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {hasGoogleClientId ? (
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-red-600 text-center">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
          )}
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/sign-up" className="text-gray-900 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
