"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111] px-6 text-gray-100">
      <div className="text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-gray-400">
          An unexpected error occurred. Try refreshing the page or go back to the dashboard.
        </p>

        {error.digest && (
          <div className="mx-auto mt-4 max-w-md rounded-md bg-[#0a0a0a] px-3 py-2">
            <span className="text-[11px] text-gray-600">Error digest: {error.digest}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFC000] px-5 py-2.5 text-sm font-medium text-[#111] transition-colors hover:bg-[#e6ac00]"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-[#333] px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1a1a1a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
