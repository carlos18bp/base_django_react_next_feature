'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from 'react-google-recaptcha';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

type GoogleUser = {
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, googleLogin } = useAuthStore();

  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    setMounted(true);
    api.get('google-captcha/site-key/')
      .then((res) => setSiteKey(res.data.site_key || ''))
      .catch(() => {});
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (siteKey && !captchaToken) {
      setError('Please complete the captcha');
      setLoading(false);
      return;
    }

    try {
      await signUp({ 
        email, 
        password, 
        first_name: firstName,
        last_name: lastName,
        captcha_token: captchaToken ?? undefined,
      });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Google registration failed');
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
      setError(err.response?.data?.error || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google registration failed');
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join and start shopping in minutes.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input 
              className="border border-border rounded-xl px-3 py-2 w-full bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="First Name" 
              type="text"
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              autoComplete="given-name"
            />
            
            <input 
              className="border border-border rounded-xl px-3 py-2 w-full bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Last Name" 
              type="text"
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              autoComplete="family-name"
            />
          </div>
          
          <div>
            <input 
              className="border border-border rounded-xl px-3 py-2 w-full bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="border border-border rounded-xl px-3 py-2 w-full bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters</p>
          </div>
          
          <div>
            <input 
              className="border border-border rounded-xl px-3 py-2 w-full bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type="password" 
              autoComplete="new-password"
              required
            />
          </div>

          {siteKey && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
          )}

          <button
            className="bg-primary text-primary-foreground rounded-full px-5 py-3 w-full disabled:opacity-50 hover:bg-primary/90"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {mounted && hasGoogleClientId ? (
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          ) : mounted ? (
            <p className="mt-6 text-sm text-destructive text-center">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
          ) : null}
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/sign-in" className="text-foreground hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
