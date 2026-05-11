import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111] px-6 text-gray-100">
      <div className="text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
          <SearchX className="h-8 w-8 text-gray-500" />
        </div>
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-2 text-lg text-gray-400">Page not found</p>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFC000] px-5 py-2.5 text-sm font-medium text-[#111] transition-colors hover:bg-[#e6ac00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-[#333] px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1a1a1a]"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
