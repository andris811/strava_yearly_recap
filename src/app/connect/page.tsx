'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/url');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get OAuth URL:', data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching OAuth URL:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center max-w-md px-4">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6">
          <Image
            src="/strava_year_recap_logo.PNG"
            alt="Strava Year Recap"
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-contain rounded-xl"
          />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Strava Year in Review
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Connect your Strava account to see your activity statistics and yearly recap.
        </p>

        <button
          onClick={handleConnect}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-8 rounded-full transition-colors"
        >
          {loading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
                <path d="M7.778 13.828L12.17 4.8l2.089 4.116h4.178L12.171 0 7.778 9.028H3.6l2.089 4.116 2.089-.316z" />
              </svg>
              Connect with Strava
            </>
          )}
        </button>

        <div className="mt-6">
          <a 
            href="https://strava.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-orange-500 hover:text-orange-600"
          >
            Powered by Strava
          </a>
        </div>
        
        <p className="text-xs text-zinc-500 mt-4">
          We only read your activity data. Your credentials are never stored.
        </p>
      </div>
    </div>
  );
}