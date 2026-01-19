"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { toast } from "@/lib/utils/toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Check for errors from Google
        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          toast.error('Authorization failed');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        // Check if code exists
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          toast.error('Authorization failed');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        // Exchange code for token
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiry: string;
          tokenJSON: string;
          user?: {
            id: number;
            email: string;
            name: string;
            created_at: string;
          };
          apiKey?: string;
        }>('/v1/auth/google/callback', {
          code,
          state: searchParams.get('state'),
        });

        // Clear any old auth data first to avoid format conflicts
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('google_oauth_token');
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
        localStorage.removeItem('google_token_expiry');

        // Store Google OAuth token (for YouTube API access)
        localStorage.setItem('google_oauth_token', response.tokenJSON);
        localStorage.setItem('google_access_token', response.accessToken);
        localStorage.setItem('google_refresh_token', response.refreshToken);
        localStorage.setItem('google_token_expiry', response.expiry);

        // Store system API key and user info (for backend API authentication)
        if (response.apiKey) {
          localStorage.setItem('auth_token', response.apiKey);
        }
        if (response.user) {
          localStorage.setItem('user_info', JSON.stringify(response.user));
        }

        setStatus('success');
        setMessage('Authorization successful!');
        toast.success('Successfully logged in with Google');

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to complete authorization');
        toast.error('Authorization failed');
        setTimeout(() => router.push('/auth'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleContinue = () => {
    const returnUrl = sessionStorage.getItem('auth_return_url') || '/insights';
    sessionStorage.removeItem('auth_return_url');
    // 使用完整页面重新加载以避免模块加载问题
    window.location.href = returnUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
      <div className="text-center animate-in fade-in duration-500">
        <div className="mb-8 flex justify-center">
          {status === 'loading' && (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {status === 'loading' && 'Authorizing...'}
          {status === 'success' && 'Authorization Complete'}
          {status === 'error' && 'Authorization Failed'}
        </h1>

        <p className="text-muted-foreground mb-6">{message}</p>

        {status === 'success' && (
          <Button
            size="lg"
            onClick={handleContinue}
            className="rounded-xl"
          >
            Continue to App
          </Button>
        )}

        {status === 'error' && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/auth'}
            className="rounded-xl"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
