'use client';

import { useEffect } from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-8 border border-border/20 text-center">
          {/* Error Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-20 blur-lg animate-pulse" />
            <div className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-full p-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load this book. This might be a temporary issue, please try again.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/explore" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}