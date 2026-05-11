"use client";

import { useState, useEffect } from "react";
import { X, Mail, Zap, ArrowRight } from "lucide-react";

export default function NewsletterPopup(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("nci-newsletter-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (): void => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("nci-newsletter-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => handleDismiss(), 2000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-[420px] mx-4 transition-all duration-500 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-[#333] bg-[#111] shadow-2xl shadow-black/50">
          {/* Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#333] bg-[#1a1a1a]">
              <Mail className="h-6 w-6 text-[#FFC000]" />
            </div>

            <h3 className="text-xl font-semibold text-white">
              Stay in the loop
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-400">
              Get notified about new features, caching tips, and releases. No spam.
            </p>

            {submitted ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">You&apos;re on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#FFC000] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#FFC000] px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className="mt-2 text-xs text-red-400">{error}</p>
                ) : (
                  <p className="mt-3 text-[11px] text-gray-600">
                    Join 1,200+ developers. Unsubscribe anytime.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
